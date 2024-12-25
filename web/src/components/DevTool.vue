<script setup lang="ts">
import { ref } from 'vue';
import { NFloatButton, NIcon, NModal } from 'naive-ui';
import DevIcon from '@vicons/fluent/DeveloperBoard20Filled';

const showModel = ref(false);
</script>

<template>
    <NFloatButton
        position="fixed"
        top="50%"
        left="0"
        style="transform: translateY(-50%) translateX(-50%)"
        @click.prevent="showModel = true"
    >
        <NIcon :component="DevIcon" />
    </NFloatButton>

    <NModal v-model:show="showModel" preset="card" title="Dev Tools" style="width: 40%"> Empty Area </NModal>
</template>
