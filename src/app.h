#pragma once

#include "webui.hpp"

#include "task_manager.h"

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
    void send_log(std::string const& message);
    void show_download_progress(char const* data, std::size_t size);
    void show_download_info(char const* data, std::size_t size);
    void show_preview_info(char const* data, std::size_t size);

    void handle_interrupt(webui::window::event* event);
    void handle_request(webui::window::event* event);
};

}  // namespace ytweb
