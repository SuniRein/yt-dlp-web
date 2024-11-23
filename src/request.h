#pragma once

#include <string>
#include <string_view>
#include <vector>

namespace ytweb
{

struct Request
{
    enum class Action
    {
        Preview,
        Download,
        Interrupt,
    } action{};

    std::string yt_dlp_path;

    std::vector<std::string> args;

    // Take a JSON string and parse it to initialize.
    explicit Request(std::string_view json);
};

}  // namespace ytweb
