import { defineStore } from 'pinia';
import { ref } from 'vue';

type displayModeState = 'light' | 'dark';

export const useDisplayModeStore = defineStore('displayMode', () => {
    const state = ref<displayModeState>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    function toggle() {
        state.value = state.value === 'light' ? 'dark' : 'light';
    }

    return {
        state,
        toggle,
    };
});
