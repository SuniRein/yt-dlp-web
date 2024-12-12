<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';

import FormItem from '@/components/FormItem.vue';
import LogArea from '@/components/LogArea.vue';
import PreviewArea from '@/components/PreviewArea.vue';

import { formItemInfo } from '@/utils/form-item-info';
import { bytesToSize } from '@/utils/show';

type FormItemType = InstanceType<typeof FormItem>;

const formItems = useTemplateRef<FormItemType[]>('formItems');
const logArea = useTemplateRef('logArea');
const previewArea = useTemplateRef('previewArea');

function handleFormSubmit(action: string) {
    // Convert form data to JSON.
    const data: {
        [key: string]: string | string[];
    } = { action: action };

    if (!formItems.value) {
        return;
    }

    for (const element of formItems.value) {
        // If input is invalid, show error message and stop.
        if (!element.checkValidity()) {
            return;
        }

        // Here only send meaningful values.
        // Empty values are not sent to backend.
        if (!element.empty()) {
            data[element.name] = element.value();
        }
    }

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
    <fieldset v-for="formItemGroup in formItemInfo" :key="formItemGroup.name">
        <legend>{{ formItemGroup.name }}</legend>
        <FormItem v-for="formItem in formItemGroup.items" v-bind="formItem" :key="formItem.name" ref="formItems" />
    </fieldset>

    <button @click.prevent="handleFormSubmit('download')">Download</button>
    <button @click.prevent="handleFormSubmit('preview')">Preview</button>
    <button @click.prevent="handleFormSubmit('interrupt')">Interrupt</button>

    <button @click.prevent="logArea?.clear()">Clear Log</button>
    <button @click.prevent="previewArea?.clear()">Clear Preview</button>

    <PreviewArea ref="previewArea" />

    <LogArea ref="logArea" />
</template>

<style>
body {
    font-family: Arial, sans-serif;
    margin: 20px;
}

fieldset {
    border: 2px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
}

legend {
    font-size: 1.2em;
    font-weight: bold;
    color: #333;
}
</style>
