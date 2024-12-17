<script setup lang="ts">
import { computed, useTemplateRef, ref, onMounted } from 'vue';
import { NInput, NDynamicInput, NSelect, NCheckbox, NFormItem, NTooltip } from 'naive-ui';

export interface FormItemInfo {
    label: string;
    description: string;
    name: string;
    type: string;
    required?: boolean;
    multiple?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

const props = defineProps<FormItemInfo>();

const isCheckbox = () => props.type === 'checkbox';
const isSelect = () => props.type === 'select';
const isDynamicInput = () => props.multiple;

const dynamicInputElement = useTemplateRef('dynamicInputElement');
const inputValue = ref();

const value = computed<string | string[]>(() => {
    const value = inputValue.value as string | string[] | boolean | undefined;

    if (isDynamicInput()) {
        return (value as string[]).filter((item) => item.length > 0);
    }

    if (isCheckbox()) {
        return value ? 'on' : '';
    }

    if (value !== undefined && typeof value !== 'string') {
        throw new Error(`Invalid value type: ${typeof value} in ${props.name}`);
    }
    return value ?? '';
});

const empty = computed(() => value.value.length === 0);

onMounted(() => {
    // Dynamiv input has a initial input element.
    if (isDynamicInput() && dynamicInputElement.value) {
        dynamicInputElement.value.createItem(1);
    }
});

defineExpose({
    ...props,
    value,
    empty,

    /**
     * Set the state of a checkbox (if it is).
     * @warning This method is only for test.
     */
    setChecked: (checked: boolean) => {
        if (!isCheckbox()) {
            throw new Error('setChecked is only available for checkbox');
        }
        inputValue.value = checked;
    },

    /**
     * Set the selected option of a select (if it is).
     * @warning This method is only for test.
     */
    setSelected: (index: number) => {
        if (!isSelect()) {
            throw new Error('setSelected is only available for select');
        }
        inputValue.value = props.options?.[index]?.value;
    },
});
</script>

<template>
    <div class="form-item">
        <NFormItem v-if="isCheckbox()" :show-label="false">
            <NCheckbox v-model:checked="inputValue" data-test="checkbox">
                <NTooltip>
                    <template #trigger>
                        {{ label }}
                    </template>

                    {{ description }}
                </NTooltip>
            </NCheckbox>
        </NFormItem>

        <NFormItem v-else label-placement="left">
            <NSelect
                v-if="isSelect()"
                v-model:value="inputValue"
                :placeholder="placeholder"
                :options="options"
                data-test="select"
            />
            <NDynamicInput
                v-else-if="isDynamicInput()"
                v-model:value="inputValue"
                :placeholder="placeholder"
                :min="1"
                ref="dynamicInputElement"
                data-test="dynamic-input"
            />
            <NInput v-else v-model:value="inputValue" :placeholder="placeholder" data-test="input" />

            <template #label>
                <NTooltip>
                    <template #trigger>
                        {{ label }}
                    </template>

                    {{ description }}
                </NTooltip>
            </template>
        </NFormItem>
    </div>
</template>
