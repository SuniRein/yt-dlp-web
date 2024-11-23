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

struct Request
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
            set_download_output_format();
        }
    }

  private:
    void set_download_output_format()
    {
        // set output information
        args.emplace_back("-O");
        args.emplace_back("pre_process:Extract URL: %(webpage_url)s");

        args.emplace_back("-O");
        args.emplace_back("video:[%(extractor)s] %(id)s: %(format_id)q with format %(format)q");

        args.emplace_back("-O");
        args.emplace_back("before_dl:Start download...");

        args.emplace_back("-O");
        args.emplace_back("post_process:Finished downloading");

        args.emplace_back("-O");
        args.emplace_back("post_process:Start post processing...");

        args.emplace_back("-O");
        args.emplace_back("after_move:Finished post processing");

        args.emplace_back("-O");
        args.emplace_back("after_move:Save video to %(filepath)q");

        // show downloading progress even in quiet mode
        args.emplace_back("--progress");

        // show downloading progress in a single line
        args.emplace_back("--newline");

        // show downloading progress as json format
        args.emplace_back("--progress-template");
        args.emplace_back("download:[Progress]%(progress)j");
    }
};

class AsyncProcess
{
  public:
    static AsyncProcess& get_instance()
    {
        static AsyncProcess instance;
        return instance;
    }

    void launch(Request const& request, std::function<void(std::string_view)> on_linebreak, std::function<void()> on_eof);

    void wait();

    void interrupt() { interrupted_ = true; }

    bool running() const { return yt_dlp_process_ != nullptr; }

  private:
    AsyncProcess() = default;

    asio::io_context                io_context_;
    asio::streambuf                 buffer_;
    std::unique_ptr<bp::async_pipe> pipe_;
    std::unique_ptr<bp::child>      yt_dlp_process_;

    // callback functions when reading output
    std::function<void(std::string_view)> on_linebreak_;
    std::function<void()>                 on_eof_;

    // flag to check if the process is interrupted
    std::atomic<bool> interrupted_{};

    void read_output();
};

void AsyncProcess::launch(Request const& request, std::function<void(std::string_view)> on_linebreak, std::function<void()> on_eof)
{
    // Reset asynchronously environment
    io_context_.restart();
    buffer_.consume(buffer_.size());
    pipe_ = std::make_unique<bp::async_pipe>(io_context_);

    // Reset the interrupted flag
    interrupted_ = false;

    // Call yt-dlp with the given URL and options
    yt_dlp_process_ = std::make_unique<bp::child>(request.yt_dlp_path, request.args, bp::std_out > *pipe_, io_context_);

    // Set callback functions
    on_linebreak_ = std::move(on_linebreak);
    on_eof_       = std::move(on_eof);

    // Start reading output
    read_output();
}

void AsyncProcess::read_output()
{
    asio::async_read_until(*pipe_, buffer_, '\n',
        [this](boost::system::error_code const& ec, std::size_t bytes_transferred)
        {
            if (interrupted_)
            {
                io_context_.stop();
                yt_dlp_process_->terminate();
                yt_dlp_process_.reset();
                return;
            }

            if (!ec)
            {
                on_linebreak_(
                    std::string(buffers_begin(buffer_.data()), buffers_begin(buffer_.data()) + bytes_transferred - 1));  // -1 to exclude '\n'
                buffer_.consume(bytes_transferred);
                read_output();
            }
            else if (ec == asio::error::eof)
            {
                on_linebreak_(std::string(buffers_begin(buffer_.data()), buffers_end(buffer_.data())));
                on_eof_();
            }
            else
            {
                send_log(nullptr, "Error: " + ec.message());
            }
        });
}

void AsyncProcess::wait()
{
    io_context_.run();
    if (yt_dlp_process_)
    {
        yt_dlp_process_->wait();
        yt_dlp_process_.reset();
    }
}

}  // anonymous namespace

void handle_submit_url(webui::window::event* event)
{
    AsyncProcess& process = AsyncProcess::get_instance();

    Request request(event->get_string_view());

    // set interrupted flag
    if (request.action == Request::Action::Interrupt)
    {
        send_log(event, "Interrupt the current request.");
        process.interrupt();
        return;
    }

    // only one request can be run at a time
    if (process.running())
    {
        send_log(event, "Another request is running. Please wait.");
        return;
    }

    // Log the command that will be run
    send_log(event, "Run command: " + request.yt_dlp_path + " " + boost::algorithm::join(request.args, " "));

    std::string response;  // Put here to keep it alive until the end of the function
    if (request.action == Request::Action::Preview)
    {
        process.launch(request, [&](std::string_view line) { response += line; }, [&]() { event->return_string(response); });
    }
    else
    {
        constexpr std::string_view PROGRESS_PREFIX = "[Progress]";
        process.launch(
            request,
            [&](std::string_view line)
            {
                // progress information
                if (line.substr(0, PROGRESS_PREFIX.length()) == PROGRESS_PREFIX)
                {
                    line.remove_prefix(PROGRESS_PREFIX.size());
                    event->get_window().send_raw("showDownloadProgress", line.data(), line.size());
                }
                // other information
                else
                {
                    event->get_window().send_raw("showDownloadInfo", line.data(), line.size());
                }
            },
            [&]() { send_log(event, "Download finished."); });
    }

    process.wait();
}

void send_log(webui::window::event* event, std::string const& message)
{
    event->get_window().run("logMessage(\"" + message + "\")");
}
