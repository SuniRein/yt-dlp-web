/// @ts-nocheck

import { FormItem } from "./form_item.js";

class FormItemCustomType {
    constructor({ type, validator, validityMessage }) {
        this.type = type;
        this.validator = validator;
        this.validityMessage = validityMessage;
    }
}

const filesizeType = new FormItemCustomType({
    type: "C-filesize",
    validator: (value) => /^[\d]+(.\d)?[\d]*[KMGTP]?$/.test(value),
    validityMessage: "Invalid filesize format.",
});
FormItem.registerCustomType(filesizeType);

const dateType = new FormItemCustomType({
    type: "C-date",
    validator: (value) =>
        /^((\d{8})|((now|today|yesterday)?(-\d+(day|week|month|year))?))$/.test(
            value,
        ),
    validityMessage: "Invalid date format.",
});
FormItem.registerCustomType(dateType);

// Accepts a string of comma-separated integers, or ranges of integers.
// Ranges are of the form "[start]:[end]:[step]", where negative values are allowed.
// Examples: "1,2,3", "1:3", "1:10:2", "-10:0", "1:3,7,-5::2".
const itemSpecType = new FormItemCustomType({
    type: "C-item-spec",
    validator: (value) =>
        /^(?:-?\d+|(?:-?\d*):(?:-?\d*):?(?:-?\d*)?)(?:,(?:-?\d+|(?:-?\d*):(?:-?\d*):?(?:-?\d*)?))*$/.test(
            value,
        ),
    validityMessage: "Invalid item spec format.",
});
FormItem.registerCustomType(itemSpecType);

const intergerOrInfinityType = new FormItemCustomType({
    type: "C-interger-or-infinite",
    validator: (value) => value === "infinite" || /^\d+$/.test(value),
    validityMessage:
        "Invalid input format. Expected a positive integer or 'infinite'.",
});
FormItem.registerCustomType(intergerOrInfinityType);
