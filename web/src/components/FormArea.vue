<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import FormItem from '@/components/FormItem.vue';
import type { FormItemSet } from '@/types/FormItem.types';
import { NForm, NCard } from 'naive-ui';

type FormItemInst = InstanceType<typeof FormItem>;

defineProps<{ info: FormItemSet[] }>();

const formItems = useTemplateRef<FormItemInst[]>('formItems');

function verify() {
    if (!formItems.value) {
        throw new Error('Form items are not available.');
    }

    const errors = formItems.value.map((item) => item.verify()).filter((error) => error !== undefined);
    errors[0]?.element?.focus();

    return errors.length === 0;
}

const data = computed(() => {
    if (!formItems.value) {
        return {};
    }

    return Object.fromEntries(formItems.value.filter((item) => !item.empty).map((item) => [item.name, item.value]));
});

defineExpose({
    verify,
    data,
});
</script>

<template>
    <NForm show-feedback>
        <NCard v-for="set in info" :key="set.name" :title="set.name" data-test="form-set">
            <FormItem v-for="item in set.items" :key="item.name" v-bind="item" ref="formItems" data-test="form-item" />
        </NCard>
    </NForm>
</template>
