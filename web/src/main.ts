import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@/App.vue';

import router from '@/router';

import { type LogLevel, logLevels, useLogStore } from '@/store/log';
import { useMediaDataStore } from '@/store/media-data';
import { type DownloadProgress, useTasksStore } from '@/store/tasks';

import notificationApi from '@/utils/notification-api';

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

window.logMessage = (rawData: Uint8Array) => {
    const str = new TextDecoder().decode(rawData);

    const { level, message } = JSON.parse(str);
    if (level === undefined || message === undefined || typeof level !== 'string' || typeof message !== 'string') {
        log.error(`Invalid log message: ${str}`);
        return;
    }

    if (!logLevels.includes(level as LogLevel)) {
        log.error(`Invalid log level: ${level}.`);
        return;
    }

    log.log(level as LogLevel, message);
};

window.showDownloadProgress = showDownloadProgress;
window.showDownloadInfo = () => {};
window.showPreviewInfo = (rawData: Uint8Array) => (mediaData.value = JSON.parse(new TextDecoder().decode(rawData)));

window.reportCompletion = (id: number) => {
    tasks.setStatus(id, 'done');

    notificationApi.success({
        title: `Completed task ${id}`,
        description: `Task ${id} has been completed.`,
    });
};

window.reportInterruption = (id: number) => {
    tasks.setStatus(id, 'interrupted');

    notificationApi.error({
        title: `Interrupted task ${id}`,
        description: 'Task has been interrupted. Check the log for more information.',
    });
};
