import PreviewArea, { type UrlDataInfo } from '@/components/PreviewArea.vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { test, expect } from 'vitest';
import info from './media-info.json';

type PreviewAreaInst = InstanceType<typeof PreviewArea>;

let preview: VueWrapper<PreviewAreaInst>;

function getStaticHtml() {
    return preview.html().replace(/data-n-id=".*?"/g, '');
}

test('create element', () => {
    preview = mount(PreviewArea);
    expect(getStaticHtml()).toMatchSnapshot();
});

test('show preview', async () => {
    await preview.vm.preview(info as UrlDataInfo);
    expect(getStaticHtml()).toMatchSnapshot();
});

test('clear preview', async () => {
    await preview.vm.clear();
    expect(getStaticHtml()).toMatchSnapshot();
});
