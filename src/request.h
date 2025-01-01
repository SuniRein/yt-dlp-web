#pragma once

#include <memory>
#include <string>
#include <string_view>
#include <vector>

namespace ytweb
{

class Request
{
  public:
    enum class Action
    {
        Preview,
        Download,
    };

    auto action() const -> Action;
    auto yt_dlp_path() const -> std::string const&;
    auto args() const -> std::vector<std::string> const&;

    explicit Request(std::string_view json);
    ~Request();

  private:
    class Impl;
    std::unique_ptr<Impl> impl_;
};

}  // namespace ytweb
