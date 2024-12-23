import type { FormItemValidator } from '@/types/FormItem.types';

export const Url: FormItemValidator = {
    verify: (value: string) => /^(http|https):\/\/[^ "]+$/.test(value),
    message: 'Invalid URL format.',
};

export const RealNumber: FormItemValidator = {
    verify: (value: string) => /^\d+(\.\d+)?$/.test(value),
    message: 'Invalid number format. Expoected a positive number.',
};

export const Integer: FormItemValidator = {
    verify: (value: string) => /^\d+$/.test(value),
    message: 'Invalid integer format. Expected a positive integer.',
};

export const IntegerOrInfinite: FormItemValidator = {
    verify: (value: string) => value === 'infinite' || /^\d+$/.test(value),
    message: "Invalid input format. Expected a positive integer or 'infinite'.",
};

/**
 * Accepts a string of comma-separated integers, or ranges of integers.
 * Ranges are of the form "[start]:[end][:step]", where negative values are allowed.
 * Examples: "1,2,3", "1:3", "1:10:2", "-10:0", "1:3,7,-5::2".
 */
export const ItemSpec: FormItemValidator = {
    verify: (value) =>
        value.split(',').every((part) => {
            if (part === '') {
                return false;
            }

            const integer = /^-?\d+$/;
            const integerOrEmpty = /^-?\d+|$/;

            const parts = part.split(':');
            if (parts.length > 3 || parts.length === 0) {
                return false;
            }

            const [start, end, step] = part.split(':');
            if (parts.length === 3 && !integer.test(step)) {
                return false;
            }
            return integerOrEmpty.test(start) && integerOrEmpty.test(end);
        }),
    message: 'Invalid item spec format.',
};

export const FileSize: FormItemValidator = {
    verify: (value) => /^[\d]+(.\d)?[\d]*[KMGTP]?$/.test(value),
    message: 'Invalid filesize format.',
};

/**
 * The date can be "YYYYMMDD" or in the format [now|today|yesterday][-N[day|week|month|year]].
 */
export const Date: FormItemValidator = {
    verify: (value) => /^((\d{8})|((now|today|yesterday)?(-\d+(day|week|month|year))?))$/.test(value),
    message: 'Invalid date format.',
};
