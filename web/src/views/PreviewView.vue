<script setup lang="ts">
import { computed } from 'vue';

import {
    // Clear Button
    NFloatButton,
    NIcon,

    // Preview Content
    NCard,
    NImage,
    NGrid,
    NGi,
    NDivider,
    NStatistic,
    NEllipsis,

    // Preview Table
    NConfigProvider,
    NDataTable,
} from 'naive-ui';
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

/**
 * @param date Date to be parsed with format YYYYMMDD
 */
function parseDate(date: string) {
    return new Date(parseInt(date.slice(0, 4)), parseInt(date.slice(4, 6)), parseInt(date.slice(6, 8)));
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

        <div v-if="data.value" data-test="preview-content" class="preview-content">
            <NGrid cols="5" x-gap="8" style="align-items: center; margin: 8px auto" data-test="preview-media-show">
                <NGi span="2">
                    <NImage
                        :src="data.value.thumbnail"
                        :img-props="{
                            referrerpolicy: 'no-referrer',
                            style: 'max-width: 100%; height: auto',
                        }"
                    />
                </NGi>

                <NGi span="3">
                    <NCard :segmented="{ content: 'soft', footer: 'soft' }" embedded hoverable>
                        <template #header>
                            <a :href="data.value.webpage_url" target="_blank">
                                <h2>{{ data.value.title }}</h2>
                            </a>
                        </template>

                        <template #header-extra>
                            <p>
                                Uploaded by <b>{{ data.value.uploader }}</b> on
                                <b>{{ parseDate(data.value.upload_date).toLocaleDateString() }}</b>
                            </p>
                        </template>

                        <NGrid cols="4">
                            <NGi>
                                <NStatistic label="Duration" :value="data.value.duration_string" />
                            </NGi>

                            <NGi>
                                <NStatistic label="Like" :value="data.value.like_count" />
                            </NGi>

                            <NGi>
                                <NStatistic label="View" :value="data.value.view_count" />
                            </NGi>

                            <NGi>
                                <NStatistic label="Comment" :value="data.value.comment_count" />
                            </NGi>
                        </NGrid>

                        <NDivider />

                        <NEllipsis style="white-space: pre-wrap" expand-trigger="click" line-clamp="3" :tooltip="false">
                            {{ data.value.description }}
                        </NEllipsis>

                        <template #footer>
                            <p>
                                Saved as <b>{{ data.value.filename }}</b>
                            </p>
                        </template>
                    </NCard>
                </NGi>
            </NGrid>

            <NConfigProvider>
                <NDataTable :data="tableData" :columns="tableColumns" data-test="preview-media-format-table"/>
            </NConfigProvider>
        </div>
    </div>
</template>

<style scoped>
.preview-content {
    padding: 16px;
}
</style>
