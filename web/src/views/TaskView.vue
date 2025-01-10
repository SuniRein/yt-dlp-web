<script setup lang="ts">
import { computed, capitalize, h } from 'vue';
import { useTasksStore, type TaskStatus } from '@/store/tasks';
import { NDataTable, NButton, NIcon } from 'naive-ui';
import InterruptIcon from '@vicons/fluent/Stop16Regular';

const tasks = useTasksStore();

interface TaskRow {
    ID: number;
    Description: string;
    Status: Capitalize<TaskStatus>;
}

const tableColumns = [
    ...['ID', 'Description', 'Status'].map((key) => ({ key, title: key })),
    {
        title: 'Action',
        key: 'Action',
        render(row: TaskRow) {
            return h(
                NButton,
                {
                    text: true,
                    onClick: () => webui.handleInterrupt(row.ID),
                },
                {
                    default: () => h(NIcon, { component: InterruptIcon }),
                },
            );
        },
    },
];

const tableData = computed<TaskRow[]>(() =>
    Array.from(tasks.value.entries()).map(([id, task]) => {
        return {
            ID: id,
            Description: `${task.request.action}: ${task.request.url_input}`,
            Status: capitalize(task.status),
        };
    }),
);
</script>

<template>
    <NDataTable :columns="tableColumns" :data="tableData" />
</template>
