import { useDisplayModeStore } from '@/store/display-mode';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

beforeEach(() => {
    setActivePinia(createPinia());
});

describe('default state is the same as the system preference', () => {
    test('light mode', () => {
        global.matchMedia = vi.fn().mockReturnValue({ matches: false });

        const store = useDisplayModeStore();
        expect(store.state).toBe('light');
    });

    test('dark mode', () => {
        global.matchMedia = vi.fn().mockReturnValue({ matches: true });

        const store = useDisplayModeStore();
        expect(store.state).toBe('dark');
    });
});

test('toggle changes the state', () => {
    global.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const store = useDisplayModeStore();

    store.toggle();
    expect(store.state).toBe('dark');

    store.toggle();
    expect(store.state).toBe('light');
});
