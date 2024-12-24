<script setup lang="ts">
import { NCard, NLog, NFloatButton, NIcon } from 'naive-ui';
import { useLogStore } from '@/store/log';
import ClearIcon from '@vicons/fluent/Broom16Regular';

const log = useLogStore();
</script>

<template>
    <NCard>
        <NFloatButton
            position="absolute"
            right="16"
            top="16"
            height="32"
            width="32"
            @click.prevent="log.clear"
            data-test="log-clear-button"
        >
            <NIcon :component="ClearIcon" />
        </NFloatButton>

        <NLog :log="log.value" data-test="log-content" />
    </NCard>
</template>
