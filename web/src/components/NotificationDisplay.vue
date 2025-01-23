<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotification } from 'naive-ui';

import { registerNotificationApi } from '@/utils/notification';

onMounted(() => {
    registerNotificationApi(useNotification());
});
</script>

<template>
    <!-- An empty component just for registering notification api. -->
    <template />
</template>
