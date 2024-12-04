import { FormItem, FormItemCustomType } from "./form_item.js";

const customTypes: FormItemCustomType[] = [
    {
        type: "C-filesize",
        validator: (value) => /^[\d]+(.\d)?[\d]*[KMGTP]?$/.test(value),
        validityMessage: "Invalid filesize format.",
    },
    {
        type: "C-date",
        validator: (value) => /^((\d{8})|((now|today|yesterday)?(-\d+(day|week|month|year))?))$/.test(value),
        validityMessage: "Invalid date format.",
    },
    {
        // Accepts a string of comma-separated integers, or ranges of integers.
        // Ranges are of the form "[start]:[end]:[step]", where negative values are allowed.
        // Examples: "1,2,3", "1:3", "1:10:2", "-10:0", "1:3,7,-5::2".
        type: "C-item-spec",
        validator: (value) =>
            /^(?:-?\d+|(?:-?\d*):(?:-?\d*):?(?:-?\d*)?)(?:,(?:-?\d+|(?:-?\d*):(?:-?\d*):?(?:-?\d*)?))*$/.test(value),
        validityMessage: "Invalid item spec format.",
    },
    {
        type: "C-integer-or-infinite",
        validator: (value) => value === "infinite" || /^\d+$/.test(value),
        validityMessage: "Invalid input format. Expected a positive integer or 'infinite'.",
    },
    {
        type: "C-integer",
        validator: (value) => /^\d+$/.test(value),
        validityMessage: "Invalid input format. Expected a positive integer.",
    },
];

export function registerCustomFormItems() {
    for (const customType of customTypes) {
        FormItem.registerCustomType(customType);
    }
}
