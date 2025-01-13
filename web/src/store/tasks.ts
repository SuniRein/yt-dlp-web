import { defineStore } from 'pinia';
import { ref } from 'vue';

type Request = Record<string, string | string[]>;

export const taskStatus = ['running', 'done', 'error'] as const;

export type TaskStatus = (typeof taskStatus)[number];

export interface Task {
    id: number;
    request: Request;
    status: TaskStatus;
}

export const useTasksStore = defineStore('tasks', () => {
    const value = ref<Map<Task['id'], Omit<Task, 'id'>>>(new Map());

    function append(task: Task) {
        value.value.set(task.id, task);
    }

    function setStatus(id: Task['id'], status: TaskStatus) {
        const task = value.value.get(id);
        if (task) {
            task.status = status;
        }
    }

    return {
        value,
        append,
        setStatus,
    };
});
