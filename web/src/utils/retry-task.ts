import { useTasksStore, type Task } from '@/store/tasks';
import { useNotification } from '@/utils/notification';

export async function retryTask(id: Task['id']) {
    const tasks = useTasksStore();

    const task = tasks.value.get(id);
    if (!task) {
        return;
    }

    tasks.remove(id);

    const newId = parseInt(await webui.handleRequest(JSON.stringify({ ...task.request, action: task.type })));
    tasks.append({ ...task, id: newId });

    useNotification().info({
        title: `Task ${id} has been retried.`,
        description: `New task ID: ${newId}`,
        duration: 3000,
        keepAliveOnHover: true,
    });
}
