<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { NConfigProvider, NGlobalStyle, lightTheme, darkTheme } from 'naive-ui';

import HeaderArea from '@/components/HeaderArea.vue';

import { useDisplayModeStore } from '@/store/display-mode';

const displayMode = useDisplayModeStore();
const theme = computed(() => (displayMode.state === 'light' ? lightTheme : darkTheme));
</script>

<template>
    <NConfigProvider :theme>
        <NGlobalStyle />

        <HeaderArea />

        <RouterView />
    </NConfigProvider>
</template>
