#pragma once

#include <format>
#include <stdexcept>

namespace ytweb
{

class ParseError : public std::runtime_error
{
  public:
    using std::runtime_error::runtime_error;

    template <typename... Args>
    explicit ParseError(std::format_string<Args...> format, Args&&... args)
        : std::runtime_error(std::format(format, std::forward<Args>(args)...))
    {
    }
};

class PathError : public std::runtime_error
{
  public:
    using std::runtime_error::runtime_error;
    template <typename... Args>
    explicit PathError(std::format_string<Args...> format, Args&&... args)
        : std::runtime_error(std::format(format, std::forward<Args>(args)...))
    {
    }
};

} // namespace ytweb
