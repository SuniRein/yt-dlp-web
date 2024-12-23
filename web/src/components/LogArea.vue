<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { NCard, NLog } from 'naive-ui';

const log = ref('');

defineExpose({
    clear: async () => {
        log.value = '';
        await nextTick();
    },
    log: async (message: string) => {
        log.value += message + '\n';
        await nextTick();
    },
});
</script>

<template>
    <NCard title="Log">
        <NLog :log="log" />
    </NCard>
</template>
