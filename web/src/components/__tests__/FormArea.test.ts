import FormArea from '@/components/FormArea.vue';
import FormItem from '@/components/FormItem.vue';
import { describe, test, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';

type FormItemInst = InstanceType<typeof FormItem>;

function createWrapper() {
    const wrapper = mount(FormArea, {
        props: {
            info: [
                {
                    name: 'group1',
                    items: [
                        { label: 'item1', description: 'description1', type: 'text', name: 'text1' },
                        { label: 'item2', description: 'description2', type: 'text', name: 'text2' },
                    ],
                },
                {
                    name: 'group2',
                    items: [
                        {
                            label: 'item3',
                            description: 'description3',
                            type: 'select',
                            name: 'select',
                            options: [
                                { label: 'option0', value: '' },
                                { label: 'option1', value: 'value1' },
                                { label: 'option2', value: 'value2' },
                            ],
                        },
                        { label: 'item4', description: 'description4', type: 'checkbox', name: 'checkbox' },
                        {
                            label: 'item5',
                            description: 'description5',
                            type: 'text',
                            multiple: true,
                            name: 'dynamic-input',
                        },
                    ],
                },
            ],
        },
    });
    expect(wrapper.exists()).toBe(true);
    return wrapper;
}

function setInputValue(item: VueWrapper<FormItemInst>, value: string, index?: number) {
    const input = item.findAll('input')[index ?? 0];
    expect(input).toBeTruthy();
    input.setValue(value);
    return input.trigger('input');
}

describe('check info display', () => {
    const wrapper = createWrapper();

    test('show name of form item sets', () => {
        const sets = wrapper.findAll('[data-test="form-set"]');
        expect(sets).toHaveLength(2);
        expect(sets[0].text()).toContain('group1');
        expect(sets[1].text()).toContain('group2');
    });

    test('form items are rendered correctly', () => {
        const [group1, group2] = wrapper.findAll('[data-test="form-set"]');

        const [input1, input2] = group1.findAllComponents('[data-test="form-item"]');

        expect(input1.text()).toContain('item1');
        expect(input1.vm.type).toBe('text');

        expect(input2.text()).toContain('item2');
        expect(input2.vm.type).toBe('text');

        const [select, checkbox, dynamicInput] = group2.findAllComponents('[data-test="form-item"]');

        expect(select.text()).toContain('item3');
        expect(select.vm.type).toBe('select');

        expect(checkbox.text()).toContain('item4');
        expect(checkbox.vm.type).toBe('checkbox');

        expect(dynamicInput.text()).toContain('item5');
        expect(dynamicInput.vm.type).toBe('text');
        expect(dynamicInput.vm.multiple).toBe(true);
    });
});

describe('get form data', () => {
    test("get text input's value", async () => {
        const wrapper = createWrapper();
        expect(wrapper.vm.data).toEqual({});

        const [text1, text2] = wrapper.findAllComponents(FormItem).slice(0, 2);

        await setInputValue(text1, 'value1');
        await setInputValue(text2, 'value2');
        expect(wrapper.vm.data).toEqual({ text1: 'value1', text2: 'value2' });

        await setInputValue(text1, '');
        expect(wrapper.vm.data).toEqual({ text2: 'value2' });
    });

    test("get select input's value", async () => {
        const wrapper = createWrapper();
        expect(wrapper.vm.data).toEqual({});

        const select = wrapper.findAllComponents(FormItem)[2];

        select.vm.setSelected(0);
        expect(wrapper.vm.data).toEqual({});

        select.vm.setSelected(1);
        expect(wrapper.vm.data).toEqual({ select: 'value1' });

        select.vm.setSelected(2);
        expect(wrapper.vm.data).toEqual({ select: 'value2' });
    });

    test("get checkbox input's value", async () => {
        const wrapper = createWrapper();
        expect(wrapper.vm.data).toEqual({});

        const checkbox = wrapper.findAllComponents(FormItem)[3];

        checkbox.vm.setChecked(true);
        expect(wrapper.vm.data).toEqual({ checkbox: 'on' });

        checkbox.vm.setChecked(false);
        expect(wrapper.vm.data).toEqual({});
    });

    test("get dynamic input's value", async () => {
        const wrapper = createWrapper();
        await wrapper.vm.$nextTick(); // wait for the first item of dynamic input to be created

        expect(wrapper.vm.data).toEqual({});

        const dynamicInput = wrapper.findAllComponents(FormItem)[4];

        await setInputValue(dynamicInput, 'value1');
        expect(wrapper.vm.data).toEqual({ 'dynamic-input': ['value1'] });

        await dynamicInput.findAll('button')[1].trigger('click');

        await setInputValue(dynamicInput, 'value2', 1);
        expect(wrapper.vm.data).toEqual({ 'dynamic-input': ['value1', 'value2'] });

        await setInputValue(dynamicInput, '', 0);
        expect(wrapper.vm.data).toEqual({ 'dynamic-input': ['value2'] });
    });
});

describe.todo('check form validation');
