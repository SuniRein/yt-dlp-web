import LogView from '@/views/LogView.vue';
import { useLogStore } from '@/store/log';
import { test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';

beforeEach(() => {
    setActivePinia(createPinia());
});

test('log message', async () => {
    const wrapper = mount(LogView);
    const log = useLogStore();

    const message = 'Hello, World!';
    log.log(message);
    await wrapper.vm.$nextTick();

    const content = wrapper.get('[data-test="log-content"]');
    expect(content.text()).toContain(message);
});

test('new log message does not replace old log message', async () => {
    const wrapper = mount(LogView);
    const log = useLogStore();

    const firstMessage = 'Hello, World!';
    log.log(firstMessage);
    await wrapper.vm.$nextTick();

    const secondMessage = 'Goodbye, World!';
    log.log(secondMessage);
    await wrapper.vm.$nextTick();

    const content = wrapper.get('[data-test="log-content"]');
    expect(content.text()).toContain(firstMessage);
    expect(content.text()).toContain(secondMessage);
});

test('clear log', async () => {
    const wrapper = mount(LogView);
    const log = useLogStore();

    const message = 'Hello, World!';
    log.log(message);
    await wrapper.vm.$nextTick();

    const clearButton = wrapper.get('[data-test="log-clear-button"]');
    await clearButton.trigger('click');

    const content = wrapper.get('[data-test="log-content"]');
    expect(content.text()).toBe('');

    expect(log.value).toBe('');
});
