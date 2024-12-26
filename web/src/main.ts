import { createApp } from 'vue';
import router from '@/router';
import { createPinia } from 'pinia';

import App from '@/App.vue';

import { useLogStore } from '@/store/log';
import { bytesToSize } from '@/utils/show';

createApp(App).use(createPinia()).use(router).mount('#app');

const log = useLogStore();

function showDownloadProgress(rawData: Uint8Array) {
    const data = new TextDecoder().decode(rawData);
    const json = JSON.parse(data);

    const filename = json.filename;
    const downloaded_bytes = bytesToSize(json.downloaded_bytes);
    const total_bytes = bytesToSize(json.total_bytes);
    const speed = bytesToSize(json.speed);
    const progress = (json.downloaded_bytes / json.total_bytes) * 100;
    log.log(
        `Downloading ${filename}: ${downloaded_bytes} / ${total_bytes} (${progress.toFixed(2)}%) Speed: ${speed}/s`,
    );
}

declare global {
    interface Window {
        logMessage: (message: string) => void;
        showDownloadProgress: (rawData: Uint8Array) => void;
        showDownloadInfo: (rawData: Uint8Array) => void;
    }
}

window.logMessage = (message: string) => log.log(message);
window.showDownloadProgress = showDownloadProgress;
window.showDownloadInfo = (rawData: Uint8Array) => log.log(new TextDecoder().decode(rawData));
