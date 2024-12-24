<script setup lang="ts">
import { computed } from 'vue';
import { NLayoutHeader, NButton, NFlex, NMenu, NSwitch } from 'naive-ui';
import { useDisplayModeStore } from '@/stores/display-mode';

import LightIcon from '@vicons/fluent/WeatherSunny16Regular';
import DarkIcon from '@vicons/fluent/WeatherMoon16Filled';

// TODO: Implement language toggling
function toggleLanguage() {
    console.log('Toggle language');
}

const menuValue = computed(() => 'home');

const menuOptions = [
    {
        key: 'home',
        label: 'Home',
    },
    {
        key: 'preview',
        label: 'Preview',
    },
    {
        key: 'downloading',
        label: 'Downloading',
    },
    {
        key: 'log',
        label: 'Log',
    },
    {
        key: 'settings',
        label: 'Settings',
    },
];

const displayMode = useDisplayModeStore();
</script>

<template>
    <NLayoutHeader class="nav" bordered>
        <NFlex justify="space-between">
            <div class="nav-logo">
                <span>yt-dlp WebUI</span>
            </div>

            <div class="nav-menu">
                <NMenu responsive mode="horizontal" :value="menuValue" :options="menuOptions" />
            </div>

            <div class="nav-end">
                <NButton size="small" quaternary @click="toggleLanguage">Toggle Language</NButton>

                <NSwitch @update:value="displayMode.toggle" :default-value="displayMode.state === 'dark'">
                    <template #checked-icon><DarkIcon /></template>
                    <template #unchecked-icon><LightIcon /></template>
                </NSwitch>

                <NButton size="small" quaternary tag="a" href="https://github.com/SuniRein/yt-dlp-web" target="_blank">
                    Github
                </NButton>
            </div>
        </NFlex>
    </NLayoutHeader>
</template>

<style scoped>
.nav {
    padding: 0 16px;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
}
</style>
