import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi, type Mock } from 'vitest';
import FormItem from '../FormItem.vue';
import { mount, type VueWrapper, type DOMWrapper } from '@vue/test-utils';
import { registerCustomType, formItemCustomTypes } from '@/store/form-item-custom-type';

describe('common text input', () => {
    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let input: DOMWrapper<HTMLInputElement>;

    beforeEach(() => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'text',
                name: 'name',
                placeholder: 'placeholder',
            },
        });
        input = wrapper.find('input');
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('create element', () => {
        expect(wrapper.text()).toContain('label');
        expect(wrapper.text()).toContain('description');
        expect(wrapper.find('input').attributes('type')).toBe('text');
        expect(wrapper.find('input').attributes('name')).toBe('name');
    });

    test('get value', () => {
        expect(wrapper.vm.value()).toBe('');
        expect(wrapper.vm.empty()).toBe(true);

        input.setValue('value');
        expect(wrapper.vm.value()).toBe('value');
        expect(wrapper.vm.empty()).toBe(false);
    });

    test('placeholder', () => {
        expect(input.attributes('placeholder')).toBe('placeholder');
    });
});

describe("input with 'multiple'", () => {
    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let addButton: DOMWrapper<HTMLButtonElement>;
    let removeButton: DOMWrapper<HTMLButtonElement>;

    beforeEach(() => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'text',
                name: 'name',
                multiple: true,
            },
        });
        addButton = wrapper.findAll('button')[0];
        removeButton = wrapper.findAll('button')[1];
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('create element', () => {
        expect(wrapper.text()).toContain('label');
        expect(wrapper.text()).toContain('description');
        expect(wrapper.find('input').attributes('type')).toBe('text');
        expect(wrapper.find('input').attributes('name')).toBe('name');

        expect(wrapper.findAll('button')).toHaveLength(2);
        expect(addButton.text()).toBe('+');
        expect(removeButton.text()).toBe('-');
    });

    test('click the add button to add an input', async () => {
        expect(wrapper.findAll('input')).toHaveLength(1);

        await addButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(2);

        await addButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(3);
    });

    test('the added input should have the same name and type', async () => {
        await addButton.trigger('click');
        await addButton.trigger('click');
        wrapper.findAll('input').forEach((input) => {
            expect(input.attributes('type')).toBe('text');
            expect(input.attributes('name')).toBe('name');
        });
    });

    test('the added input should be empty', async () => {
        wrapper.find('input').setValue('value');
        expect(wrapper.find('input').element.value).toBe('value');

        await addButton.trigger('click');
        expect(wrapper.findAll('input')[1].element.value).toBe('');
        wrapper.findAll('input')[1].setValue('value');

        await addButton.trigger('click');
        expect(wrapper.findAll('input')[2].element.value).toBe('');
    });

    test('click the remove button to remove an input', async () => {
        await addButton.trigger('click');
        await addButton.trigger('click');
        await addButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(4);

        await removeButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(3);

        await removeButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(2);

        await removeButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(1);
    });

    test('the last input should not be removed', async () => {
        await removeButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(1);

        await addButton.trigger('click');
        await removeButton.trigger('click');
        await removeButton.trigger('click');
        expect(wrapper.findAll('input')).toHaveLength(1);
    });

    test('the value of other inputs should not be affected by removing', async () => {
        await addButton.trigger('click');
        await addButton.trigger('click');
        await addButton.trigger('click');

        const inputs = wrapper.findAll('input');
        inputs.forEach((input, index) => {
            input.setValue(`value${index}`);
        });

        await removeButton.trigger('click');
        inputs.forEach((input, index) => {
            expect(input.element.value).toBe(`value${index}`);
        });
    });

    test('get value', async () => {
        expect(wrapper.vm.value()).toEqual([]);
        expect(wrapper.vm.empty()).toBe(true);

        await addButton.trigger('click');
        expect(wrapper.vm.value()).toEqual([]);
        expect(wrapper.vm.empty()).toBe(true);

        wrapper.findAll('input').forEach((input, index) => {
            input.setValue(`value${index}`);
        });
        expect(wrapper.vm.value()).toEqual(['value0', 'value1']);
        expect(wrapper.vm.empty()).toBe(false);

        wrapper.findAll('input')[0].setValue('');
        expect(wrapper.vm.value()).toEqual(['value1']);
        expect(wrapper.vm.empty()).toBe(false);
    });
});

