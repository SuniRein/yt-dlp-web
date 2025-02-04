import LogView from '@/views/LogView.vue';
import { NConfigProvider } from 'naive-ui';
import { useLogStore } from '@/store/log';
import { test, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';

setActivePinia(createPinia());

const log = useLogStore();

// NDataTable needs to be wrapped in NConfigProvider.
const app = mount({
    components: { NConfigProvider, LogView },
    template: `<NConfigProvider><LogView /></NConfigProvider>`,
});

const wrapper = app.getComponent(LogView);

test('log message', async () => {
    const message = 'Hello, World!';
    log.log('info', message);
    await wrapper.vm.$nextTick();

    const content = wrapper.get('[data-test="log-content"]');
    expect(content.text()).toContain('Info');
    expect(content.text()).toContain(message);
});

test('new log message does not replace old log message', async () => {
    const secondMessage = 'Goodbye, World!';
    log.log('debug', secondMessage);
    await wrapper.vm.$nextTick();

    const content = wrapper.get('[data-test="log-content"]');
    expect(content.text()).toContain('Debug');
    expect(content.text()).toContain(secondMessage);
});

test('clear log', async () => {
    const clearButton = wrapper.get('[data-test="log-clear-button"]');
    await clearButton.trigger('click');

    const content = wrapper.get('[data-test="log-content"]');
    expect(content.text()).toContain('No log.');

    expect(log.store).toHaveLength(0);
});
