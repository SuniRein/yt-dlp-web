<script setup lang="ts">
import { NFloatButton, NIcon } from 'naive-ui';
import { useLogStore } from '@/store/log';
import ClearIcon from '@vicons/fluent/Broom16Regular';

const log = useLogStore();
</script>

<template>
    <div style="position: relative; overflow: hidden; min-height: 64px">
        <NFloatButton
            position="absolute"
            right="16"
            top="16"
            height="32"
            width="32"
            @click.prevent="log.clear"
            style="z-index: 100"
            data-test="log-clear-button"
        >
            <NIcon :component="ClearIcon" />
        </NFloatButton>

        <div style="margin: auto 16px" data-test="log-content">
            <pre>{{ log.str }}</pre>
        </div>
    </div>
</template>
