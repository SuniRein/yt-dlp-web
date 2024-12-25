<script setup lang="ts">
import { computed } from 'vue';

import { NCard, NDataTable, NImage, NConfigProvider, NFloatButton, NIcon } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

import ClearIcon from '@vicons/fluent/Broom16Regular';

import { useMediaDataStore } from '@/store/media-data';
import { bytesToSize } from '@/utils/show';

const data = useMediaDataStore();

function hideIfEmpty(value: string | number) {
    return value == 0 || value == 'none' ? '' : value;
}

function formatIsRequested(formatId: string) {
    return data.value?.requested_formats.some((format) => format.format_id === formatId) ? 'Yes' : '';
}

const tableData = computed(() => {
    return data.value?.formats.map((format) => ({
        ID: format.format_id,
        Extension: format.ext,
        Resolution: format.resolution,
        FPS: format.fps,
        Size: bytesToSize(format.filesize_approx),
        TBR: format.tbr,
        Protocol: format.protocol,
        VCodec: hideIfEmpty(format.vcodec),
        VBR: hideIfEmpty(format.vbr),
        ACodec: hideIfEmpty(format.acodec),
        ABR: hideIfEmpty(format.abr),
        Chosen: formatIsRequested(format.format_id),
    }));
});

const tableColumns: DataTableColumns = [
    { title: 'ID', key: 'ID' },
    { title: 'Extension', key: 'Extension' },
    { title: 'Resolution', key: 'Resolution' },
    { title: 'FPS', key: 'FPS' },
    { title: 'Size', key: 'Size' },
    { title: 'TBR', key: 'TBR' },
    { title: 'Protocol', key: 'Protocol' },
    { title: 'VCodec', key: 'VCodec' },
    { title: 'VBR', key: 'VBR' },
    { title: 'ACodec', key: 'ACodec' },
    { title: 'ABR', key: 'ABR' },
    { title: 'Chosen', key: 'Chosen' },
].map((column) => {
    return { ...column, align: 'center' };
});
</script>

<template>
    <div style="position: relative; overflow: hidden; min-height: 64px">
        <NFloatButton
            position="absolute"
            right="16"
            top="16"
            height="32"
            width="32"
            @click.prevent="data.clear"
            style="z-index: 100"
            data-test="preview-clear-button"
        >
            <NIcon :component="ClearIcon" />
        </NFloatButton>

        <div v-if="data.value" data-test="preview-content">
            <NCard :title="data.value.title">
                {{ data.value.description }}

                <NImage :src="data.value.thumbnail" :img-props="{ referrerpolicy: 'no-referrer' }" />

                <p><b>Destination:</b> {{ data.value.filename }}</p>
            </NCard>

            <NConfigProvider>
                <NDataTable :data="tableData" :columns="tableColumns" />
            </NConfigProvider>
        </div>
    </div>
</template>
