#include "app.h"

#include "boost/algorithm/string/join.hpp"
#include "request.h"
#include "task_manager.h"
#include "webui.hpp"

#include <filesystem>
#include <format>
#include <thread>

namespace ytweb
{

namespace fs = std::filesystem;

static fs::path const INDEX_PATH = YT_DLP_WEB_PATH;

using TaskId = TaskManager::TaskId;

void App::handle_request(webui::window::event* event)
{
    Request request(event->get_string_view());

    send_log("Run command: {} {}", request.yt_dlp_path(), boost::algorithm::join(request.args(), " "));

    TaskId task{};

    if (request.action() == Request::Action::Preview)
    {
        auto response = std::make_shared<std::string>();

        task = manager_.launch(
            request.yt_dlp_path(), request.args(),
            [response](TaskId /* id */, std::string_view line) { response->append(line); },
            [response, this](TaskId /* id */) { show_preview_info(*response); }
        );
    }
    else
    {
        constexpr std::string_view PROGRESS_PREFIX = "[Progress]";

        task = manager_.launch(
            request.yt_dlp_path(), request.args(),
            [&](TaskId /* id */, std::string_view line) {
                if (line.starts_with(PROGRESS_PREFIX))
                {
                    line.remove_prefix(PROGRESS_PREFIX.size());
                    show_download_progress(line);
                }
                else
                {
                    show_download_info(line);
                }
            },
            [&](TaskId /* id */) { send_log("Download completed."); }
        );
    }

    // Use a detached thread so that the thread id can be returned immediately.
    std::thread{[this, task] { manager_.wait(task); }}.detach();

    event->return_int(task);
}

void App::handle_interrupt(webui::window::event* event)
{
    auto task = static_cast<TaskId>(event->get_int());
    send_log("Interrupt task {}", task);
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

void App::show_download_progress(std::string_view data)
{
    window_.send_raw("showDownloadProgress", data.data(), data.size());
}

void App::show_download_info(std::string_view data)
{
    window_.send_raw("showDownloadInfo", data.data(), data.size());
}

void App::show_preview_info(std::string_view data)
{
    window_.send_raw("showPreviewInfo", data.data(), data.size());
}

} // namespace ytweb
