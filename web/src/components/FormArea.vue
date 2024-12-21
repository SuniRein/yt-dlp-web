<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import FormItem, { type FormItemInfo } from '@/components/FormItem.vue';
import { NForm, NCard } from 'naive-ui';

type FormItemInst = InstanceType<typeof FormItem>;

export interface FormInfoSet {
    name: string;
    items: FormItemInfo[];
}

defineProps<{ info: FormInfoSet[] }>();

const form = useTemplateRef('form');
const formItems = useTemplateRef<FormItemInst[]>('formItems');

function validate() {
    if (!form.value) {
        throw new Error('Form is not available.');
    }
    form.value.validate();
}

const data = computed(() => {
    if (!formItems.value) {
        return {};
    }

    return Object.fromEntries(formItems.value.filter((item) => !item.empty).map((item) => [item.name, item.value]));
});

defineExpose({
    validate,
    data,
});
</script>

<template>
    <NForm ref="form" show-feedback>
        <NCard v-for="set in info" :key="set.name" :title="set.name" data-test="form-set">
            <FormItem v-for="item in set.items" :key="item.name" v-bind="item" ref="formItems" data-test="form-item" />
        </NCard>
    </NForm>
</template>
