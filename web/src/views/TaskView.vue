<script setup lang="ts">
import { computed, capitalize, h } from 'vue';

import { NDataTable, NButton, NIcon, NProgress } from 'naive-ui';
import InterruptIcon from '@vicons/fluent/Stop16Regular';

import { useTasksStore } from '@/store/tasks';
import { bytesToSize } from '@/utils/show';

const tasks = useTasksStore();

const tableData = computed(() => Array.from(tasks.value.entries()).map(([id, task]) => ({ id, ...task })));
type Row = (typeof tableData.value)[0];

const tableColumns = [
    {
        title: 'ID',
        key: 'id',
    },
    {
        title: 'Type',
        key: 'type',
        render: (row: Row) => capitalize(row.type),
    },
    {
        title: 'URL',
        key: 'url',
        render: (row: Row) => row.request.url_input,
    },
    {
        title: 'Status',
        key: 'status',
        render: (row: Row) => capitalize(row.status),
    },
    {
        title: 'Progress',
        key: 'Progress',
        render(row: Row) {
            if (row.progress === undefined) {
                return '';
            }

            const progress = (row.progress.downloaded_bytes / row.progress.total_bytes) * 100;
            const progressRounded = Math.round(progress * 100) / 100; // Round to 2 decimal places

            return h(NProgress, { percentage: progressRounded });
        },
    },
    {
        title: 'Speed',
        key: 'speed',
        render(row: Row) {
            return row.progress !== undefined ? `${bytesToSize(row.progress.speed)} / s` : '';
        },
    },
    {
        title: 'Action',
        key: 'Action',
        render(row: Row) {
            return h(
                NButton,
                {
                    text: true,
                    onClick: () => webui.handleInterrupt(row.id),
                },
                {
                    default: () => h(NIcon, { component: InterruptIcon }),
                },
            );
        },
    },
];
</script>

<template>
    <NDataTable :columns="tableColumns" :data="tableData" />
</template>
