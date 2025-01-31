#pragma once

#include "task_manager.h"
#include "webui.hpp"

#include <format>

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

  private:
    App() = default;

    webui::window window_;

    TaskManager manager_;

    // Frontend functions
    template <typename... Args>
    void send_log(std::format_string<Args...> format, Args&&... args)
    {
        auto message = std::format(format, std::forward<Args>(args)...);
        window_.run(std::format(R"(logMessage("{}"))", message));
    }

    void show_download_progress(std::string_view data);
    void show_download_info(std::string_view data);
    void show_preview_info(std::string_view data);

    void report_completion(TaskManager::TaskId id);
    void report_interruption(TaskManager::TaskId id);

    void handle_interrupt(webui::window::event* event);
    void handle_request(webui::window::event* event);
};

} // namespace ytweb
