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

    function clear() {
        store.value = [];
    }

    function log(level: LogLevel, message: string) {
        store.value.push({
            time: new Date(),
            level,
            message,
        });
    }

    function debug(message: string) {
        log('debug', message);
    }

    function info(message: string) {
        log('info', message);
    }

    function warning(message: string) {
        log('warning', message);
    }

    function error(message: string) {
        log('error', message);
    }

    return {
        store,

        clear,
        log,

        debug,
        info,
        warning,
        error,
    };
});
