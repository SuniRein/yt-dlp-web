import LogArea from '@/components/LogArea.vue';
import { test, expect } from 'vitest';
import { mount } from '@vue/test-utils';

test('log message', async () => {
    const wrapper = mount(LogArea);

    const message = 'Hello, World!';
    await wrapper.vm.log(message);

    expect(wrapper.text()).toContain(message);
});

test('new log message does not replace old log message', async () => {
    const wrapper = mount(LogArea);

    const firstMessage = 'Hello, World!';
    const secondMessage = 'Goodbye, World!';
    await wrapper.vm.log(firstMessage);
    await wrapper.vm.log(secondMessage);

    expect(wrapper.text()).toContain(firstMessage);
    expect(wrapper.text()).toContain(secondMessage);
});

test('clear log', async () => {
    const wrapper = mount(LogArea);

    const message = 'Hello, World!';
    await wrapper.vm.log(message);
    await wrapper.vm.clear();

    expect(wrapper.text()).not.toContain(message);
});
