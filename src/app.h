#pragma once

#include "logger.h"
#include "runtime.h"
#include "task_manager.h"
#include "webui.hpp"

#include <filesystem>

namespace ytweb
{

class App
{
  public:
    static App& instance()
    {
        static App app;
        return app;
    }

    void init();
    void run();

    void set_runtime(Runtime runtime)
    {
        runtime_ = runtime;
    }

    void set_server_dir(std::filesystem::path const& server_dir);

  private:
    App() = default;

    Runtime runtime_{Runtime::Webview};

    webui::window window_;

    TaskManager manager_;

    Logger logger_{window_};

    void show_download_progress(std::string_view data);
    void show_download_info(std::string_view data);
    void show_preview_info(std::string_view data);

    void report_completion(TaskManager::TaskId id);
    void report_interruption(TaskManager::TaskId id);

    void handle_interrupt(webui::window::event* event);
    void handle_request(webui::window::event* event);
};

} // namespace ytweb
