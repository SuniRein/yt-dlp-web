import { formItemInfo, FormItemInfoGroup } from "./form_item_info.js";

function generateFormItemGroup(formItemInfoGroup: FormItemInfoGroup): HTMLElement {
    const legend = `<legend>${formItemInfoGroup.name}</legend>`;

    const items = formItemInfoGroup.items
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
                          ?.map((option) => {
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

export function generateFormItems() {
    const formItems = document.getElementById("form_item_display");
    if (formItems === null) {
        throw new Error("form_item_display element not found.");
    }

    formItemInfo.forEach((formItemGroup) => {
        const formItem = generateFormItemGroup(formItemGroup);
        formItems.appendChild(formItem);
    });
}
