import FormItem, { type FormItemInfo } from '@/components/FormItem.vue';
import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

class FormItemWrapper {
    protected wrapper: VueWrapper<InstanceType<typeof FormItem>>;

    constructor(props: Partial<FormItemInfo>) {
        this.wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                name: 'name',
                placeholder: 'placeholder',
                type: props.type ?? 'text',
                ...props,
            },
        });

        expect(this.wrapper.exists()).toBe(true);
    }

    get vm() {
        return this.wrapper.vm;
    }

    get text() {
        return this.wrapper.text();
    }

    get html() {
        return this.wrapper.html();
    }

    find(selector: string) {
        return this.wrapper.find(selector);
    }
}

class TextWrapper extends FormItemWrapper {
    constructor(props: Partial<FormItemInfo> = {}) {
        super({ type: 'text', ...props });
    }

    async setValue(value: string) {
        const input = this.wrapper.get('input');
        input.setValue(value);
        await input.trigger('input');
    }
}

class SelectWrapper extends FormItemWrapper {
    constructor(props: Partial<FormItemInfo> = {}) {
        super({
            type: 'select',
            options: [
                { label: 'option0', value: '' },
                { label: 'option1', value: '1' },
                { label: 'option2', value: '2' },
            ],
            ...props,
        });
    }

    setSelected(index: number) {
        this.wrapper.vm.setSelected(index);
    }
}

class ChechboxWrapper extends FormItemWrapper {
    constructor(props: Partial<FormItemInfo> = {}) {
        super({ type: 'checkbox', ...props });
    }

    setChecked(checked: boolean) {
        this.wrapper.vm.setChecked(checked);
    }
}

class DynamicInputWrapper extends FormItemWrapper {
    constructor(props: Partial<FormItemInfo> = {}) {
        super({ multiple: true, ...props });
    }

    get inputs() {
        return this.wrapper.findAll('input');
    }

    get addButton() {
        return this.wrapper.findAll('button').at(-1)!;
    }

    get removeButton() {
        return this.wrapper.findAll('button').at(-2)!;
    }

    async setValue(index: number, value: string) {
        const input = this.inputs.at(index);
        input?.setValue(value);
        await input?.trigger('input');
    }
}

describe('text type', () => {
    test('create element', () => {
        const wrapper = new TextWrapper();

        expect(wrapper.text).toContain('label');
        expect(wrapper.text).toContain('placeholder');

        expect(wrapper.find('[data-test="input"]').exists()).toBe(true);
    });

    test('check empty', async () => {
        const wrapper = new TextWrapper();
        expect(wrapper.vm.empty).toBe(true);

        await wrapper.setValue('value');
        expect(wrapper.vm.empty).toBe(false);

        await wrapper.setValue('');
        expect(wrapper.vm.empty).toBe(true);
    });

    test('get value', async () => {
        const wrapper = new TextWrapper();
        expect(wrapper.vm.value).toBe('');

        await wrapper.setValue('value');
        expect(wrapper.vm.value).toBe('value');

        await wrapper.setValue('another value');
        expect(wrapper.vm.value).toBe('another value');
    });
});

describe('select type', () => {
    test('create element', () => {
        const wrapper = new SelectWrapper();

        expect(wrapper.text).toContain('label');
        expect(wrapper.text).toContain('placeholder');

        expect(wrapper.find('[data-test="select"]').exists()).toBe(true);
    });

    test('check empty', () => {
        const wrapper = new SelectWrapper();
        expect(wrapper.vm.empty).toBe(true);

        wrapper.setSelected(1);
        expect(wrapper.vm.empty).toBe(false);

        wrapper.setSelected(0);
        expect(wrapper.vm.empty).toBe(true);
    });

    test('get value', () => {
        const wrapper = new SelectWrapper();
        expect(wrapper.vm.value).toBe('');

        wrapper.setSelected(1);
        expect(wrapper.vm.value).toBe('1');

        wrapper.setSelected(2);
        expect(wrapper.vm.value).toBe('2');
    });
});

