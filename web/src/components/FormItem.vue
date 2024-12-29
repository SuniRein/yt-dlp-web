<script setup lang="ts">
import { computed, useTemplateRef, ref, onMounted, nextTick } from 'vue';
import { NInput, NDynamicInput, NSelect, NCheckbox, NFormItem, NTooltip } from 'naive-ui';
import type { FormItemRule } from 'naive-ui';
import type {
    TextFormItem,
    DynamicFormItem,
    SelectFormItem,
    CheckboxFormItem,
    FormItemInfo,
} from '@/types/FormItem.types';

const props = defineProps<FormItemInfo>();

const isCheckbox = (info: FormItemInfo): info is CheckboxFormItem => info.type === 'checkbox';
const isSelect = (info: FormItemInfo): info is SelectFormItem => info.type === 'select';
const isInput = (info: FormItemInfo): info is TextFormItem => info.type === 'text';
const isDynamicInput = (info: FormItemInfo): info is DynamicFormItem => info.type === 'dynamic';

const inputElement = useTemplateRef('inputElement');
const dynamicInputElement = useTemplateRef('dynamicInputElement');
const inputValue = ref();

function verify() {
    if (!(isInput(props) || isDynamicInput(props))) {
        return true;
    }

    const value = inputValue.value;

    if (props.required && !value) {
        return new Error('This field is required');
    }

    if (props.validator) {
        return !value || props.validator.verify(value) ? true : new Error(props.validator.message);
    }

    return true;
}

const rule = computed<FormItemRule | undefined>(() => {
    if (!(isInput(props) || isDynamicInput(props)) || !(props.required || props.validator)) {
        return undefined;
    }

    return {
        trigger: ['blur', 'input'],
        required: props.required,
        validator: verify,
    } satisfies FormItemRule;
});

const value = computed<string | string[]>(() => {
    const value = inputValue.value as string | string[] | boolean | undefined;

    if (isDynamicInput(props)) {
        return (value as string[]).filter((item) => item.length > 0);
    }

    if (isCheckbox(props)) {
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
    if (isDynamicInput(props) && dynamicInputElement.value) {
        dynamicInputElement.value.createItem(1);
    }
});

defineExpose({
    ...props,
    value,
    empty,

    /**
     * Verify the input value.
     * @returns An error if the value is invalid, with the input element to focus.
     * @returns undefined if the value is valid.
     */
    verify: () => {
        const result = verify();
        if (result instanceof Error) {
            return {
                error: result.message,
                element: inputElement.value, // send the input element to focus
            };
        }
        return undefined;
    },

    /**
     * Set the state of a checkbox (if it is).
     * @warning This method is only for test.
     */
    setChecked: (checked: boolean) => {
        if (!isCheckbox(props)) {
            throw new Error('setChecked is only available for checkbox');
        }
        inputValue.value = checked;
    },

    /**
     * Set the selected option of a select (if it is).
     * @warning This method is only for test.
     */
    setSelected: (index: number) => {
        if (!isSelect(props)) {
            throw new Error('setSelected is only available for select');
        }
        inputValue.value = props.options?.[index]?.value;
    },

    /**
     * Set the input value.
     * @warning This method is only for test.
     */
    setInputValue: async (value: string, index?: number) => {
        if (!isInput(props) && !isDynamicInput(props)) {
            throw new Error('setInputValue is only available for input or dynamic input');
        }

        const input = isInput(props)
            ? inputElement.value?.inputElRef
            : dynamicInputElement.value?.$el.querySelectorAll('input')[index ?? 0];

        if (!input) {
            throw new Error('Input element not found');
        }

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await nextTick();
    },
});
</script>

<template>
    <div class="form-item">
        <NFormItem v-if="isCheckbox(props)" :show-label="false">
            <NCheckbox v-model:checked="inputValue" ref="inputElement" data-test="checkbox">
                <NTooltip>
                    <template #trigger>
                        {{ props.label }}
                    </template>

                    {{ props.description }}
                </NTooltip>
            </NCheckbox>
        </NFormItem>

        <NFormItem v-else label-placement="left" :rule ref="formItem">
            <NSelect
                v-if="isSelect(props)"
                v-model:value="inputValue"
                :placeholder="props.placeholder"
                :options="props.options"
                data-test="select"
            />
            <NDynamicInput
                v-else-if="isDynamicInput(props)"
                v-model:value="inputValue"
                :placeholder="props.placeholder"
                :min="1"
                ref="dynamicInputElement"
                data-test="dynamic-input"
            />
            <NInput
                v-else-if="isInput(props)"
                v-model:value="inputValue"
                :placeholder="props.placeholder"
                ref="inputElement"
                data-test="input"
            />

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
