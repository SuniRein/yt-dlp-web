<script setup lang="ts">
import { computed } from 'vue';
import { NLayoutHeader, NButton, NFlex, NMenu } from 'naive-ui';
import { useDisplayModeStore } from '@/stores/display-mode';

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
const displayModeState = computed(() => (displayMode.state === 'light' ? 'Light' : 'Dark'));
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

                <NButton size="small" quaternary @click="displayMode.toggle">{{ displayModeState }}</NButton>

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
