#include "app.h"

#include <filesystem>
#include <thread>

#include "boost/algorithm/string/join.hpp"
#include "task_manager.h"
#include "webui.hpp"

#include "request.h"

namespace ytweb
{

namespace fs = std::filesystem;

static fs::path const INDEX_PATH = YT_DLP_WEB_PATH;

using TaskId = TaskManager::TaskId;

void App::handle_request(webui::window::event* event)
{
    Request request(event->get_string_view());

    send_log("Run command: " + request.yt_dlp_path() + " " + boost::algorithm::join(request.args(), " "));

    TaskId      task{};
    std::string response;  // Put here to keep it alive until the end of the function.

    if (request.action() == Request::Action::Preview)
    {
        task = manager_.launch(
            request.yt_dlp_path(),
            request.args(),
            [&](TaskId /* id */, std::string_view line) { response += line; },
            [&](TaskId /* id */) { show_preview_info(response.data(), response.size()); });
    }
    else
    {
        constexpr std::string_view PROGRESS_PREFIX = "[Progress]";

        task = manager_.launch(
            request.yt_dlp_path(),
            request.args(),
            [&](TaskId /* id */, std::string_view line)
            {
                if (line.substr(0, PROGRESS_PREFIX.length()) == PROGRESS_PREFIX)
                {
                    line.remove_prefix(PROGRESS_PREFIX.size());
                    show_download_progress(line.data(), line.size());
                }
                else
                {
                    show_download_info(line.data(), line.size());
                }
            },
            [&](TaskId /* id */) { send_log("Download completed."); });
    }

    // Use a detached thread so that the thread id can be returned immediately.
    std::thread{[this, task] { manager_.wait(task); }}.detach();

    event->return_int(task);
}

void App::handle_interrupt(webui::window::event* event)
{
    auto task = static_cast<TaskId>(event->get_int());
    send_log("Interrupt task " + std::to_string(task));
    manager_.kill(task);
}

void App::init()
{
    // Check if the index.html file exists.
    if (!fs::exists(INDEX_PATH) || !fs::is_directory(INDEX_PATH))
    {
        throw std::runtime_error("Path not exist: " + INDEX_PATH.string());
    }
    if (!fs::exists(INDEX_PATH / "index.html") || !fs::is_regular_file(INDEX_PATH / "index.html"))
    {
        throw std::runtime_error("index.html not exist in: " + INDEX_PATH.string());
    }

    window_.set_root_folder(INDEX_PATH.string());

    window_.bind("handleRequest", [](webui::window::event* event) { App::instance().handle_request(event); });
    window_.bind("handleInterrupt", [](webui::window::event* event) { App::instance().handle_interrupt(event); });
}

void App::run()
{
    window_.show_browser("index.html", AnyBrowser);
    webui::wait();
}

void App::send_log(std::string const& message)
{
    window_.run("logMessage(\"" + message + "\");");
}

void App::show_download_progress(char const* data, std::size_t size)
{
    window_.send_raw("showDownloadProgress", data, size);
}

void App::show_download_info(char const* data, std::size_t size)
{
    window_.send_raw("showDownloadInfo", data, size);
}

void App::show_preview_info(char const* data, std::size_t size)
{
    window_.send_raw("showPreviewInfo", data, size);
}

}  // namespace ytweb