describe('chechbox type', () => {
    test('create element', () => {
        const wrapper = new ChechboxWrapper();

        expect(wrapper.text).toContain('label');

        expect(wrapper.find('[data-test="checkbox"]').exists()).toBe(true);
    });

    test('check empty', () => {
        const wrapper = new ChechboxWrapper();
        expect(wrapper.vm.empty).toBe(true);

        wrapper.setChecked(true);
        expect(wrapper.vm.empty).toBe(false);

        wrapper.setChecked(false);
        expect(wrapper.vm.empty).toBe(true);
    });

    test('get value', () => {
        const wrapper = new ChechboxWrapper();
        expect(wrapper.vm.value).toBe('');

        wrapper.setChecked(true);
        expect(wrapper.vm.value).toBe('on');

        wrapper.setChecked(false);
        expect(wrapper.vm.value).toBe('');
    });
});

describe('dynamic input type', () => {
    test('create element', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick(); // wait for the first input to be created

        expect(wrapper.find('[data-test="dynamic-input"]').exists()).toBe(true);

        expect(wrapper.text).toContain('label');
        expect(wrapper.text).toContain('placeholder');

        expect(wrapper.inputs).toHaveLength(1);

        expect(wrapper.addButton.exists()).toBe(true);
        expect(wrapper.removeButton.exists()).toBe(true);
    });

    test('add input', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();

        await wrapper.addButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(2);

        await wrapper.addButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(3);
    });

    test('remove input', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();

        await wrapper.addButton.trigger('click');
        await wrapper.addButton.trigger('click');
        await wrapper.addButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(4);

        await wrapper.removeButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(3);

        await wrapper.removeButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(2);

        await wrapper.removeButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(1);
    });

    test('check empty with one input', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();

        expect(wrapper.vm.empty).toBe(true);

        await wrapper.setValue(0, 'value');
        expect(wrapper.vm.empty).toBe(false);

        await wrapper.setValue(0, '');
        expect(wrapper.vm.empty).toBe(true);
    });

    test('get value with one input', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();

        expect(wrapper.vm.value).toEqual([]);

        await wrapper.setValue(0, 'value');
        expect(wrapper.vm.value).toEqual(['value']);

        await wrapper.setValue(0, 'another value');
        expect(wrapper.vm.value).toEqual(['another value']);
    });

    test('check empty with multiple inputs', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();
        await wrapper.addButton.trigger('click');
        await wrapper.addButton.trigger('click');

        expect(wrapper.vm.empty).toBe(true);

        await wrapper.setValue(0, 'value');
        await wrapper.setValue(1, 'value');
        expect(wrapper.vm.empty).toBe(false);

        await wrapper.setValue(0, '');
        expect(wrapper.vm.empty).toBe(false);

        await wrapper.setValue(1, '');
        expect(wrapper.vm.empty).toBe(true);
    });

    test('get value with multiple inputs', async () => {
        const wrapper = new DynamicInputWrapper();
        await Promise.all([wrapper.addButton.trigger('click'), wrapper.addButton.trigger('click')]);

        expect(wrapper.vm.value).toEqual([]);

        await wrapper.setValue(0, 'value0');
        await wrapper.setValue(1, 'value1');
        expect(wrapper.vm.value).toEqual(['value0', 'value1']);

        await wrapper.setValue(0, 'another value0');
        expect(wrapper.vm.value).toEqual(['another value0', 'value1']);

        await wrapper.setValue(0, '');
        expect(wrapper.vm.value).toEqual(['value1']);
    });

    test("the last input can't be removed", async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();
        expect(wrapper.inputs).toHaveLength(1);

        await wrapper.removeButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(1);

        await wrapper.addButton.trigger('click');
        await wrapper.removeButton.trigger('click');
        await wrapper.removeButton.trigger('click');
        expect(wrapper.inputs).toHaveLength(1);
    });

    test('the new created input is empty', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();

        await wrapper.setValue(0, 'value');
        await wrapper.addButton.trigger('click');
        expect(wrapper.vm.value).toEqual(['value']);
    });

    test('remove an input don`t affect the others', async () => {
        const wrapper = new DynamicInputWrapper();
        await nextTick();
        await wrapper.addButton.trigger('click');
        await wrapper.addButton.trigger('click');

        await wrapper.setValue(0, 'value0');
        await wrapper.setValue(1, 'value1');
        await wrapper.setValue(2, 'value2');
        expect(wrapper.vm.value).toEqual(['value0', 'value1', 'value2']);

        await wrapper.removeButton.trigger('click');
        expect(wrapper.vm.value).toEqual(['value0', 'value1']);
    });
});
