<script setup lang="ts">
import { computed, useTemplateRef, ref } from 'vue';
import { formItemCustomTypes } from '@/store/form-item-custom-type';
import { NInput, NDynamicInput, NSelect, NCheckbox } from 'naive-ui';

export interface FormItemInfo {
    label: string;
    description: string;
    name: string;
    type: string;
    required?: boolean;
    multiple?: boolean;
    accept?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

const props = defineProps<FormItemInfo>();

const isCheckbox = computed(() => props.type === 'checkbox');
const isSelect = computed(() => props.type === 'select');

const inputType = computed(() => {
    if (props.type in formItemCustomTypes) {
        return 'text';
    }
    return props.type;
});

const inputElement = useTemplateRef<HTMLInputElement | HTMLSelectElement>('inputElement');
const extraInputElements = useTemplateRef('extraInputElements');
const extraInputElementNumber = ref(0);

// All input elements, including the main input element and extra input elements.
// Note: select element are not included.
const inputElements = computed(() => {
    if (inputElement.value instanceof HTMLInputElement) {
        return [inputElement.value, ...(extraInputElements.value || [])];
    }
    return [];
});

function addInputElement() {
    if (props.multiple) {
        extraInputElementNumber.value++;
    }
}

function removeInputElement() {
    if (props.multiple && extraInputElementNumber.value !== 0) {
        extraInputElementNumber.value--;
    }
}

function inputIsEmpty(input: HTMLSelectElement | HTMLInputElement | null | undefined) {
    if (!input) {
        return true;
    }

    if (input.type === 'checkbox') {
        return !input.checked;
    }
    if (input.type === 'radio') {
        return !input.checked || input.value === 'none' || input.value === '';
    }
    return input.value === 'none' || input.value === '';
}

function inputIsValidity(input: HTMLInputElement) {
    // Check required fields.
    if (props.required && input.value === '') {
        input.setCustomValidity('This field is required.');
        input.reportValidity();
        return false;
    }

    // Check number type.
    // Accepts empty strings, but not bad inputs.
    if (props.type === 'number' && input.validity.badInput) {
        input.setCustomValidity('This field must be a number.');
        input.reportValidity();
        return false;
    }

    // Check custom types.
    if (props.type in formItemCustomTypes) {
        const customType = formItemCustomTypes[props.type];
        if (input.value !== '' && !customType.validator(input.value)) {
            input.setCustomValidity(customType.validityMessage);
            input.reportValidity();
            return false;
        }
    }

    return true;
}

function value() {
    if (props.multiple) {
        const values = Array.from(inputElements.value)
            .filter((inputElement) => !inputIsEmpty(inputElement))
            .map((inputElement) => inputElement.value);
        return values;
    }

    return inputIsEmpty(inputElement.value) ? '' : inputElement.value!.value;
}

function empty() {
    return value().length === 0;
}

function checkValidity() {
    return Array.from(inputElements.value).every((inputElement) => inputIsValidity(inputElement));
}

defineExpose({
    name: props.name,
    value,
    empty,
    checkValidity,
});
</script>

<template>
    <div class="form-item">
        <label v-if="isCheckbox">
            <NCheckbox :name="name" ref="inputElement" />
            <span class="form-item-label-content">{{ label }}</span>
        </label>

        <label v-else>
            <span class="form-item-label-content">{{ label }}</span>

            <select :name="name" v-if="isSelect" ref="inputElement">
                <option v-for="{ value, label } in options" :value="value" :key="value">{{ label }}</option>
            </select>

            <div v-else ref="inputElementDiv">
                <input :name="name" :type="inputType" :placeholder="placeholder" ref="inputElement" />

                <template v-if="multiple">
                    <button @click.prevent="addInputElement">+</button>
                    <button @click.prevent="removeInputElement">-</button>

                    <template v-for="index in extraInputElementNumber" :key="index">
                        <br />
                        <input :name="name" :type="inputType" :placeholder="placeholder" ref="extraInputElements" />
                    </template>
                </template>
            </div>
        </label>

        <span class="form-item-description"> {{ description }} </span>
    </div>
</template>

<style scoped>
.form-item {
    margin-bottom: 10px;
}

.form-item-description {
    font-size: 0.875em;
    font-style: italic;
    color: #555;
    margin-top: 5px;
    margin-bottom: 10px;
    line-height: 1.5;
    display: block;
}

.form-item-label-content {
    font-weight: bold;
    margin-right: 8px;
}
</style>
