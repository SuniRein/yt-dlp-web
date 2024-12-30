#pragma once

#include <atomic>
#include <cstddef>
#include <map>
#include <memory>

#include "async_process.h"

namespace ytweb
{

class TaskManager
{
  public:
    using TaskId = std::size_t;

    using CallbackOnLinebreak = std::function<void(TaskId id, std::string_view line)>;
    using CallbackOnEof       = std::function<void(TaskId id)>;

    [[nodiscard("Use the return value to manage the task")]]
    TaskId launch(std::string const &command, std::vector<std::string> const &args, CallbackOnLinebreak on_linebreak, CallbackOnEof on_eof);

    void kill(TaskId id);
    void wait(TaskId id);
    bool is_running(TaskId id) const;

  private:
    std::atomic<TaskId> next_task_id_{0};

    std::map<TaskId, std::unique_ptr<AsyncProcess>> tasks_;
};

}  // namespace ytweb
