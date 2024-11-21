#include "handle.h"

#include "boost/algorithm/string.hpp"
#include "boost/asio.hpp"
#include "boost/process.hpp"
#include "nlohmann/json.hpp"
#include "webui.hpp"

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
    } action{};

    std::string yt_dlp_path;

    std::vector<std::string> args;
};

Request parse_request(std::string_view json)
{
    Request request;

    // parse the JSON data
    auto data = Json::parse(json);

    // if yt_dlp_path is not provided, run yt-dlp from the PATH
    request.yt_dlp_path = data.value("yt_dlp_path", "yt-dlp");

    request.action = data.at("action") == "preview" ? Request::Action::Preview : Request::Action::Download;

    std::string url_input   = data.at("url_input");
    bool        audio_only  = data.value("audio_only", false);
    std::string quality     = data.value("quality", "");
    std::string output_path = data.value("output_path", "");

    // generate arguments for yt-dlp
    request.args.push_back(url_input);

    if (request.action == Request::Action::Preview)
    {
        request.args.emplace_back("-j");
    }
    else
    {
        // set downloading progress shown in a new line
        request.args.emplace_back("--newline");

        // set downloading progress as json format
        request.args.emplace_back("--progress-template");
        request.args.emplace_back("download:[YT-DLP-UI-download] %(progress)j");
    }

    return request;
}

void run_yt_dlp_async(webui::window::event* event, Request const& request)
{
    // Create asynchronously environment.
    asio::io_context io_context;
    asio::streambuf  buffer;
    bp::async_pipe   out_pipe(io_context);

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
}

}  // anonymous namespace

void handle_submit_url(webui::window::event* event)
{
    auto request = parse_request(event->get_string_view());
    send_log(event, "Run command: " + request.yt_dlp_path + " " + boost::algorithm::join(request.args, " "));
    run_yt_dlp_async(event, request);
}

void send_log(webui::window::event* event, std::string const& message)
{
    event->get_window().run("logMessage(\"" + message + "\")");
}
