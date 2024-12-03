/// @ts-nocheck

import { registerFormItem } from "./assets/js/form_item.js";
import { registerCustomFormItems } from "./assets/js/form_item_custom.js";

registerFormItem();
registerCustomFormItems();

function handleFormSubmit(event) {
    event.preventDefault();

    const actionType = event.submitter.value;

    const formItems = event.target.querySelectorAll("form-item");

    // Convert form data to JSON.
    const data = { action: actionType };
    for (const element of formItems) {
        // Skip elements without a key.
        if (!element.key) {
            continue;
        }

        // If input is invalid, show error message and stop.
        if (!element.checkValidity()) {
            return;
        }

        // Here only send meaningful values.
        // Empty values are not sent to backend.
        if (!element.empty()) {
            data[element.key] = element.value;
        }
    }

    // Logging
    logMessage("Request: " + JSON.stringify(data, null, 2));

    // Backend call
    webui.call("submit_url", JSON.stringify(data)).then((response) => {
        if (actionType === "preview") {
            previewMediaInfo(JSON.parse(response));
        }
    });
}
window.handleFormSubmit = handleFormSubmit;

function logMessage(message) {
    const log_output = document.getElementById("log_output");
    log_output.value += message + "\n";
    log_output.scrollTop = log_output.scrollHeight; // Auto scroll to bottom
}
window.logMessage = logMessage;

function clearLog() {
    const log_output = document.getElementById("log_output");
    log_output.value = "";
}
window.clearLog = clearLog;

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
    thumbnail.referrerPolicy = "no-referrer"; // Some sites block requests with referrer
    preview_area.appendChild(thumbnail);

    // Show formats
    const formats = analyzeFormats(data.formats, data.requested_formats);
    preview_area.appendChild(formats);

    // Show destination
    const destination = document.createElement("p");
    destination.innerHTML = `<b>Destination</b>: ${data.filename}`;
    preview_area.appendChild(destination);
}

function analyzeFormats(formats, requested_formats) {
    // Create format table
    const formats_table = document.createElement("table");
    formats_table.classList.add("formats");

    // Create table header
    const thead = document.createElement("thead");

    const header_row = document.createElement("tr");
    const headers = [
        "ID",
        "Extension",
        "Resolution",
        "FPS",
        "Size",
        "TBR",
        "Protocol",
        "VCodec",
        "VBR",
        "ACodec",
        "ABR",
        "Chosen",
    ];
    header_row.innerHTML = headers.map((header) => `<th>${header}</th>`).join("");

    thead.appendChild(header_row);
    formats_table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

    const requested_format_ids = requested_formats.map((format) => format.format_id);

    formats.forEach((format) => {
        const row = document.createElement("tr");

        const data = [
            format.format_id,
            format.ext,
            format.resolution,
            format.fps,
            bytesToSize(format.filesize_approx),
            format.tbr,
            format.protocol,
            hideIfEmpty(format.vcodec),
            hideIfEmpty(format.vbr),
            hideIfEmpty(format.acodec),
            hideIfEmpty(format.abr),
            requested_format_ids.includes(format.format_id) ? "Yes" : "",
        ];
        row.innerHTML = data.map((value) => `<td>${value || ""}</td>`).join("");

        tbody.appendChild(row);
    });

    formats_table.appendChild(tbody);

    return formats_table;
}

function bytesToSize(bytes) {
    if (!bytes) bytes = 0;

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes > 1024 && i < sizes.length) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
}

function hideIfEmpty(value) {
    return value == 0 || value == "none" ? "" : value;
}

function clearPreview() {
    const preview_area = document.getElementById("preview_area");
    preview_area.innerHTML = "";
}

function showDownloadProgress(rawData) {
    const data = new TextDecoder().decode(rawData);
    const json = JSON.parse(data);

    const filename = json.filename;
    const downloaded_bytes = bytesToSize(json.downloaded_bytes);
    const total_bytes = bytesToSize(json.total_bytes);
    const speed = bytesToSize(json.speed);
    const progress = (json.downloaded_bytes / json.total_bytes) * 100;
    logMessage(
        `Downloading ${filename}: ${downloaded_bytes} / ${total_bytes} (${progress.toFixed(2)}%) Speed: ${speed}/s`,
    );
}

function showDownloadInfo(rawData) {
    const data = new TextDecoder().decode(rawData);
    logMessage(data);
}
