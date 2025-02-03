<script setup lang="ts">
import { ref, computed, capitalize } from 'vue';
import { useRouter } from 'vue-router';

import {
    NButton,
    NButtonGroup,
    NFloatButton,
    NSelect,
    NSlider,
    NInputGroup,
    NIcon,
    NModal,
    NCollapse,
    NCollapseItem,
} from 'naive-ui';
import DevIcon from '@vicons/fluent/DeveloperBoard20Filled';

import { useMediaDataStore } from '@/store/media-data';
import { useLogStore } from '@/store/log';
import { useDisplayModeStore } from '@/store/display-mode';
import { useTasksStore, taskStatus, taskTypes } from '@/store/tasks';
import mediaInfo from '@/dev/media-info.json';

const showModel = ref(false);

const mediaData = useMediaDataStore();
const log = useLogStore();
const displayMode = useDisplayModeStore();
const tasks = useTasksStore();

const logDemo = `Send Request: ${JSON.stringify(
    {
        action: 'Log',
        message: 'Demo Log',
    },
    null,
    2,
)}`;

const router = useRouter();

const buttonSettings = {
    ghost: true,
    round: true,
    style: 'margin: 4px',
};

function addTask(type: 'preview' | 'download', progress?: number) {
    tasks.append({
        id: Math.max(...Array.from(tasks.value.keys()), -1) + 1, // -1 if initial tasks is empty
        type,
        request: { url_input: 'https://example.com' },
        status: taskStatus[0],
        progress:
            type === 'download' && progress !== undefined
                ? {
                      downloaded_bytes: progress,
                      total_bytes: 100,
                      speed: 10000,
                      status: 'running',
                      elapsed: 0,
                      filename: 'example.mp4',
                      ctx_id: null,
                  }
                : undefined,
    });
}

const taskSelectOptions = computed(() =>
    Array.from(tasks.value.keys()).map((key) => ({
        label: `Task ${key}`,
        value: key,
    })),
);
const taskSelected = ref(0);

const taskStatusOptions = taskStatus.map((status) => ({ label: capitalize(status), value: status }));
const taskStatusSelected = ref(taskStatus[0]);

const taskDownloadProgress = ref(10);

const taskTypeOptions = taskTypes.map((type) => ({ label: capitalize(type), value: type }));
const taskTypeSelected = ref(taskTypes[0]);
</script>

<template>
    <NFloatButton
        position="fixed"
        top="50%"
        left="0"
        style="transform: translateY(-50%) translateX(-50%)"
        @click.prevent="showModel = true"
    >
        <NIcon :component="DevIcon" />
    </NFloatButton>

    <NModal v-model:show="showModel" preset="card" title="Dev Tools" display-directive="show" style="width: 40%">
        <NCollapse display-directive="show">
            <NCollapseItem title="Form Data">
                <!-- TODO: form data validation status -->
                <!-- TODO: form data just-in-time preview -->
            </NCollapseItem>

            <NCollapseItem title="Preview">
                <NButtonGroup>
                    <NButton v-bind="buttonSettings" @click="mediaData.value = mediaInfo">Show Demo Preview</NButton>
                    <NButton v-bind="buttonSettings" @click="mediaData.clear">Clear Preview</NButton>
                </NButtonGroup>
            </NCollapseItem>

            <NCollapseItem title="Log">
                <NButtonGroup>
                    <NButton v-bind="buttonSettings" @click="log.log(logDemo)">Add Demo Log</NButton>
                    <NButton v-bind="buttonSettings" @click="log.clear()">Clear Log</NButton>
                </NButtonGroup>
            </NCollapseItem>

            <NCollapseItem title="Tasks">
                <NInputGroup>
                    <NSlider v-model:value="taskDownloadProgress" :min="0" :max="100" :step="0.1" />
                    <NSelect :options="taskTypeOptions" v-model:value="taskTypeSelected" />
                    <NButton @click="addTask(taskTypeSelected, taskDownloadProgress)">Add Task</NButton>
                </NInputGroup>

                <NInputGroup>
                    <NSelect :options="taskSelectOptions" v-model:value="taskSelected" />
                    <NSelect :options="taskStatusOptions" v-model:value="taskStatusSelected" />
                    <NButton ghost @click="tasks.setStatus(taskSelected, taskStatusSelected)">Set Task Status</NButton>
                </NInputGroup>
            </NCollapseItem>

            <NCollapseItem title="Global">
                <NButtonGroup>
                    <NButton v-bind="buttonSettings" @click="router.push({ name: 'home' })">Home</NButton>
                    <NButton v-bind="buttonSettings" @click="router.push({ name: 'preview' })">Preview</NButton>
                    <NButton v-bind="buttonSettings" @click="router.push({ name: 'task' })">Task</NButton>
                    <NButton v-bind="buttonSettings" @click="router.push({ name: 'log' })">Log</NButton>
                    <NButton v-bind="buttonSettings" @click="router.push({ name: 'settings' })">Settings</NButton>
                </NButtonGroup>

                <NButtonGroup>
                    <NButton v-bind="buttonSettings" @click="displayMode.state = 'light'">Light Theme</NButton>
                    <NButton v-bind="buttonSettings" @click="displayMode.state = 'dark'">Dark Theme</NButton>
                </NButtonGroup>
            </NCollapseItem>
        </NCollapse>
    </NModal>
</template>
