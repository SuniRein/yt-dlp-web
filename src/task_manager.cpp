#include "task_manager.h"

namespace ytweb
{

auto TaskManager::launch(std::string const &command, std::vector<std::string> const &args, CallbackOnLinebreak on_linebreak, CallbackOnEof on_eof)
    -> TaskId
{
    TaskId task_id = next_task_id_++;

    auto task = std::make_unique<AsyncProcess>(
        command,
        args,
        [task_id, on_linebreak = std::move(on_linebreak)](std::string_view line) { on_linebreak(task_id, line); },
        [task_id, on_eof = std::move(on_eof), this]() { on_eof(task_id); });
    tasks_.emplace(task_id, std::move(task));

    return task_id;
}

void TaskManager::kill(TaskId task_id)
{
    auto it = tasks_.find(task_id);
    if (it != tasks_.end())
    {
        it->second->interrupt();
        it->second->wait();
        tasks_.erase(it);
    }
}

void TaskManager::wait(TaskId task_id)
{
    auto it = tasks_.find(task_id);
    if (it != tasks_.end())
    {
        it->second->wait();
        tasks_.erase(it);
    }
}

bool TaskManager::is_running(TaskId task_id) const
{
    auto it = tasks_.find(task_id);
    return it != tasks_.end() && it->second->running();
}

}  // namespace ytweb
