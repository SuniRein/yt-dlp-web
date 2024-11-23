#pragma once

#include <atomic>
#include <functional>
#include <memory>
#include <string_view>

#include "boost/asio.hpp"
#include "boost/process.hpp"

#include "request.h"

namespace ytweb
{

namespace bp   = boost::process;
namespace asio = boost::asio;

class AsyncProcess
{
  public:
    static AsyncProcess& get_instance()
    {
        static AsyncProcess instance;
        return instance;
    }

    void launch(Request const& request, std::function<void(std::string_view)> on_linebreak, std::function<void()> on_eof);

    void wait();

    void interrupt() { interrupted_ = true; }

    bool running() const { return yt_dlp_process_ != nullptr; }

  private:
    AsyncProcess() = default;

    asio::io_context                io_context_;
    asio::streambuf                 buffer_;
    std::unique_ptr<bp::async_pipe> pipe_;
    std::unique_ptr<bp::child>      yt_dlp_process_;

    // callback functions when reading output
    std::function<void(std::string_view)> on_linebreak_;
    std::function<void()>                 on_eof_;

    // flag that indicates the process is interrupted
    std::atomic<bool> interrupted_{};

    // Allocate a task in `io_context` to read a line.
    // If there is no error, call `on_linebreak_` and read the next line.
    // When the end of the stream is reached, call `on_eof_`.
    // When `interrupted_` is set, stop reading the output and terminate the process.
    void read_output();
};

}  // namespace ytweb
