import PreviewView from '@/views/PreviewView.vue';

import { setActivePinia, createPinia } from 'pinia';
import { useMediaDataStore } from '@/store/media-data';
import type { MediaData } from '@/types/MediaData.types';

import { mount } from '@vue/test-utils';
import { test, expect } from 'vitest';

import info from './media-info.json';

setActivePinia(createPinia());
const mediaData = useMediaDataStore();

const preview = mount(PreviewView);

function getContent() {
    return preview.find('[data-test="preview-content"]');
}

function getStaticHtml() {
    return getContent()
        .html()
        .replace(/data-n-id=".*?"/g, '')
        .replace(/data-v-.{8}=".*?"/g, '')
        .replace(/data-test=".*?"/g, '');
}

test('create element', () => {
    expect(getContent().exists()).toBe(false);
});

test('show preview', async () => {
    mediaData.value = info as MediaData;
    await preview.vm.$nextTick();

    expect(getContent().exists()).toBe(true);
    expect(getStaticHtml()).toMatchSnapshot();
});

test('clear preview', async () => {
    const clearButton = preview.get('[data-test="preview-clear-button"]');
    await clearButton.trigger('click');

    expect(getContent().exists()).toBe(false);
    expect(mediaData.value).toBeNull();
});
