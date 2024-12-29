import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLogStore = defineStore('log', () => {
    const value = ref('');

    return {
        value,

        clear() {
            value.value = '';
        },

        log(message: string) {
            value.value += `${message}\n`;
        },
    };
});
