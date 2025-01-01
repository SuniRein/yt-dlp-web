#pragma once

#include <atomic>
#include <functional>
#include <memory>
#include <string_view>

#include "boost/asio/io_context.hpp"
#include "boost/asio/readable_pipe.hpp"
#include "boost/process/v2/process.hpp"

namespace ytweb
{

namespace bp   = boost::process;
namespace asio = boost::asio;

class AsyncProcess
{
  public:
    using CallbackOnLinebreak = std::function<void(std::string_view)>;
    using CallbackOnEof       = std::function<void()>;

    // Launch a process with the given request.
    AsyncProcess(std::string const&           path,
        std::vector<std::string> const&       args,
        std::function<void(std::string_view)> on_linebreak,
        std::function<void()>                 on_eof);

    // Wait for the process to finish before destruction.
    ~AsyncProcess() { wait(); }

    // Disable copy and move operations.
    AsyncProcess(AsyncProcess const&)                = delete;
    AsyncProcess& operator=(AsyncProcess const&)     = delete;
    AsyncProcess(AsyncProcess&&) noexcept            = delete;
    AsyncProcess& operator=(AsyncProcess&&) noexcept = delete;

    // Block until the process is finished.
    void wait();

    // Send a signal to interrupt the process.
    // Note: you should call `wait()` after `interrupt()` to make sure the process is terminated properly.
    void interrupt() { interrupted_ = true; }

    // Check if the process is running.
    bool running() const { return process_ != nullptr; }

  private:
    asio::io_context             io_context_;
    std::vector<char>            buffer_;
    asio::readable_pipe          pipe_{io_context_};
    std::unique_ptr<bp::process> process_;

    // callback functions when reading output
    CallbackOnLinebreak on_linebreak_;
    CallbackOnEof       on_eof_;

    // flag that indicates the process is interrupted
    std::atomic<bool> interrupted_{false};

    // Allocate a task in `io_context` to read a line.
    // If there is no error, call `on_linebreak_` and read the next line.
    // When the end of the stream is reached, call `on_eof_`.
    // When `interrupted_` is set, stop reading the output and terminate the process.
    void read_output();
};

}  // namespace ytweb
