import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import PreviewView from '@/views/PreviewView.vue';
import LogView from '@/views/LogView.vue';
import TaskView from '@/views/TaskView.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/preview',
            name: 'preview',
            component: PreviewView,
        },
        {
            path: '/log',
            name: 'log',
            component: LogView,
        },
        {
            path: '/settings',
            name: 'settings',
            redirect: '/',
        },
        {
            path: '/task',
            name: 'task',
            component: TaskView,
        },
    ],
});

export default router;
