<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { NCard, NLog, NFloatButton, NIcon } from 'naive-ui';
import ClearIcon from '@vicons/fluent/Broom16Regular';

const logContent = ref('');

async function clear() {
    logContent.value = '';
    await nextTick();
}

async function log(message: string) {
    logContent.value += message + '\n';
    await nextTick();
}

defineExpose({
    clear,
    log,
});
</script>

<template>
    <NCard title="Log">
        <NFloatButton position="absolute" right="16" top="16" height="32" width="32" @click.prevent="clear">
            <NIcon :component="ClearIcon" />
        </NFloatButton>

        <NLog :log="logContent" />
    </NCard>
</template>
