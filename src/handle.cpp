#include "handle.h"

#include "boost/algorithm/string.hpp"
#include "boost/asio.hpp"
#include "boost/process.hpp"
#include "nlohmann/json.hpp"
#include "webui.hpp"

#include <atomic>
#include <functional>

using Json = nlohmann::json;

namespace bp   = boost::process;
namespace asio = boost::asio;

namespace
{

class RequestHandler
{
  public:
    static RequestHandler& get_instance()
    {
        static RequestHandler instance;
        return instance;
    }

    void handle(webui::window::event* event);

  private:
    RequestHandler() = default;

    // Parse the received request
    struct Request;

    std::atomic_flag running_{};
    std::atomic_flag interrupted_{};

    bool check_interrupt(webui::window::event* event, asio::io_context& io_context, bp::child& yt_dlp_process);
    void run_yt_dlp(webui::window::event* event, Request const& request);
};

struct RequestHandler::Request
{
    enum class Action
    {
        Preview,
        Download,
        Interrupt,
    } action{};

    std::string yt_dlp_path;

    std::vector<std::string> args;

    explicit Request(std::string_view json)
    {
        // parse the JSON data
        auto data = Json::parse(json);

        // if yt_dlp_path is not provided, run yt-dlp from the PATH
        yt_dlp_path = data.value("yt_dlp_path", "yt-dlp");

        std::string action_str = data.at("action");

        // if action is "interrupt", other fields are not needed
        if (action_str == "interrupt")
        {
            action = Action::Interrupt;
            return;
        }

        action = action_str == "preview" ? Action::Preview : Action::Download;

        std::string url_input   = data.at("url_input");
        bool        audio_only  = data.value("audio_only", false);
        std::string quality     = data.value("quality", "");
        std::string output_path = data.value("output_path", "");

        // generate arguments for yt-dlp
        args.push_back(url_input);

        if (action == Request::Action::Preview)
        {
            args.emplace_back("-j");
        }
        else
        {
            // set downloading progress shown in a new line
            args.emplace_back("--newline");

            // set downloading progress as json format
            args.emplace_back("--progress-template");
            args.emplace_back("download:[YT-DLP-UI-download] %(progress)j");
        }
    }
};

void RequestHandler::handle(webui::window::event* event)
{
    Request request(event->get_string_view());

    // set interrupted flag
    if (request.action == Request::Action::Interrupt)
    {
        interrupted_.test_and_set();
        return;
    }

    // only one request can be run at a time
    if (running_.test_and_set())
    {
        send_log(event, "Another request is running. Please wait.");
        return;
    }

    run_yt_dlp(event, request);
}

bool RequestHandler::check_interrupt(webui::window::event* event, asio::io_context& io_context, bp::child& yt_dlp_process)
{
    if (interrupted_.test_and_set())
    {
        io_context.stop();
        yt_dlp_process.terminate();
        send_log(event, "Interrupted the current request.");
        interrupted_.clear();
        return true;
    }
    interrupted_.clear();
    return false;
}

void RequestHandler::run_yt_dlp(webui::window::event* event, Request const& request)
{
    // Set flags
    running_.test_and_set();
    interrupted_.clear();

    // Log the command that will be run
    send_log(event, "Run command: " + request.yt_dlp_path + " " + boost::algorithm::join(request.args, " "));

    // Create asynchronously environment.
    asio::io_context io_context;
    asio::streambuf  buffer;
    bp::async_pipe   out_pipe{io_context};

    // Call yt-dlp with the given URL and options
    bp::child yt_dlp_process(request.yt_dlp_path, request.args, bp::std_out > out_pipe, io_context);

    // Read the output of yt-dlp asynchronously
    std::function<void()> async_read;

    std::string response;

    if (request.action == Request::Action::Preview)
    {
        async_read = [&]()
        {
            asio::async_read(out_pipe, buffer,
                [&](boost::system::error_code const& ec, std::size_t bytes_transferred)
                {
                    if (check_interrupt(event, io_context, yt_dlp_process))
                    {
                        return;
                    }

                    if (!ec)
                    {
                        response += std::string(buffers_begin(buffer.data()), buffers_begin(buffer.data()) + bytes_transferred);
                        buffer.consume(bytes_transferred);
                        async_read();
                    }
                    else if (ec == asio::error::eof)
                    {
                        response += std::string(buffers_begin(buffer.data()), buffers_end(buffer.data()));
                        buffer.consume(bytes_transferred);
                        event->return_string(response);
                    }
                    else
                    {
                        send_log(event, "Error: " + ec.message());
                    }
                });
        };
    }
    else
    {
        constexpr std::string_view DOWNLOAD_PREFIX = "[YT-DLP-UI-download]";

        async_read = [&]()
        {
            asio::async_read_until(out_pipe, buffer, '\n',
                [&](boost::system::error_code const& ec, std::size_t bytes_transferred)
                {
                    if (check_interrupt(event, io_context, yt_dlp_process))
                    {
                        return;
                    }

                    if (!ec)
                    {
                        response = std::string(buffers_begin(buffer.data()), buffers_begin(buffer.data()) + bytes_transferred);
                        buffer.consume(bytes_transferred);
                        if (boost::algorithm::starts_with(response, DOWNLOAD_PREFIX.data()))
                        {
                            // +1 to skip the space after the prefix
                            response = response.substr(DOWNLOAD_PREFIX.size() + 1);
                            event->get_window().send_raw("showDownloadProgress", response.data(), response.size());
                        }
                        async_read();
                    }
                    else if (ec == asio::error::eof)
                    {
                        buffer.consume(bytes_transferred);
                        event->return_bool(true);
                    }
                    else
                    {
                        send_log(event, "Error: " + ec.message());
                    }
                });
        };
    }
    async_read();

    io_context.run();
    yt_dlp_process.wait();

    // Reset the running flag
    running_.clear();
}

}  // anonymous namespace

void handle_submit_url(webui::window::event* event)
{
    RequestHandler& handler = RequestHandler::get_instance();
    handler.handle(event);
}

void send_log(webui::window::event* event, std::string const& message)
{
    event->get_window().run("logMessage(\"" + message + "\")");
}
