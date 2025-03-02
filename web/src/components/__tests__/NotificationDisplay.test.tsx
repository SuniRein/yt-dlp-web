import { mount } from '@vue/test-utils';
import { beforeEach, expect, test } from 'vitest';

import { nextTick } from 'vue';

import { NNotificationProvider } from 'naive-ui';

import NotificationDisplay from '@/components/NotificationDisplay.vue';

import notificationApi from '@/utils/notification-api';

beforeEach(() => {
    const wrapper = mount(
        <NNotificationProvider>
            <NotificationDisplay />
        </NNotificationProvider>,
    );

    return () => {
        wrapper.unmount();
    };
});

test('display a single notification', async () => {
    const notification = {
        title: 'Test Title',
        description: 'Test Description',
    };

    notificationApi.success(notification);

    await nextTick();

    expect(document.body.textContent).toContain(notification.title);
    expect(document.body.textContent).toContain(notification.description);
});

test('display multiple notifications', async () => {
    const notifications = [
        {
            title: 'Test Title 2',
            description: 'Test Description 2',
        },
        {
            title: 'Another Title',
            description: 'Another Description',
        },
    ];

    notificationApi.info(notifications[0]);
    notificationApi.error(notifications[1]);

    await nextTick();

    expect(document.body.textContent).toContain(notifications[0].title);
    expect(document.body.textContent).toContain(notifications[0].description);

    expect(document.body.textContent).toContain(notifications[1].title);
    expect(document.body.textContent).toContain(notifications[1].description);
});
