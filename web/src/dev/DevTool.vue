<script setup lang="ts">
import { ref, computed, capitalize } from 'vue';
import { useRouter } from 'vue-router';

import {
    NButton,
    NButtonGroup,
    NFloatButton,
    NSelect,
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
import { useTasksStore, taskStatus, type TaskStatus } from '@/store/tasks';
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

function addTask() {
    tasks.append({
        id: tasks.value.size + 1,
        request: {
            action: 'Preview',
            url_input: 'https://example.com',
        },
        status: taskStatus[0],
    });
}

const taskSelectOptions = computed(() =>
    Array.from({ length: tasks.value.size }, (_, index) => ({
        label: `Task ${index + 1}`,
        value: index + 1,
    })),
);

const taskStatusOptions = taskStatus.map((status) => ({ label: capitalize(status), value: status }));

const taskSelected = ref(1);
const taskStatusSelected = ref<TaskStatus>(taskStatus[0]);
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
                <NButton v-bind="buttonSettings" @click="addTask">Add Task</NButton>

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
