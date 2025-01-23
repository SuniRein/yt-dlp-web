<script setup lang="ts">
import { useTemplateRef } from 'vue';

import FormArea from '@/components/FormArea.vue';
import OperationArea from '@/components/OperationArea.vue';

import { useLogStore } from '@/store/log';
import { useTasksStore, type TaskType } from '@/store/tasks';

import { formItemInfo } from '@/utils/form-item-info';
import { useNotification } from '@/utils/notification';

const form = useTemplateRef('form');

const log = useLogStore();
const tasks = useTasksStore();

const notification = useNotification();

async function handleFormSubmit(action: TaskType) {
    if (!form.value) {
        throw new Error('Form is not availabel.');
    }

    if (!form.value.verify()) {
        return;
    }

    const data = {
        action,
        ...form.value.data,
    };

    log.log(`Request: ${JSON.stringify(data, null, 2)}`);

    const task = parseInt(await webui.handleRequest(JSON.stringify(data)));
    log.log(`Run task ${task}.`);

    notification.info({
        title: `Created task ${task}`,
        description: `The task is running, please wait.`,
        duration: 3000,
        keepAliveOnHover: true,
    });

    tasks.append({
        id: task,
        type: action,
        request: form.value.data,
        status: 'running',
    });
}
</script>

<template>
    <FormArea :info="formItemInfo" ref="form" />

    <OperationArea :download="() => handleFormSubmit('download')" :preview="() => handleFormSubmit('preview')" />
</template>
