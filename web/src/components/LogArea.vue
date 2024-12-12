<script setup lang="ts">
import { useTemplateRef } from 'vue';

const logOutput = useTemplateRef('logOutput');

defineExpose({
    clear: () => {
        if (logOutput.value) {
            logOutput.value.value = '';
        }
    },
    log: (message: string) => {
        if (logOutput.value) {
            logOutput.value.value += message + '\n';
            logOutput.value.scrollTop = logOutput.value.scrollHeight;
        }
    },
});
</script>

<template>
    <fieldset>
        <legend>Log Output</legend>
        <textarea rows="10" style="width: 100%" readonly ref="logOutput"></textarea>
    </fieldset>
</template>
