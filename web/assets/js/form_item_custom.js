class FormItemCustomType {
    constructor({ type, validator, validityMessage }) {
        this.type = type;
        this.validator = validator;
        this.validityMessage = validityMessage;
    }
}

const filesizeType = new FormItemCustomType({
    type: "C-filesize",
    validator: (value) =>
        value === "" || /^[\d]+(.\d)?[\d]*[KMGTP]?$/.test(value),
    validityMessage: "Invalid filesize format.",
});
FormItem.registerCustomType(filesizeType);

const dateType = new FormItemCustomType({
    type: "C-date",
    validator: (value) =>
        value === "" ||
        /^((\d{8})|((now|today|yesterday)?(-\d+(day|week|month|year))?))$/.test(
            value,
        ),
    validityMessage: "Invalid date format.",
});
FormItem.registerCustomType(dateType);
