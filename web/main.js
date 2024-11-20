function handleFormSubmit(event, actionType) {
    event.preventDefault();

    const form = document.getElementById("yt-dlp_form");

    // convert form data to JSON
    const data = { action: actionType };
    Array.from(form.elements).forEach((element) => {
        // skip elements without a name
        if (!element.name) {
            return;
        }

        if (element.type === "checkbox" || element.type === "radio") {
            // checkbox and radio are processed as boolean
            data[element.name] = element.checked;
        } else {
            data[element.name] = element.value;
        }
    });

    // Logging
    logMessage("Request: " + JSON.stringify(data, null, 2));

    // Backend call
    webui.call("submit_url", JSON.stringify(data)).then((response) => {
        previewMediaInfo(JSON.parse(response));
    });
}

function logMessage(message) {
    const log_output = document.getElementById("log_output");
    log_output.value += message + "\n";
}

function clearLog() {
    const log_output = document.getElementById("log_output");
    log_output.value = "";
}

function previewMediaInfo(data) {
    const preview_area = document.getElementById("preview_area");

    // Clear old preview
    preview_area.innerHTML = "";

    // Show title
    const title = document.createElement("h4");
    title.textContent = data.title;
    preview_area.appendChild(title);

    // Show description
    const description = document.createElement("p");
    description.textContent = data.description;
    preview_area.appendChild(description);

    // Show thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.src = data.thumbnail;
    thumbnail.referrerpolicy = "no-referrer"; // Some sites block requests with referrer
    preview_area.appendChild(thumbnail);
}

function clearPreview() {
    const preview_area = document.getElementById("preview_area");
    preview_area.innerHTML = "";
}
