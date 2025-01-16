import { createApp } from 'vue';
import router from '@/router';
import { createPinia } from 'pinia';

import App from '@/App.vue';

import { useLogStore } from '@/store/log';
import { useMediaDataStore } from '@/store/media-data';
import { useTasksStore, type DownloadProgress } from '@/store/tasks';

createApp(App).use(createPinia()).use(router).mount('#app');

const log = useLogStore();
const mediaData = useMediaDataStore();
const tasks = useTasksStore();

function showDownloadProgress(rawData: Uint8Array) {
    const data = new TextDecoder().decode(rawData);

    // TODO: Check if the data is valid
    const progress = JSON.parse(data) as DownloadProgress & { task_id: number };
    const id = progress.task_id;
    tasks.setProgress(id, progress);
}

window.logMessage = (message: string) => log.log(message);
window.showDownloadProgress = showDownloadProgress;
window.showDownloadInfo = (rawData: Uint8Array) => log.log(new TextDecoder().decode(rawData));
window.showPreviewInfo = (rawData: Uint8Array) => (mediaData.value = JSON.parse(new TextDecoder().decode(rawData)));

window.reportCompletion = (id: number) => tasks.setStatus(id, 'done');
window.reportInterruption = (id: number) => tasks.setStatus(id, 'interrupted');
