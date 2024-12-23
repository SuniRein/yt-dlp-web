export interface FormItemValidator {
    verify: (value: string) => boolean;
    message: string;
}

interface FormItemBase {
    label: string;
    description: string;
    name: string;
}

interface TextFormItemBase extends FormItemBase {
    required?: boolean;
    placeholder?: string;
    validator?: FormItemValidator;
}

export interface TextFormItem extends TextFormItemBase {
    type: 'text';
}

export interface DynamicFormItem extends TextFormItemBase {
    type: 'dynamic';
}

export interface SelectFormItem extends FormItemBase {
    type: 'select';
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface CheckboxFormItem extends FormItemBase {
    type: 'checkbox';
}

export type FormItemInfo = TextFormItem | DynamicFormItem | SelectFormItem | CheckboxFormItem;

export interface FormItemSet {
    name: string;
    items: FormItemInfo[];
}
