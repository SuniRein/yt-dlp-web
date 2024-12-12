import { reactive } from 'vue';

export interface FormItemCustomType {
    type: string;
    validator: (value: string) => boolean;
    validityMessage: string;
}

interface FormItemCustomTypeMap {
    [key: string]: Omit<FormItemCustomType, 'type'>;
}

export const formItemCustomTypes = reactive<FormItemCustomTypeMap>({});

export function registerCustomType(customType: FormItemCustomType) {
    const { type, ...rest } = customType;
    formItemCustomTypes[type] = rest;
}
