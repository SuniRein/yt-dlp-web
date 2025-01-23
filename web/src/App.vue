<script setup lang="ts">
import { ref, computed, onMounted, type DefineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { NConfigProvider, NGlobalStyle, lightTheme, darkTheme, NNotificationProvider } from 'naive-ui';

import HeaderArea from '@/components/HeaderArea.vue';
import NotificationDisplay from '@/components/NotificationDisplay.vue';

import { useDisplayModeStore } from '@/store/display-mode';

const displayMode = useDisplayModeStore();
const theme = computed(() => (displayMode.state === 'light' ? lightTheme : darkTheme));

const devToolComponent = ref<DefineComponent | null>(null);
onMounted(async () => {
    if (__DEV__) {
        const { default: DevTool } = await import('@/dev/DevTool.vue');
        devToolComponent.value = DevTool as DefineComponent;
    }
});
</script>

<template>
    <NConfigProvider :theme>
        <NGlobalStyle />

        <NNotificationProvider>
            <HeaderArea />

            <RouterView v-slot="{ Component }">
                <KeepAlive>
                    <component :is="Component" />
                </KeepAlive>
            </RouterView>

            <component :is="devToolComponent" />

            <NotificationDisplay />
        </NNotificationProvider>
    </NConfigProvider>
</template>
