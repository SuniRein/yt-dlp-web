import { createApp } from 'vue';
import router from '@/router';
import { createPinia } from 'pinia';

import App from '@/App.vue';

import { useLogStore, logLevels, type LogLevel } from '@/store/log';
import { useMediaDataStore } from '@/store/media-data';
import { useTasksStore, type DownloadProgress } from '@/store/tasks';

import { useNotification } from '@/utils/notification';

createApp(App).use(createPinia()).use(router).mount('#app');

const log = useLogStore();
const mediaData = useMediaDataStore();
const tasks = useTasksStore();

const notification = useNotification();

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

    notification.success({
        title: `Completed task ${id}`,
        description: `Task ${id} has been completed.`,
        duration: 3000,
        keepAliveOnHover: true,
    });
};

window.reportInterruption = (id: number) => {
    tasks.setStatus(id, 'interrupted');

    notification.error({
        title: `Interrupted task ${id}`,
        description: 'Task has been interrupted. Check the log for more information.',
        duration: 3000,
        keepAliveOnHover: true,
    });
};
