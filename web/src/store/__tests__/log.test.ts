import { useLogStore } from '@/store/log';
import { test, expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

setActivePinia(createPinia());

const log = useLogStore();

test('log message', () => {
    log.log('Hello, World!');
    expect(log.value).toContain('Hello, World!\n');
});

test('log multiple messages', () => {
    log.log('Another Hello, World!');
    expect(log.value).toContain('Hello, World!\n');
    expect(log.value).toContain('Another Hello, World!\n');
});

test('clear log', () => {
    log.clear();
    expect(log.value).toBe('');
});
