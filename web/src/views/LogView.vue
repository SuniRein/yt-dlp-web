<script setup lang="ts">
import { h, capitalize, computed } from 'vue';
import { NFloatButton, NIcon, NDataTable, NTag, NEmpty } from 'naive-ui';
import { useLogStore } from '@/store/log';
import ClearIcon from '@vicons/fluent/Broom16Regular';

const log = useLogStore();

function renderLevel(level: Row['level']) {
    const levelMap = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        debug: 'default',
    } as const;

    return h(NTag, { type: levelMap[level], round: true, bordered: false }, { default: () => capitalize(level) });
}

const columns = [
    {
        title: 'Time',
        key: 'time',
        render(row: Row) {
            return new Date(row.time).toLocaleString();
        },
    },
    {
        title: 'Level',
        key: 'level',
        render(row: Row) {
            return renderLevel(row.level);
        },
    },
    {
        title: 'Message',
        key: 'message',
        render(row: Row) {
            return h('pre', { style: { margin: 0 } }, row.message);
        },
    },
];

const data = computed(() => log.store);
type Row = (typeof data.value)[0];
</script>

<template>
    <div style="position: relative; overflow: hidden; min-height: 64px">
        <NFloatButton
            position="absolute"
            right="16"
            top="16"
            height="32"
            width="32"
            @click.prevent="log.clear"
            style="z-index: 100"
            data-test="log-clear-button"
        >
            <NIcon :component="ClearIcon" />
        </NFloatButton>

        <NDataTable :columns :data data-test="log-content">
            <template #empty>
                <NEmpty description="No log." />
            </template>
        </NDataTable>
    </div>
</template>
