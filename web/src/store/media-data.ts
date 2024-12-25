import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MediaData } from '@/types/MediaData.types';

export const useMediaDataStore = defineStore('mediaData', () => {
    const value = ref<MediaData | null>();

    return {
        value,

        clear() {
            value.value = null;
        },
    };
});
