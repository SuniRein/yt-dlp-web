<script setup lang="ts">
import { useTemplateRef } from 'vue';

import FormArea from '@/components/FormArea.vue';
import OperationArea from '@/components/OperationArea.vue';

import { useLogStore } from '@/store/log';
import { useTasksStore } from '@/store/tasks';

import { formItemInfo } from '@/utils/form-item-info';

const form = useTemplateRef('form');

const log = useLogStore();
const tasks = useTasksStore();

async function handleFormSubmit(action: string) {
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

    const task = await webui.handleRequest(JSON.stringify(data));
    log.log(`Run task ${task}.`);

    tasks.append({
        id: task,
        request: data,
        status: 'running',
    });
}
</script>

<template>
    <FormArea :info="formItemInfo" ref="form" />

    <OperationArea :download="() => handleFormSubmit('download')" :preview="() => handleFormSubmit('preview')" />
</template>
