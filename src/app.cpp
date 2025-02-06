#include "app.h"

#include "boost/algorithm/string/join.hpp"
#include "exception.h"
#include "nlohmann/json.hpp"
#include "request.h"
#include "task_manager.h"
#include "webui.hpp"

#include <filesystem>
#include <format>
#include <optional>
#include <thread>

namespace ytweb
{

namespace fs = std::filesystem;

static fs::path const INDEX_PATH = YT_DLP_WEB_PATH;

using Json = nlohmann::json;

using TaskId = TaskManager::TaskId;

void App::handle_request(webui::window::event* event)
{
    logger_.debug("Received request: {}", event->get_string_view());

    std::optional<Request> request;
    try
    {
        request.emplace(event->get_string_view());
    }
    catch (ParseError const& e)
    {
        logger_.error("Error parsing request: {}", e.what());
        return;
    }

    TaskId task{};

    if (request->action() == Request::Action::Preview)
    {
        auto response = std::make_shared<std::string>();

        task = manager_.launch(
            request->yt_dlp_path(), request->args(),
            [response](TaskId /* id */, std::string_view line) { response->append(line); },
            [response, this](TaskId id) {
                logger_.info("[Task {}] Preview completed.", id);
                show_preview_info(*response);
                report_completion(id);
            }
        );
    }
    else
    {
        task = manager_.launch(
            request->yt_dlp_path(), request->args(),
            [this](TaskId id, std::string_view line) {
                constexpr std::string_view PROGRESS_PREFIX = "[Progress]";

                if (line.starts_with(PROGRESS_PREFIX))
                {
                    line.remove_prefix(PROGRESS_PREFIX.size());

                    try
                    {
                        auto progress = Json::parse(line);
                        progress["task_id"] = id;

                        show_download_progress(progress.dump());
                    }
                    catch (Json::parse_error const& e)
                    {
                        logger_.error("[Task {}] Error parsing downloading progress: {}", id, e.what());
                    }
                }
                else
                {
                    if (!line.empty())
                    {
                        logger_.debug("[Task {}] {}", id, line);
                        show_download_info(line);
                    }
                }
            },
            [this](TaskId id) {
                logger_.info("[Task {}] Download completed.", id);
                report_completion(id);
            }
        );
    }

    logger_.info("[Task {}] Successfully parsed request.", task);
    logger_.debug(
        "[Task {}] Run command: {} {}", task, request->yt_dlp_path(), boost::algorithm::join(request->args(), " ")
    );

    // Use a detached thread so that the thread id can be returned immediately.
    std::thread{[this, task] { manager_.wait(task); }}.detach();

    event->return_int(task);
}

void App::handle_interrupt(webui::window::event* event)
{
    auto task = static_cast<TaskId>(event->get_int());
    logger_.info("[Task {}] Received interrupt request.", task);

    if (manager_.is_running(task))
    {
        manager_.kill(task);

        logger_.info("[Task {}] Interrupted.", task);
        report_interruption(task);
    }
    else
    {
        logger_.info("[Task {}] The task is not running, so it can't be interrupted.", task);
    }
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
    window_.show_browser("index.html", static_cast<unsigned int>(runtime_));
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

void App::report_completion(TaskId id)
{
    window_.run(std::format(R"js(reportCompletion({}))js", id));
}

void App::report_interruption(TaskId id)
{
    window_.run(std::format(R"js(reportInterruption({}))js", id));
}

} // namespace ytweb
