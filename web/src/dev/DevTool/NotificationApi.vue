<script setup lang="ts">
import { capitalize, ref } from 'vue';

import { NButton, NFormItem, NInput } from 'naive-ui';

import notificationApi from '@/utils/notification-api';

const title = ref('Notification Title');
const description = ref('Notification Description');

const types = ['info', 'success', 'warning', 'error'] as const;
</script>

<template>
    <NFormItem label="Title">
        <NInput v-model:value="title" />
    </NFormItem>

    <NFormItem label="Description">
        <NInput v-model:value="description" type="textarea" />
    </NFormItem>

    <div style="text-align: center">
        <NButton
            v-for="type in types"
            :key="type"
            @click.prevent="notificationApi[type]({ title, description })"
            :type
            round
            secondary
            style="margin: 4px"
        >
            {{ capitalize(type) }}
        </NButton>
    </div>
</template>
