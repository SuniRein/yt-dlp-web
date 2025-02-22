#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <string_view>
#include <vector>

namespace ytweb
{

class Request
{
  public:
    enum class Action : std::uint8_t
    {
        Preview,
        Download,
    };

    auto action() const -> Action;
    auto yt_dlp_path() const -> std::string_view;
    auto args() const -> std::vector<std::string> const&;

    explicit Request(std::string_view json);
    ~Request();

    Request(Request const&);
    Request& operator=(Request const&);

    Request(Request&&) = default;
    Request& operator=(Request&&) = default;

  private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace ytweb
