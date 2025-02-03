import { defineStore } from 'pinia';
import { ref, computed, capitalize } from 'vue';

export const logLevels = ['debug', 'info', 'warning', 'error'] as const;
export type LogLevel = (typeof logLevels)[number];

export const useLogStore = defineStore('log', () => {
    const store = ref<[LogLevel, string][]>([]);

    const str = computed(() => store.value.map(([level, message]) => `[${capitalize(level)}] ${message}\n`).join(''));

    return {
        store,

        str,

        clear() {
            store.value = [];
        },

        log(level: LogLevel, message: string) {
            store.value.push([level, message]);
        },
    };
});
