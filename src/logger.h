#pragma once

#include "nlohmann/json.hpp"
#include "webui.hpp"

#include <format>
#include <string_view>

namespace ytweb
{

using Json = nlohmann::json;

class Logger
{
  public:
    explicit Logger(webui::window& window) : window_(&window)
    {
    }

    template <typename... Args>
    void debug(std::format_string<Args...> format, Args&&... args)
    {
        log("debug", format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    void info(std::format_string<Args...> format, Args&&... args)
    {
        log("info", format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    void warning(std::format_string<Args...> format, Args&&... args)
    {
        log("warning", format, std::forward<Args>(args)...);
    }

    template <typename... Args>
    void error(std::format_string<Args...> format, Args&&... args)
    {
        log("error", format, std::forward<Args>(args)...);
    }

  private:
    webui::window* window_;

    template <typename... Args>
    void log(std::string_view level, std::format_string<Args...> format, Args&&... args)
    {
        Json json;
        json.emplace("level", level);
        json.emplace("message", std::format(format, std::forward<Args>(args)...));

        std::string raw = json.dump();
        window_->send_raw("logMessage", raw.data(), raw.size());
    }
};

} // namespace ytweb