describe('select input', () => {
    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let select: DOMWrapper<HTMLSelectElement>;
    let options: Array<DOMWrapper<HTMLOptionElement>>;

    beforeEach(() => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'select',
                name: 'name',
                options: [
                    { value: 'none', label: 'Option 0' },
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' },
                ],
            },
        });
        select = wrapper.find('select');
        options = wrapper.findAll('option');
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('create element', () => {
        expect(wrapper.text()).toContain('label');
        expect(wrapper.text()).toContain('description');
        expect(select.attributes('name')).toBe('name');

        expect(options).toHaveLength(4);
        expect(options[0].text()).toBe('Option 0');
        expect(options[0].attributes('value')).toBe('none');
        options.slice(1).forEach((option, index) => {
            expect(option.text()).toBe(`Option ${index + 1}`);
            expect(option.attributes('value')).toBe(`option${index + 1}`);
        });
    });

    test('get value', () => {
        expect(wrapper.vm.value()).toBe('');
        expect(wrapper.vm.empty()).toBe(true);

        select.setValue('option1');
        expect(wrapper.vm.value()).toBe('option1');
        expect(wrapper.vm.empty()).toBe(false);

        select.setValue('none');
        expect(wrapper.vm.value()).toBe('');
        expect(wrapper.vm.empty()).toBe(true);
    });
});

describe('checkbox input', () => {
    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let checkbox: DOMWrapper<HTMLInputElement>;

    beforeEach(() => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'checkbox',
                name: 'name',
            },
        });
        checkbox = wrapper.find('input');
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('create element', () => {
        expect(wrapper.text()).toContain('label');
        expect(wrapper.text()).toContain('description');

        expect(checkbox.attributes('type')).toBe('checkbox');
        expect(checkbox.attributes('name')).toBe('name');
    });

    test('get value', () => {
        expect(wrapper.vm.value()).toBe('');
        expect(wrapper.vm.empty()).toBe(true);

        checkbox.setValue(true);
        expect(wrapper.vm.value()).toBe('on');
        expect(wrapper.vm.empty()).toBe(false);

        checkbox.setValue(false);
        expect(wrapper.vm.value()).toBe('');
        expect(wrapper.vm.empty()).toBe(true);
    });
});

describe.skip('radio input', () => {
    let wrappers: Array<VueWrapper<InstanceType<typeof FormItem>>>;
    let audios: Array<DOMWrapper<HTMLInputElement>>;

    beforeEach(() => {
        wrappers = Array.from({ length: 4 }).map((_, index) =>
            mount(FormItem, {
                props: {
                    label: 'label',
                    description: 'description',
                    type: 'radio',
                    name: 'name',
                    value: `option${index}`,
                },
            }),
        );
        audios = wrappers.map((wrapper) => wrapper.find('input'));
    });

    afterEach(() => {
        wrappers.forEach((wrapper) => wrapper.unmount());
    });

    test('create element', () => {
        wrappers.forEach((wrapper, index) => {
            expect(wrapper.text()).toContain('label');
            expect(wrapper.text()).toContain('description');
            expect(audios[index].attributes('type')).toBe('radio');
            expect(audios[index].attributes('name')).toBe('name');
            expect(audios[index].attributes('value')).toBe(`option${index}`);
        });
    });

    test.skip('get value', () => {});
});

