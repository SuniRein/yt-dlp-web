#include "async_process.h"

#include "handle.h"  // send_log

namespace ytweb
{

void AsyncProcess::launch(Request const& request, std::function<void(std::string_view)> on_linebreak, std::function<void()> on_eof)
{
    // Reset asynchronously environment.
    io_context_.restart();
    buffer_.consume(buffer_.size());
    pipe_ = std::make_unique<bp::async_pipe>(io_context_);

    // Reset the interrupted flag.
    interrupted_ = false;

    // Call yt-dlp with the given URL and options.
    yt_dlp_process_ = std::make_unique<bp::child>(request.yt_dlp_path(), request.args(), bp::std_out > *pipe_, io_context_);

    // Set callback functions.
    on_linebreak_ = std::move(on_linebreak);
    on_eof_       = std::move(on_eof);

    // Start reading output.
    read_output();
}

void AsyncProcess::read_output()
{
    asio::async_read_until(*pipe_, buffer_, '\n',
        [this](boost::system::error_code const& ec, std::size_t bytes_transferred)
        {
            // If the process is interrupted, stop reading the output and terminate the process.
            if (interrupted_)
            {
                io_context_.stop();
                yt_dlp_process_->terminate();
                yt_dlp_process_.reset();  // Reset to nullptr for `running()`.
                return;
            }

            if (!ec)
            {
                on_linebreak_(
                    std::string(buffers_begin(buffer_.data()), buffers_begin(buffer_.data()) + bytes_transferred - 1));  // -1 to exclude '\n'
                buffer_.consume(bytes_transferred);
                read_output();  // Read the next line.
            }
            else if (ec == asio::error::eof)
            {
                on_linebreak_(std::string(buffers_begin(buffer_.data()), buffers_end(buffer_.data())));
                on_eof_();
            }
            else
            {
                send_log(nullptr, "Error: " + ec.message());
            }
        });
}

void AsyncProcess::wait()
{
    io_context_.run();
    if (yt_dlp_process_)  // `yt_dlp_process_` may be nullptr if the process is interrupted.
    {
        yt_dlp_process_->wait();
        yt_dlp_process_.reset();
    }
}

}  // namespace ytweb
