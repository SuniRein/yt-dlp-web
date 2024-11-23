#include "handle.h"

#include "boost/algorithm/string/join.hpp"
#include "webui.hpp"

#include "async_process.h"
#include "request.h"

namespace ytweb
{

using ytweb::AsyncProcess;
using ytweb::Request;

void handle_submit_url(webui::window::event* event)
{
    AsyncProcess& process = AsyncProcess::get_instance();

    Request request(event->get_string_view());

    if (request.action == Request::Action::Interrupt)
    {
        send_log(event, "Interrupt the current request.");
        process.interrupt();
        return;
    }

    // Only one request can be run at a time.
    if (process.running())
    {
        send_log(event, "Another request is running. Please wait.");
        return;
    }

    // Log the command that will be run.
    send_log(event, "Run command: " + request.yt_dlp_path + " " + boost::algorithm::join(request.args, " "));

    std::string response;  // Put here to keep it alive until the end of the function.
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

}  // namespace ytweb