describe('custom input type', () => {
    beforeAll(() => {
        registerCustomType({
            type: 'my-custom',
            validator: (value) => /^[\d]+$/.test(value),
            validityMessage: 'Invalid value',
        });

        expect(formItemCustomTypes).toHaveProperty('my-custom');
    });

    afterAll(() => {
        delete formItemCustomTypes['my-custom'];
        expect(formItemCustomTypes).not.toHaveProperty('my-custom');
    });

    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let input: DOMWrapper<HTMLInputElement>;
    let reportValidity: Mock<() => boolean>;

    beforeEach(() => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'my-custom',
                name: 'name',
            },
        });
        input = wrapper.find('input');

        reportValidity = vi.fn(() => true);
        input.element.reportValidity = reportValidity;
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('create element', () => {
        expect(wrapper.text()).toContain('label');
        expect(wrapper.text()).toContain('description');
        expect(input.attributes('type')).toBe('text');
        expect(input.attributes('name')).toBe('name');
    });

    test('empty value is always valid', () => {
        expect(wrapper.vm.checkValidity()).toBe(true);
        expect(wrapper.vm.empty()).toBe(true);
        expect(reportValidity).not.toHaveBeenCalled();
    });

    test('invalid value', () => {
        const invalidValues = ['abc', '123abc', 'abc123'];

        invalidValues.forEach((value, index) => {
            input.setValue(value);
            expect(wrapper.vm.checkValidity()).toBe(false);
            expect(reportValidity).toHaveBeenCalledTimes(index + 1);
        });
    });

    test('valid value', () => {
        const validValues = ['123', '456', '78919'];

        validValues.forEach((value) => {
            input.setValue(value);
            expect(wrapper.vm.checkValidity()).toBe(true);
            expect(reportValidity).not.toHaveBeenCalled();
        });
    });
});

describe("input with 'required'", () => {
    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let input: DOMWrapper<HTMLInputElement>;
    let reportValidity: Mock<() => boolean>;

    beforeEach(() => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'text',
                name: 'name',
                required: true,
            },
        });
        input = wrapper.find('input');

        reportValidity = vi.fn(() => true);
        input.element.reportValidity = reportValidity;
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('create element', () => {
        expect(wrapper.text()).toContain('label');
        expect(wrapper.text()).toContain('description');
        expect(input.attributes('type')).toBe('text');
        expect(input.attributes('name')).toBe('name');
    });

    test('empty value is invalid', () => {
        expect(wrapper.vm.checkValidity()).toBe(false);
        expect(reportValidity).toHaveBeenCalledTimes(1);
    });

    test('non-empty value is valid', () => {
        input.setValue('value');
        expect(wrapper.vm.checkValidity()).toBe(true);
        expect(reportValidity).not.toHaveBeenCalled();
    });
});

describe("input with 'multiple' and 'required'", () => {
    let wrapper: VueWrapper<InstanceType<typeof FormItem>>;
    let inputs: Array<DOMWrapper<HTMLInputElement>>;
    let reportValiditys: Array<Mock<() => boolean>>;

    beforeEach(async () => {
        wrapper = mount(FormItem, {
            props: {
                label: 'label',
                description: 'description',
                type: 'type',
                name: 'name',
                required: true,
                multiple: true,
            },
        });

        await wrapper.findAll('button')[0].trigger('click');
        await wrapper.findAll('button')[0].trigger('click');
        await wrapper.findAll('button')[0].trigger('click');

        inputs = wrapper.findAll('input');
        expect(inputs).toHaveLength(4);

        reportValiditys = inputs.map((input) => {
            const reportValidity = vi.fn(() => true);
            input.element.reportValidity = reportValidity;
            return reportValidity;
        });
        expect(reportValiditys).toHaveLength(4);
    });

    afterEach(() => {
        wrapper.unmount();
    });

    test('empty value is invalid', () => {
        expect(wrapper.vm.checkValidity()).toBe(false);
        expect(reportValiditys[0]).toHaveBeenCalledTimes(1);
        reportValiditys.slice(1).forEach((reportValidity) => {
            expect(reportValidity).not.toHaveBeenCalled();
        });
    });

    test('only the first empty value will be checked', () => {
        inputs[0].setValue('value');
        inputs[3].setValue('value');

        expect(wrapper.vm.checkValidity()).toBe(false);
        expect(reportValiditys[1]).toHaveBeenCalledTimes(1);
        reportValiditys.forEach((reportValidity, index) => {
            if (index !== 1) {
                expect(reportValidity).not.toHaveBeenCalled();
            }
        });
    });

    test('all values are non-empty', () => {
        inputs.forEach((input) => input.setValue('value'));
        expect(wrapper.vm.checkValidity()).toBe(true);
        reportValiditys.forEach((reportValidity) => {
            expect(reportValidity).not.toHaveBeenCalled();
        });
    });
});
