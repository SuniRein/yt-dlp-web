import type { NotificationApi } from 'naive-ui';

let notification: NotificationApi | null = null;

export function registerNotificationApi(api: NotificationApi) {
    if (notification) {
        throw new Error('Notification API is already registered');
    }

    notification = api;
}

export function useNotification() {
    if (!notification) {
        throw new Error('Notification API is not registered');
    }

    return notification;
}
