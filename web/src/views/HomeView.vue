<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';

import FormArea from '@/components/FormArea.vue';
import LogArea from '@/components/LogArea.vue';
import PreviewArea from '@/components/PreviewArea.vue';
import OperationArea from '@/components/OperationArea.vue';

import { formItemInfo } from '@/utils/form-item-info';
import { bytesToSize } from '@/utils/show';

const form = useTemplateRef('form');
const logArea = useTemplateRef('logArea');
const previewArea = useTemplateRef('previewArea');

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

    logMessage(`Request: ${JSON.stringify(data, null, 2)}`);

    // Backend call
    webui.submitUrl(JSON.stringify(data)).then((response) => {
        if (action === 'preview' && response) {
            previewArea.value?.preview(JSON.parse(response));
        }
    });
}

function logMessage(message: string) {
    logArea.value?.log(message);
}

function showDownloadProgress(rawData: Uint8Array) {
    const data = new TextDecoder().decode(rawData);
    const json = JSON.parse(data);

    const filename = json.filename;
    const downloaded_bytes = bytesToSize(json.downloaded_bytes);
    const total_bytes = bytesToSize(json.total_bytes);
    const speed = bytesToSize(json.speed);
    const progress = (json.downloaded_bytes / json.total_bytes) * 100;
    logMessage(
        `Downloading ${filename}: ${downloaded_bytes} / ${total_bytes} (${progress.toFixed(2)}%) Speed: ${speed}/s`,
    );
}

function showDownloadInfo(rawData: Uint8Array) {
    const data = new TextDecoder().decode(rawData);
    logMessage(data);
}

declare global {
    interface Window {
        logMessage: (message: string) => void;
        showDownloadProgress: (rawData: Uint8Array) => void;
        showDownloadInfo: (rawData: Uint8Array) => void;
    }
}

onMounted(() => {
    window.logMessage = logMessage;
    window.showDownloadProgress = showDownloadProgress;
    window.showDownloadInfo = showDownloadInfo;
});
</script>

<template>
    <FormArea :info="formItemInfo" ref="form" />

    <PreviewArea ref="previewArea" />

    <LogArea ref="logArea" />

    <OperationArea
        :download="() => handleFormSubmit('download')"
        :preview="() => handleFormSubmit('preview')"
        :interrupt="() => handleFormSubmit('interrupt')"
    />
</template>
