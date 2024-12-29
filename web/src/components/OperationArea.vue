<script setup lang="ts">
import { NFloatButtonGroup, NFloatButton, NIcon, NTooltip } from 'naive-ui';
import DownloadIcon from '@vicons/fluent/ArrowDownload16Regular';
import PreviewIcon from '@vicons/fluent/PreviewLink16Regular';
import InterruptIcon from '@vicons/fluent/Stop16Regular';

interface ButtonActions {
    download: () => void;
    preview: () => void;
    interrupt: () => void;
}

defineProps<ButtonActions>();
</script>

<template>
    <div class="operation-area">
        <NFloatButtonGroup position="fixed" bottom="32" right="32">
            <NTooltip trigger="hover" placement="left">
                <template #trigger>
                    <NFloatButton @click.prevent="interrupt">
                        <NIcon :component="InterruptIcon" />
                    </NFloatButton>
                </template>
                Interrupt
            </NTooltip>

            <NTooltip trigger="hover" placement="left">
                <template #trigger>
                    <NFloatButton @click.prevent="preview">
                        <NIcon :component="PreviewIcon" />
                    </NFloatButton>
                </template>
                Preview
            </NTooltip>

            <NTooltip trigger="hover" placement="left">
                <template #trigger>
                    <NFloatButton @click.prevent="download">
                        <NIcon :component="DownloadIcon" />
                    </NFloatButton>
                </template>
                Download
            </NTooltip>
        </NFloatButtonGroup>
    </div>
</template>
