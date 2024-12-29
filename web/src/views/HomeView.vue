<script setup lang="ts">
import { useTemplateRef } from 'vue';

import FormArea from '@/components/FormArea.vue';
import OperationArea from '@/components/OperationArea.vue';

import { useLogStore } from '@/store/log';
import { useMediaDataStore } from '@/store/media-data';

import { formItemInfo } from '@/utils/form-item-info';

const form = useTemplateRef('form');

const log = useLogStore();
const mediaData = useMediaDataStore();

function handleFormSubmit(action: string) {
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

    // Backend call
    webui.submitUrl(JSON.stringify(data)).then((response) => {
        if (action === 'preview' && response) {
            mediaData.value = JSON.parse(response);
        }
    });
}
</script>

<template>
    <FormArea :info="formItemInfo" ref="form" />

    <OperationArea
        :download="() => handleFormSubmit('download')"
        :preview="() => handleFormSubmit('preview')"
        :interrupt="() => handleFormSubmit('interrupt')"
    />
</template>
