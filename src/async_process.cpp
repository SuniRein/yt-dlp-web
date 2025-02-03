#include "async_process.h"

#include "boost/asio/read_until.hpp"
#include "boost/process/v2/stdio.hpp"

namespace ytweb
{

AsyncProcess::AsyncProcess(
    std::string_view path, std::vector<std::string> const& args, CallbackOnLinebreak on_linebreak, CallbackOnEof on_eof
)
    : process_(std::make_unique<bp::process>(io_context_, path, args, bp::process_stdio{.out = pipe_})),
      on_linebreak_(std::move(on_linebreak)),
      on_eof_(std::move(on_eof))
{
    read_output();
}

void AsyncProcess::read_output()
{
    asio::async_read_until(
        pipe_, asio::dynamic_buffer(buffer_), '\n',
        [this](boost::system::error_code ec, std::size_t bytes_transferred) {
            if (interrupted_)
            {
                io_context_.stop();
                process_->terminate();
                process_.reset();
                return;
            }

            if (!ec)
            {
                on_linebreak_(std::string_view(buffer_.begin(), buffer_.begin() + bytes_transferred - 1)
                ); // -1 to exclude '\n'

                buffer_.erase(buffer_.begin(), buffer_.begin() + bytes_transferred);
                read_output(); // Read the next line.
            }
            else if (ec == asio::error::eof)
            {
                on_linebreak_(std::string_view(buffer_.begin(), buffer_.end()));
                on_eof_();
            }
        }
    );
}

void AsyncProcess::wait()
{
    if (process_)
    {
        io_context_.run();
        if (process_)
        {
            process_->wait();
            process_.reset();
        }
    }
}

} // namespace ytweb
