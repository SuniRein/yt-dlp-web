export class FormItem extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        // Create the main container.
        const container = document.createElement("div");
        container.classList.add("form-item");

        // Create the label.
        this.labelElement = document.createElement("label");
        this.labelContentElement = document.createElement("span");
        this.labelContentElement.classList.add("form-item-label-content");
        this.labelElement.appendChild(this.labelContentElement);

        // Create the description.
        this.descriptionElement = document.createElement("span");
        this.descriptionElement.classList.add("form-item-description");

        // Input element will be created in the attributeChangedCallback.
        this.inputElement = null;

        // Assemble the elements.
        container.appendChild(this.labelElement);
        container.appendChild(this.descriptionElement);

        this.shadowRoot.appendChild(container);

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
        this.shadowRoot.appendChild(style);
    }

    static get observedAttributes() {
        return [
            "label",
            "description",
            "type",
            "key",
            "value",
            "checked",
            "placeholder",
            "accept",
        ];
    }

    // Supported custom types.
    static customTypes = {};
    static registerCustomType(customType) {
        const { type, ...rest } = customType;
        FormItem.customTypes[type] = rest;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "label":
                this.labelContentElement.textContent = newValue || "";
                break;

            case "description":
                this.descriptionElement.textContent = newValue || "";
                break;

            case "type":
                this.updateInputType(newValue);
                break;

            case "key":
                if (this.inputElement) {
                    this.inputElement.setAttribute("name", newValue);
                }
                break;

            default:
                this.updateInputAttributes(name, newValue);
        }
    }

    updateInputType(type) {
        if (this.inputElement) {
            this.inputElement.remove(); // Remove the old input element.
        }

        // Select inputs should be created with options.
        if (type === "select") {
            this.inputElement = document.createElement("select");
            Array.from(this.children).forEach((child) => {
                if (child.tagName === "OPTION") {
                    this.inputElement.appendChild(child.cloneNode(true));
                }
            });
        } else {
            // Initialize the input element.
            const input = document.createElement("input");

            // Custom types are set as text inputs.
            if (type in FormItem.customTypes) {
                input.type = "text";
            } else {
                input.type = type || "text";
            }

            input.name = this.key;

            this.addEventListener(input);

            // Attribute `multiple` allows multiple inputs.
            if (this.hasAttribute("multiple")) {
                this.inputElement = document.createElement("div");
                this.inputElement.classList.add("form-item-input-multiple");

                this.inputElement.appendChild(input);

                const addButton = document.createElement("button");
                addButton.textContent = "+";
                addButton.type = "button";
                addButton.onclick = () => {
                    const input = this.inputElement
                        .querySelector("input")
                        .cloneNode();
                    input.value = ""; // Clear the value.
                    this.inputElement.appendChild(document.createElement("br")); // Add a line break.
                    this.inputElement.appendChild(input.cloneNode());
                };
                this.inputElement.appendChild(addButton);

                const removeButton = document.createElement("button");
                removeButton.textContent = "-";
                removeButton.type = "button";
                removeButton.onclick = () => {
                    const inputs = this.inputElement.querySelectorAll("input");
                    // Ensure there is always at least one input.
                    if (inputs.length > 1) {
                        this.inputElement.removeChild(
                            this.inputElement.lastChild,
                        ); // Remove the last input.
                        this.inputElement.removeChild(
                            this.inputElement.lastChild,
                        ); // Remove the line break.
                    }
                };
                this.inputElement.appendChild(removeButton);
            } else {
                this.inputElement = input;
            }
        }

        // Place the input element in correct position.
        if (type === "radio" || type === "checkbox") {
            // Checkbox and radio inputs should be placed before the label content.
            this.labelElement.insertBefore(
                this.inputElement,
                this.labelContentElement,
            );
        } else {
            // Other inputs should be placed after the label content.
            this.labelElement.appendChild(this.inputElement);
        }
    }

    updateInputAttributes(name, value) {
        if (this.inputElement) {
            if (value === null) {
                this.inputElement.removeAttribute(name);
            } else {
                this.inputElement.setAttribute(name, value);
            }
        }
    }

    // Number input should only accept numbers and dots.
    static hendleNumberInput(event) {
        const char = event.key;
        if (!/[\d.]/.test(char)) {
            event.preventDefault();
        }
    }

    // Radio inputs with same name can only have one checked.
    static handleRadioChange(event) {
        if (event.target.checked) {
            const radios = document.querySelectorAll(
                `form-item[type="radio"][key="${event.target.name}"]`,
            );
            radios.forEach((radio) => {
                radio.inputElement.checked = false;
            });
            event.target.checked = true;
        }
    }

    addEventListener(input) {
        if (this.type === "number") {
            input.addEventListener("keypress", FormItem.hendleNumberInput);
        } else if (this.type === "radio") {
            input.addEventListener("change", FormItem.handleRadioChange);
        }
    }

    get label() {
        return this.labelContentElement.textContent;
    }

    get description() {
        return this.descriptionElement.textContent;
    }

    get type() {
        return this.getAttribute("type");
    }

    get key() {
        return this.getAttribute("key");
    }

    get value() {
        if (this.hasAttribute("multiple")) {
            const inputs = this.inputElement.querySelectorAll("input");
            const values = Array.from(inputs)
                .filter((input) => !FormItem.inputIsEmpty(input))
                .map((input) => input.value);
            return values;
        }
        return this.inputElement.value;
    }

    get checked() {
        return this.inputElement.checked;
    }

    #inputIsValidity(input) {
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
        if (this.type in FormItem.customTypes) {
            const customType = FormItem.customTypes[this.type];
            if (!customType.validator(input.value)) {
                input.setCustomValidity(customType.validityMessage);
                input.reportValidity();
                return false;
            }
        }

        return true;
    }

    checkValidity() {
        if (this.hasAttribute("multiple")) {
            const inputs = this.inputElement.querySelectorAll("input");
            for (const input of inputs) {
                if (!this.#inputIsValidity(input)) {
                    return false;
                }
            }
            return true;
        }

        return this.#inputIsValidity(this.inputElement);
    }

    static inputIsEmpty(input) {
        if (input.type === "checkbox") {
            return !input.checked;
        }
        if (input.type === "radio") {
            return (
                !input.checked || input.value === "none" || input.value === ""
            );
        }
        return input.value === "none" || input.value === "";
    }

    empty() {
        if (this.hasAttribute("multiple")) {
            return this.value.length === 0;
        }
        return FormItem.inputIsEmpty(this.inputElement);
    }
}

customElements.define("form-item", FormItem);
