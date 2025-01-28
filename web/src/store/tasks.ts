import { defineStore } from 'pinia';
import { ref } from 'vue';

type Request = Record<string, string | string[]>;

export const taskStatus = ['running', 'done', 'error', 'interrupted'] as const;
export const taskTypes = ['preview', 'download'] as const;

export type TaskStatus = (typeof taskStatus)[number];
export type TaskType = (typeof taskTypes)[number];

export interface DownloadProgress {
    downloaded_bytes: number;
    total_bytes: number;
    filename: string;
    status: string;
    elapsed: number;
    ctx_id: number | null;
    speed: number;
}

export interface Task {
    id: number;
    type: 'download' | 'preview';
    status: TaskStatus;
    request: Request;
    progress?: Omit<DownloadProgress, 'task_id'>;
}

export const useTasksStore = defineStore('tasks', () => {
    const value = ref<Map<Task['id'], Omit<Task, 'id'>>>(new Map());

    function append(task: Task) {
        value.value.set(task.id, task);
    }

    function remove(id: Task['id']) {
        value.value.delete(id);
    }

    function setStatus(id: Task['id'], status: TaskStatus) {
        const task = value.value.get(id);
        if (task) {
            task.status = status;
        }
    }

    function setProgress(id: Task['id'], progress: DownloadProgress) {
        const task = value.value.get(id);
        if (task && task.type === 'download') {
            task.progress = progress;
        }
    }

    return {
        value,
        append,
        remove,
        setStatus,
        setProgress,
    };
});
