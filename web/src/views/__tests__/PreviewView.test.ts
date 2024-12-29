import PreviewView from '@/views/PreviewView.vue';
import { NConfigProvider } from 'naive-ui';

import { setActivePinia, createPinia } from 'pinia';
import { useMediaDataStore } from '@/store/media-data';
import type { MediaData } from '@/types/MediaData.types';

import { mount } from '@vue/test-utils';
import { test, expect, vi, afterAll } from 'vitest';

import info from '@/dev/media-info.json';

setActivePinia(createPinia());
const mediaData = useMediaDataStore();

// TODO: A more elegant way to set date locale
vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('2024/12/18');
afterAll(() => vi.restoreAllMocks());

// NDataTable needs to be wrapped in NConfigProvider.
const app = mount({
    components: { NConfigProvider, PreviewView },
    template: `<NConfigProvider><PreviewView /></NConfigProvider>`,
});
const preview = app.getComponent(PreviewView);

function findElement(name: string) {
    return preview.find(`[data-test="preview-${name}"]`);
}

function getElement(name: string) {
    return preview.find(`[data-test="preview-${name}"]`);
}

function getStaticHtml(name: string) {
    return getElement(name)
        .html()
        .replace(/ data-n-id=".*?"/g, '')
        .replace(/ data-v-.{8}=".*?"/g, '')
        .replace(/ data-test=".*?"/g, '');
}

test('create element', () => {
    expect(findElement('clear-button').exists()).toBe(true);
    expect(findElement('content').exists()).toBe(false);
});

test('show preview', async () => {
    mediaData.value = info as MediaData;
    await preview.vm.$nextTick();

    expect(findElement('content').exists()).toBe(true);
    expect(getStaticHtml('media-show')).toMatchSnapshot();
    expect(getStaticHtml('media-format-table')).toMatchSnapshot();
});

test('clear preview', async () => {
    const clearButton = getElement('clear-button');
    await clearButton.trigger('click');

    expect(findElement('content').exists()).toBe(false);
    expect(mediaData.value).toBeNull();
});
