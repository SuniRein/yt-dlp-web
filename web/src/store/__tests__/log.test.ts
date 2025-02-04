import { useLogStore } from '@/store/log';
import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const date = new Date(2021, 0, 1, 0, 0, 0);

beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(date);
});

afterEach(() => {
    vi.useRealTimers();
});

test('log info', () => {
    const log = useLogStore();

    log.log('info', 'Hello, World!');

    expect(log.store).toHaveLength(1);
    expect(log.store[0]).toEqual({
        time: date,
        level: 'info',
        message: 'Hello, World!',
    });
});

test('log warning', () => {
    const log = useLogStore();

    log.log('warning', 'Hello, World!');

    expect(log.store).toHaveLength(1);
    expect(log.store[0]).toEqual({
        time: date,
        level: 'warning',
        message: 'Hello, World!',
    });
});

test('log multiple messages', () => {
    const log = useLogStore();

    log.log('error', 'Hello, World!');
    log.log('debug', 'Another Hello, World!');

    expect(log.store).toHaveLength(2);
    expect(log.store[0]).toEqual({
        time: date,
        level: 'error',
        message: 'Hello, World!',
    });
    expect(log.store[1]).toEqual({
        time: date,
        level: 'debug',
        message: 'Another Hello, World!',
    });
});

test('clear log', () => {
    const log = useLogStore();

    log.log('warning', 'Hello, World!');
    log.clear();

    expect(log.store).toHaveLength(0);
});
