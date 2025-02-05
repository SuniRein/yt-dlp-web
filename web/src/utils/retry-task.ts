import { useTasksStore, type Task } from '@/store/tasks';
import { useNotification } from '@/utils/notification';
import { useLogStore } from '@/store/log';

export async function retryTask(id: Task['id']) {
    const log = useLogStore();
    const tasks = useTasksStore();

    const task = tasks.value.get(id);
    if (!task) {
        log.log('warning', `Try to retry task ${id}, but not found.`);
        return;
    }

    tasks.remove(id);

    const newId = parseInt(await webui.handleRequest(JSON.stringify({ ...task.request, action: task.type })));
    tasks.append({ ...task, id: newId, status: 'running' });

    log.log('info', `Retried task ${id} -> task ${newId}.`);

    useNotification().info({
        title: `Task ${id} has been retried.`,
        description: `New task ID: ${newId}`,
        duration: 3000,
        keepAliveOnHover: true,
    });
}
