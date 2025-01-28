<script setup lang="ts">
import { computed, capitalize, h, ref } from 'vue';

import { NDataTable, NButton, NSwitch, NIcon, NProgress, NTag, NTooltip, NModal, NGrid, NGi, NEmpty } from 'naive-ui';
import InterruptIcon from '@vicons/fluent/Stop16Regular';
import DetailIcon from '@vicons/fluent/ChevronRight16Regular';
import RetryIcon from '@vicons/fluent/ArrowClockwise16Regular';

import { useTasksStore } from '@/store/tasks';
import { bytesToSize } from '@/utils/show';

const tasks = useTasksStore();

const showPreviewTasks = ref(__DEV__);

const tableData = computed(() => {
    const data = Array.from(tasks.value.entries()).map(([id, task]) => ({ id, ...task }));
    return showPreviewTasks.value ? data : data.filter((task) => task.type === 'download');
});
type Row = (typeof tableData.value)[0];

function renderStatus(status: Row['status']) {
    const typeMap = {
        running: 'info',
        done: 'success',
        error: 'error',
        interrupted: 'warning',
    } as const;

    return h(NTag, { type: typeMap[status], round: true, bordered: false }, { default: () => capitalize(status) });
}

function renderType(type: Row['type']) {
    const typeMap = {
        download: 'success',
        preview: 'warning',
    } as const;

    return h(NTag, { type: typeMap[type], round: true, bordered: false }, { default: () => capitalize(type) });
}

function renderInterruptButton(row: Row) {
    return h(
        NTooltip,
        {},
        {
            trigger: () =>
                h(
                    NButton,
                    {
                        text: true,
                        style: { fontSize: '16px', color: 'red' },
                        disabled: row.status !== 'running',
                        onClick: () => webui.handleInterrupt(row.id),
                    },
                    { default: () => h(NIcon, { component: InterruptIcon }) },
                ),
            default: () => 'Interrupt',
        },
    );
}

function renderRetryIcon(row: Row) {
    return h(
        NTooltip,
        {},
        {
            trigger: () =>
                h(
                    NButton,
                    {
                        text: true,
                        style: { fontSize: '16px', color: 'green' },
                        disabled: row.status !== 'error' && row.status !== 'interrupted',
                        onClick: () => console.log('retry', row.id),
                    },
                    { default: () => h(NIcon, { component: RetryIcon }) },
                ),
            default: () => 'Retry',
        },
    );
}

function renderAction(row: Row) {
    return h('div', {}, [renderInterruptButton(row), renderRetryIcon(row)]);
}

const tableColumns = computed(() => [
    {
        title: 'ID',
        key: 'id',
    },
    ...(showPreviewTasks.value
        ? [
              {
                  title: 'Type',
                  key: 'type',
                  render: (row: Row) => renderType(row.type),
              },
          ]
        : []),
    {
        title: 'URL',
        key: 'url',
        render: (row: Row) => row.request.url_input,
    },
    {
        title: 'Status',
        key: 'status',
        render: (row: Row) => renderStatus(row.status),
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

            return h(NProgress, { percentage: progressRounded, indicatorPlacement: 'inside' });
        },
    },
    {
        title: 'Speed',
        key: 'speed',
        render(row: Row) {
            return row.progress !== undefined ? `${bytesToSize(row.progress.speed)}/s` : '';
        },
    },
    {
        title: 'Action',
        key: 'action',
        render: (row: Row) => renderAction(row),
    },
    {
        title: '',
        key: 'details',
        render(row: Row) {
            return h(
                NButton,
                {
                    text: true,
                    style: { fontSize: '24px' },
                    onClick: () => (activedTaskId.value = row.id),
                },
                {
                    default: () => h(NIcon, { component: DetailIcon }),
                },
            );
        },
        width: 24,
    },
]);

const activedTaskId = ref<number | null>(null);
const activedTask = computed(() => tasks.value.get(activedTaskId.value ?? 0));

function closeTaskDetails() {
    activedTaskId.value = null;
}

const taskDetails = computed(() => {
    if (activedTaskId.value === null || !activedTask.value) {
        return [];
    }

    const details = [
        ...(showPreviewTasks.value
            ? [
                  {
                      name: 'Type',
                      value: renderType(activedTask.value.type),
                  },
              ]
            : []),
        {
            name: 'URL',
            value: activedTask.value.request.url_input,
        },
        {
            name: 'Status',
            value: renderStatus(activedTask.value.status),
        },
        {
            name: 'Action',
            value: renderAction({ ...activedTask.value, id: activedTaskId.value }),
        },
        {
            name: 'Request',
            value: h('pre', JSON.stringify(activedTask.value.request, null, 2)),
        },
    ];

    if (activedTask.value.progress) {
        details.push(
            {
                name: 'Filename',
                value: activedTask.value.progress.filename,
            },
            {
                name: 'Progress',
                value: `${((activedTask.value.progress.downloaded_bytes / activedTask.value.progress.total_bytes) * 100).toFixed(2)}%`,
            },
            {
                name: 'Speed',
                value: `${bytesToSize(activedTask.value.progress.speed)}/s`,
            },
        );
    }

    return details;
});
</script>

<template>
    <NDataTable :columns="tableColumns" :data="tableData">
        <template #empty>
            <NEmpty description="No tasks." />
        </template>
    </NDataTable>

    <NModal
        preset="card"
        display-directive="show"
        style="width: 70%"
        :show="activedTaskId !== null"
        :title="`Task ${activedTaskId}`"
        :on-esc="closeTaskDetails"
        :on-mask-click="closeTaskDetails"
        :on-close="closeTaskDetails"
    >
        <NGrid cols="6" y-gap="16" x-gap="16">
            <template v-for="detail in taskDetails" :key="detail.name">
                <NGi span="1" style="text-align: right">
                    <b>{{ detail.name }}</b>
                </NGi>

                <NGi span="5">
                    <component v-if="typeof detail.value === 'object'" :is="detail.value" />

                    <span v-else> {{ detail.value }} </span>
                </NGi>
            </template>
        </NGrid>
    </NModal>

    <NTooltip>
        <template #trigger>
            <NSwitch v-model:value="showPreviewTasks" style="position: fixed; right: 16px; bottom: 16px" />
        </template>
        Show Preview Tasks
    </NTooltip>
</template>
