import { useLogStore } from '@/store/log';
import { test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

beforeEach(() => setActivePinia(createPinia()));

test('log info', () => {
    const log = useLogStore();

    log.log('info', 'Hello, World!');

    expect(log.str).toBe('[Info] Hello, World!\n');
});

test('log warning', () => {
    const log = useLogStore();

    log.log('warning', 'Hello, World!');

    expect(log.str).toBe('[Warning] Hello, World!\n');
});

test('log multiple messages', () => {
    const log = useLogStore();

    log.log('error', 'Hello, World!');
    log.log('debug', 'Another Hello, World!');

    expect(log.str).toBe('[Error] Hello, World!\n[Debug] Another Hello, World!\n');
});

test('clear log', () => {
    const log = useLogStore();

    log.log('warning', 'Hello, World!');
    log.clear();

    expect(log.str).toBe('');
});
