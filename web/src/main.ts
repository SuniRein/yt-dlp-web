import { createApp } from 'vue';
import App from '@/App.vue';

import { registerFormItemCustomTypes } from '@/utils/form-item-custom-type';

registerFormItemCustomTypes();

const app = createApp(App);
app.mount('#app');
