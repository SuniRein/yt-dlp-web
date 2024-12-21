<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { bytesToSize } from '@/utils/show';
import { NCard, NDataTable, NImage, NConfigProvider } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

export interface UrlFormatInfo {
    format_id: string;
    ext: string;
    resolution: string;
    fps: number;
    filesize_approx: number;
    protocol: string;
    vcodec: string;
    acodec: string;
    tbr: number;
    vbr: number;
    abr: number;
}

export interface UrlDataInfo {
    title: string;
    description: string;
    thumbnail: string;
    formats: UrlFormatInfo[];
    requested_formats: { format_id: string }[];
    filename: string;
}

const data = ref<UrlDataInfo | null>(null);

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

defineExpose({
    preview: async (previewData: UrlDataInfo) => {
        data.value = previewData;
        await nextTick();
    },
    clear: async () => {
        data.value = null;
        await nextTick();
    },
});
</script>

<template>
    <NCard title="Preview">
        <template v-if="data !== null">
            <NCard :title="data.title">
                {{ data.description }}

                <NImage :src="data.thumbnail" :img-props="{ referrerpolicy: 'no-referrer' }" />

                <p><b>Destination:</b> {{ data.filename }}</p>
            </NCard>

            <NConfigProvider>
                <NDataTable :data="tableData" :columns="tableColumns" />
            </NConfigProvider>
        </template>
    </NCard>
</template>

<style scoped>
table {
    text-align: center;
    border-spacing: 8px;
}
</style>
