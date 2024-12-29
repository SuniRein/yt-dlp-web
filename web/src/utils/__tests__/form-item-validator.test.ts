/* eslint-disable vitest/expect-expect */

import * as Validator from '@/utils/form-item-validator';
import type { FormItemValidator } from '@/types/FormItem.types';
import { describe, test, expect } from 'vitest';

function verifyValid(validator: FormItemValidator, values: string[]) {
    values.forEach((value) => {
        try {
            expect(validator.verify(value)).toBe(true);
        } catch {
            throw new Error(`Failed to validate: ${value}`);
        }
    });
}

function verifyInvalid(validator: FormItemValidator, values: string[]) {
    values.forEach((value) => {
        try {
            expect(validator.verify(value)).toBe(false);
        } catch {
            throw new Error(`Failed to invalidate: ${value}`);
        }
    });
}

describe('URL Validator', () => {
    test('validate a valid URL', () => {
        expect(Validator.Url.verify('https://www.example.com')).toBe(true);
    });

    test('invalidate an invalid URL', () => {
        expect(Validator.Url.verify('www.example.com')).toBe(false);
    });
});

describe('Real Number Validator', () => {
    test('validate a valid real number', () => {
        verifyValid(Validator.RealNumber, ['1', '1.0', '1.1', '0.1', '0.0', '0.00001', '189.12']);
    });

    test('invalidate an invalid real number', () => {
        verifyInvalid(Validator.RealNumber, ['1.', '1.1.', '1.1.1', '-1', '-1.0', '+1.0']);
    });

    test('invalidate a non-number input', () => {
        verifyInvalid(Validator.Integer, ['test', 'not a number', 'infinity', 'infinite']);
    });
});

describe('Integer Validator', () => {
    test('validate a valid integer', () => {
        verifyValid(Validator.Integer, ['1', '0', '100', '1000000']);
    });

    test('invalidate a non-integer number', () => {
        verifyInvalid(Validator.Integer, ['1.', '1.0', '1.1', '-1', '-1.0', '+1.0', '+1']);
    });

    test('invalidate a non-number input', () => {
        verifyInvalid(Validator.Integer, ['test', 'not a number', 'infinity', 'infinite']);
    });
});

describe('Integer or Infinite Validator', () => {
    test('validate a valid integer', () => {
        verifyValid(Validator.IntegerOrInfinite, ['1', '0', '100', '1000000']);
    });

    test('validate the string "infinite"', () => {
        verifyValid(Validator.IntegerOrInfinite, ['infinite']);
    });

    test('invalidate a non-integer number', () => {
        verifyInvalid(Validator.IntegerOrInfinite, ['1.', '1.0', '1.1', '-1', '-1.0', '+1.0', '+1']);
    });

    test('invalidate a non-number input', () => {
        verifyInvalid(Validator.IntegerOrInfinite, ['test', 'not a number', 'infinity']);
    });
});

describe('Item Spec Validator', () => {
    test('comma-separated integers', () => {
        verifyValid(Validator.ItemSpec, ['1', '1,2,3', '1,2,3,4,5,6,7,8,9,10']);
        verifyInvalid(Validator.ItemSpec, ['1,', '1,2,', '1,,2']);
    });

    test('ranges of integers', () => {
        verifyValid(Validator.ItemSpec, ['1:3', '1:10:2', '-10:0', '1:', '10::-2', '1:3,7,-5::2', ':-2:3', '::2', ':']);
        verifyInvalid(Validator.ItemSpec, ['1::', '1:2:', '1:2:3:', '1:2:3:4', '::']);
    });

    test('combine both', () => {
        verifyValid(Validator.ItemSpec, ['1:3,7,-5::2', '1,2,3,4,5:10', '1:3,5:10:2']);
        verifyInvalid(Validator.ItemSpec, ['1:3,7,-5::,', '1,2,3,4,5:10,']);
    });
});

describe('File Size Validator', () => {
    test('validate a valid file size', () => {
        verifyValid(Validator.FileSize, ['1', '1K', '1M', '1G', '1T', '1P', '1.0', '1.0K']);
    });

    test('invalidate an invalid file size', () => {
        verifyInvalid(Validator.FileSize, ['1.', '1.0.', '1.0.0', '1B', '1KB', '1MB', '1GB', '1TB', '1PB', '-1']);
    });
});

describe('Date Validator', () => {
    test('numeric date', () => {
        verifyValid(Validator.Date, ['20210101', '20211231']);
        verifyInvalid(Validator.Date, ['2021', '202101', '2021010a']);
    });

    test('relative date', () => {
        verifyValid(Validator.Date, [
            'now',
            'today',
            'yesterday',
            'now-1day',
            'today-1week',
            'yesterday-1month',
            'now-10year',
            '-1day',
        ]);
        verifyInvalid(Validator.Date, [
            'now-',
            'today-2',
            'yesterday-1days',
            'now-1.0day',
            'today-1weeks',
            'yesterday-1months',
            'now-10years',
        ]);
    });
});
