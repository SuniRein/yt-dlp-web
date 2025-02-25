import { ref } from 'vue';
import { defineStore } from 'pinia';

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
