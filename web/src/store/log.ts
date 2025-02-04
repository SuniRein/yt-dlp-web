import { defineStore } from 'pinia';
import { ref } from 'vue';

export const logLevels = ['debug', 'info', 'warning', 'error'] as const;
export type LogLevel = (typeof logLevels)[number];

export interface Log {
    time: Date;
    level: LogLevel;
    message: string;
}

export const useLogStore = defineStore('log', () => {
    const store = ref<Log[]>([]);

    return {
        store,

        clear() {
            store.value = [];
        },

        log(level: LogLevel, message: string) {
            store.value.push({
                time: new Date(),
                level,
                message,
            });
        },
    };
});
