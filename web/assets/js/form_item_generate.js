import { formItemInfo } from "./form_item_info.js";

function generateFormItem(formItemGroup) {
    const legend = `<legend>${formItemGroup.name}</legend>`;

    const items = formItemGroup.items
        .map((item) => {
            const formItemAttribute = `
                label="${item.label}"
                description="${item.description.replace(/"/g, "&quot;")}"
                type="${item.type}"
                key="${item.key}"
                ${item.required ? "required" : ""}
                ${item.multiple ? "multiple" : ""}
                ${item.accept ? `accept="${item.accept}"` : ""}
                ${item.placeholder ? `placeholder="${item.placeholder}"` : ""}
            `;

            const formItemContent =
                item.type === "select"
                    ? item.options
                          .map((option) => {
                              return `<option value="${option.value}">${option.label}</option>`;
                          })
                          .join("")
                    : "";

            return `<form-item ${formItemAttribute}>${formItemContent}</form-item>`;
        })
        .join("");

    const filedset = document.createElement("fieldset");
    filedset.innerHTML = `${legend}${items}`;
    return filedset;
}

const formItems = document.getElementById("form_item_display");

formItemInfo.forEach((formItemGroup) => {
    const formItem = generateFormItem(formItemGroup);
    formItems.appendChild(formItem);
});
