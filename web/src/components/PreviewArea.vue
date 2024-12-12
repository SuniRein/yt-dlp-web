<script setup lang="ts">
import { ref } from 'vue';
import { bytesToSize } from '@/utils/show';

export interface UrlFormatInfo {
    format_id: string;
    ext: string;
    resolution: string;
    fps: string;
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

defineExpose({
    preview: (previewData: UrlDataInfo) => {
        data.value = previewData;
    },
    clear: () => {
        data.value = null;
    },
});
</script>

<template>
    <fieldset>
        <legend>Preview</legend>

        <template v-if="data !== null">
            <h4>{{ data.title }}</h4>

            <p>{{ data.description }}</p>

            <img :src="data.thumbnail" referrerPolicy="no-referrer" />

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Extension</th>
                        <th>Resolution</th>
                        <th>FPS</th>
                        <th>Size</th>
                        <th>TBR</th>
                        <th>Protocol</th>
                        <th>VCodec</th>
                        <th>VBR</th>
                        <th>ACodec</th>
                        <th>ABR</th>
                        <th>Chosen</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="format in data.formats" :key="format.format_id">
                        <td>{{ format.format_id }}</td>
                        <td>{{ format.ext }}</td>
                        <td>{{ format.resolution }}</td>
                        <td>{{ format.fps }}</td>
                        <td>{{ bytesToSize(format.filesize_approx) }}</td>
                        <td>{{ format.tbr }}</td>
                        <td>{{ format.protocol }}</td>
                        <td>{{ hideIfEmpty(format.vcodec) }}</td>
                        <td>{{ hideIfEmpty(format.vbr) }}</td>
                        <td>{{ hideIfEmpty(format.acodec) }}</td>
                        <td>{{ hideIfEmpty(format.abr) }}</td>
                        <td>{{ formatIsRequested(format.format_id) }}</td>
                    </tr>
                </tbody>
            </table>

            <p><b>Destination:</b> {{ data.filename }}</p>
        </template>
    </fieldset>
</template>

<style scoped>
table {
    text-align: center;
    border-spacing: 8px;
}
</style>
