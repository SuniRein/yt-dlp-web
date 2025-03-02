import type { NotificationApi } from 'naive-ui';

let notificationApi: NotificationApi | null = null;

export function registerNotificationApi(api: NotificationApi) {
    if (notificationApi) {
        throw new Error('Notification API is already registered');
    }

    notificationApi = api;
}

export function unregisterNotificationApi() {
    notificationApi = null;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
    title: string;
    description: string;
}

function notify(type: NotificationType, notification: Notification) {
    if (!notificationApi) {
        throw new Error('Notification API is not registered');
    }

    notificationApi[type]({
        ...notification,
        duration: 3000,
        keepAliveOnHover: true,
    });
}

function success(notification: Notification) {
    notify('success', notification);
}

function info(notification: Notification) {
    notify('info', notification);
}

function warning(notification: Notification) {
    notify('warning', notification);
}

function error(notification: Notification) {
    notify('error', notification);
}

export default { success, info, warning, error };
