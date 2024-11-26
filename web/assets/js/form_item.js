class FormItem extends HTMLElement {
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
            this.inputElement = document.createElement("input");
            this.inputElement.type = type || "text";
        }

        // Custom types are set as text inputs.
        if (type.startsWith("C-")) {
            this.inputElement.type = "text";
        }

        // Initialize the input element.
        this.inputElement.setAttribute("name", this.getAttribute("key"));
        this.addEventListener();

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

    // Filesize input should only accept numbers and units.
    static handleFilesizeInput(event) {
        // Attention: This regex is not perfect.
        // It allows numbers ending with a dot to accept typed dot.
        const filesizeFormat = /^[\d]+(\.[\d]*)?[KMGTP]?$/;
        if (
            event.target.value !== "" &&
            !filesizeFormat.test(event.target.value)
        ) {
            event.target.setCustomValidity("Invalid filesize format.");
            event.target.reportValidity();
        }
    }

    addEventListener() {
        if (this.type === "number") {
            this.inputElement.addEventListener(
                "keypress",
                FormItem.hendleNumberInput,
            );
        } else if (this.type === "radio") {
            this.inputElement.addEventListener(
                "change",
                FormItem.handleRadioChange,
            );
        } else if (this.type === "C-filesize") {
            this.inputElement.addEventListener(
                "input",
                FormItem.handleFilesizeInput,
            );
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
        return this.inputElement.value;
    }

    get checked() {
        return this.inputElement.checked;
    }

    checkValidity() {
        // Check required fields.
        if (this.hasAttribute("required") && this.value === "") {
            this.inputElement.setCustomValidity("This field is required.");
            this.inputElement.reportValidity();
            return false;
        }

        // Check number type.
        // Accepts empty strings, but not bad inputs.
        if (this.type === "number" && this.inputElement.validity.badInput) {
            this.inputElement.setCustomValidity("This field must be a number.");
            this.inputElement.reportValidity();
            return false;
        }

        // Check custrom filesize type.
        if (this.type === "C-filesize") {
            if (
                this.value !== "" &&
                !/^[\d]+(.\d)?[\d]*[KMGTP]?$/.test(this.value)
            ) {
                this.inputElement.setCustomValidity("Invalid filesize format.");
                this.inputElement.reportValidity();
                return false;
            }
        }

        // Check custom date types.
        if (this.type === "C-date") {
            const dateFormat =
                /^((\d{8})|((now|today|yesterday)?(-\d+(day|week|month|year))?))$/;
            if (this.value !== "" && !dateFormat.test(this.value)) {
                this.inputElement.setCustomValidity("Invalid date format.");
                this.inputElement.reportValidity();
                return false;
            }
        }

        return true;
    }
}

customElements.define("form-item", FormItem);
