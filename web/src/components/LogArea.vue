<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NLog } from 'naive-ui';

const log = ref('');

defineExpose({
    clear: () => {
        log.value = '';
    },
    log: (message: string) => {
        log.value += message + '\n';
    },
});
</script>

<template>
    <NCard title="Log">
        <NLog :log="log" />
    </NCard>
</template>
