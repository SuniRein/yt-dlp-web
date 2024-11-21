#include "handle.h"

#include "boost/algorithm/string.hpp"
#include "boost/asio.hpp"
#include "boost/process.hpp"
#include "nlohmann/json.hpp"
#include "webui.hpp"

#include <iostream>

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
        // TODO(SuniRein): Implement the download action
        request.args.emplace_back("-j");
    }

    return request;
}

void run_yt_dlp_async(std::string_view yt_dlp_path, std::vector<std::string> const& args, std::function<void(std::string_view response)> on_complete)
{
    // Create asynchronously environment.
    asio::io_context io_context;
    asio::streambuf  buffer;
    bp::async_pipe   out_pipe(io_context);

    // Call yt-dlp with the given URL and options
    bp::child yt_dlp_process(std::string(yt_dlp_path), args, bp::std_out > out_pipe, io_context);

    // Read the output of yt-dlp asynchronously
    std::string response;

    std::function<void()> async_read = [&]()
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
                    on_complete(response);
                }
                else
                {
                    std::cerr << "Error: " << ec.message() << std::endl;
                    on_complete("");
                }
            });
    };
    async_read();

    io_context.run();
    yt_dlp_process.wait();
}

}  // anonymous namespace

void handle_submit_url(webui::window::event* event)
{
    auto [action, command, args] = parse_request(event->get_string_view());

    // Logging the running command
    send_log(event, "Run command: " + command + " " + boost::algorithm::join(args, " "));

    run_yt_dlp_async(command, args, [&](std::string_view responce) { event->return_string(responce); });
}

void send_log(webui::window::event* event, std::string const& message)
{
    event->get_window().run("logMessage(\"" + message + "\")");
}
