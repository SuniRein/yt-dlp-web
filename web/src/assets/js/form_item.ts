export interface FormItemCustomType {
    type: string;
    validator: (value: string) => boolean;
    validityMessage: string;
}

export class FormItem extends HTMLElement {
    #labelElement: HTMLLabelElement;
    #labelContentElement: HTMLSpanElement;
    #descriptionElement: HTMLSpanElement;
    #inputElement: HTMLInputElement | HTMLSelectElement | HTMLDivElement | null;

    constructor() {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });

        // Create the main container.
        const container = document.createElement("div");
        container.classList.add("form-item");

        // Create the label.
        this.#labelElement = document.createElement("label");
        this.#labelContentElement = document.createElement("span");
        this.#labelContentElement.classList.add("form-item-label-content");
        this.#labelElement.appendChild(this.#labelContentElement);

        // Create the description.
        this.#descriptionElement = document.createElement("span");
        this.#descriptionElement.classList.add("form-item-description");

        // Input element will be created in the attributeChangedCallback.
        this.#inputElement = null;

        // Assemble the elements.
        container.appendChild(this.#labelElement);
        container.appendChild(this.#descriptionElement);

        shadowRoot.appendChild(container);

        // Apply styles.
        const style = document.createElement("style");
        style.textContent = `
            .form-item {
                margin-bottom: 10px;
            }

            .form-item-description {
                font-size: 0.875em;
                font-style: italic;
                color: #555;
                margin-top: 5px;
                margin-bottom: 10px;
                line-height: 1.5;
                display: block;
            }

            .form-item-label-content {
                font-weight: bold;
            }

            .form-item-label-content:not(:last-child) {
                display: block;
                margin-bottom: 5px;
            }
        `;
        shadowRoot.appendChild(style);
    }

    static get observedAttributes() {
        return ["label", "description", "type", "key", "value", "checked", "placeholder", "accept"];
    }

    // Supported custom types.
    static #customTypes: {
        [key: string]: Omit<FormItemCustomType, "type">;
    } = {};

    static registerCustomType(customType: FormItemCustomType) {
        const { type, ...rest } = customType;
        FormItem.#customTypes[type] = rest;
    }

    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
        switch (name) {
            case "label":
                this.#labelContentElement.textContent = newValue;
                break;

            case "description":
                this.#descriptionElement.textContent = newValue;
                break;

            case "type":
                this.#updateInputType(newValue ?? "text");
                break;

            case "key":
                if (this.#inputElement) {
                    this.#inputElement.setAttribute("name", newValue ?? "");
                }
                break;

            default:
                this.#updateInputAttributes(name, newValue);
        }
    }

    #updateInputType(type: string) {
        this.#inputElement?.remove();

        // Select inputs should be created with options.
        if (type === "select") {
            this.#inputElement = document.createElement("select");
            Array.from(this.children).forEach((child) => {
                if (child.tagName === "OPTION") {
                    this.#inputElement!.appendChild(child.cloneNode(true));
                }
            });
        } else {
            // Initialize the input element.
            const input = document.createElement("input");

            // Custom types are set as text inputs.
            if (type in FormItem.#customTypes) {
                input.type = "text";
            } else {
                input.type = type;
            }

            input.name = this.key ?? "";

            this.#addEventListener(input);

            // Attribute `multiple` allows multiple inputs.
            if (this.hasAttribute("multiple")) {
                this.#inputElement = document.createElement("div");
                this.#inputElement.classList.add("form-item-input-multiple");

                this.#inputElement.appendChild(input);

                const addButton = document.createElement("button");
                addButton.textContent = "+";
                addButton.type = "button";
                addButton.onclick = () => {
                    if (this.#inputElement) {
                        const input = this.#inputElement.querySelector("input")?.cloneNode() as HTMLInputElement;

                        input.value = ""; // Clear the value.
                        this.#inputElement.appendChild(document.createElement("br")); // Add a line break.
                        this.#inputElement.appendChild(input.cloneNode());
                    }
                };
                this.#inputElement.appendChild(addButton);

                const removeButton = document.createElement("button");
                removeButton.textContent = "-";
                removeButton.type = "button";
                removeButton.onclick = () => {
                    if (this.#inputElement) {
                        const inputs = this.#inputElement.querySelectorAll("input");

                        // Ensure there is always at least one input.
                        if (inputs.length > 1) {
                            this.#inputElement.removeChild(this.#inputElement!.lastChild!); // Remove the last input.
                            this.#inputElement.removeChild(this.#inputElement!.lastChild!); // Remove the line break.
                        }
                    }
                };
                this.#inputElement.appendChild(removeButton);
            } else {
                this.#inputElement = input;
            }
        }

        // Place the input element in correct position.
        if (type === "radio" || type === "checkbox") {
            // Checkbox and radio inputs should be placed before the label content.
            this.#labelElement.insertBefore(this.#inputElement, this.#labelContentElement);
        } else {
            // Other inputs should be placed after the label content.
            this.#labelElement.appendChild(this.#inputElement);
        }
    }

    #updateInputAttributes(name: string, value: string | null) {
        if (this.#inputElement) {
            if (value === null) {
                this.#inputElement.removeAttribute(name);
            } else {
                this.#inputElement.setAttribute(name, value);
            }
        }
    }

    // Number input should only accept numbers and dots.
    static #hendleNumberInput(event: KeyboardEvent) {
        const char = event.key;
        if (!/[\d.]/.test(char)) {
            event.preventDefault();
        }
    }

    // Radio inputs with same name can only have one checked.
    static #handleRadioChange(event: Event) {
        const radio = event.target as HTMLInputElement;

        if (radio.checked) {
            const radioFormItems = document.querySelectorAll(
                `form-item[type="radio"][key="${radio.name}"]`,
            ) as NodeListOf<FormItem>;

            radioFormItems.forEach((radioFormItem) => {
                (radioFormItem.#inputElement as HTMLInputElement).checked = false;
            });

            radio.checked = true;
        }
    }

    #addEventListener(input: HTMLInputElement) {
        if (this.type === "number") {
            input.addEventListener("keypress", FormItem.#hendleNumberInput);
        } else if (this.type === "radio") {
            input.addEventListener("change", FormItem.#handleRadioChange);
        }
    }

    get label() {
        return this.#labelContentElement.textContent;
    }

    get description() {
        return this.#descriptionElement.textContent;
    }

    get type() {
        return this.getAttribute("type")!;
    }

    get key() {
        return this.getAttribute("key");
    }

    get value() {
        if (this.#inputElement !== null) {
            if (this.#inputElement instanceof HTMLDivElement) {
                const inputs = this.#inputElement.querySelectorAll("input");
                const values = Array.from(inputs)
                    .filter((input) => !FormItem.#inputIsEmpty(input))
                    .map((input) => input.value);
                return values;
            }
            return this.#inputElement.value;
        }
        return null;
    }

    get checked() {
        if (this.#inputElement instanceof HTMLInputElement) {
            return this.#inputElement.checked;
        }
        return null;
    }

    #inputIsValidity(input: HTMLInputElement) {
        // Check required fields.
        if (this.hasAttribute("required") && input.value === "") {
            input.setCustomValidity("This field is required.");
            input.reportValidity();
            return false;
        }

        // Check number type.
        // Accepts empty strings, but not bad inputs.
        if (this.type === "number" && input.validity.badInput) {
            input.setCustomValidity("This field must be a number.");
            input.reportValidity();
            return false;
        }

        // Check custom types.
        if (this.type in FormItem.#customTypes) {
            const customType = FormItem.#customTypes[this.type];
            if (input.value !== "" && !customType.validator(input.value)) {
                input.setCustomValidity(customType.validityMessage);
                input.reportValidity();
                return false;
            }
        }

        return true;
    }

    checkValidity() {
        if (this.#inputElement instanceof HTMLDivElement) {
            const inputs = this.#inputElement.querySelectorAll("input");
            for (const input of inputs) {
                if (!this.#inputIsValidity(input)) {
                    return false;
                }
            }
            return true;
        }

        if (this.#inputElement instanceof HTMLInputElement) {
            return this.#inputIsValidity(this.#inputElement);
        }

        return true;
    }

    static #inputIsEmpty(input: HTMLSelectElement | HTMLInputElement | null) {
        if (input === null) {
            return true;
        }

        if (input.type === "checkbox") {
            return !input.checked;
        }
        if (input.type === "radio") {
            return !input.checked || input.value === "none" || input.value === "";
        }
        return input.value === "none" || input.value === "";
    }

    empty() {
        if (this.#inputElement instanceof HTMLDivElement) {
            return this.value!.length === 0;
        }
        return FormItem.#inputIsEmpty(this.#inputElement);
    }
}

export function registerFormItem() {
    customElements.define("form-item", FormItem);
}
