import type { NotificationApiInjection } from "naive-ui/es/notification/src/NotificationProvider";

let notification: NotificationApiInjection | null = null;

export function registerNotificationApi(api: NotificationApiInjection) {
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
