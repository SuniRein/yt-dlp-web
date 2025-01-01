<script setup lang="ts">
import { useTemplateRef } from 'vue';

import FormArea from '@/components/FormArea.vue';
import OperationArea from '@/components/OperationArea.vue';

import { useLogStore } from '@/store/log';

import { formItemInfo } from '@/utils/form-item-info';

const form = useTemplateRef('form');

const log = useLogStore();

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

    const task = webui.handleRequest(JSON.stringify(data));
    log.log(`Run task ${task}.`);
}

function handleInterrupt(task: number) {
    webui.handleInterrupt(task);
}
</script>

<template>
    <FormArea :info="formItemInfo" ref="form" />

    <OperationArea
        :download="() => handleFormSubmit('download')"
        :preview="() => handleFormSubmit('preview')"
        :interrupt="() => handleInterrupt(0)"
    />
</template>
