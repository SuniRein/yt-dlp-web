declare let webui: any;

import { registerFormItem, FormItem } from "./assets/js/form_item.js";
import { registerCustomFormItems } from "./assets/js/form_item_custom.js";
import { generateFormItems } from "./assets/js/form_item_generate.js";

registerFormItem();
registerCustomFormItems();
generateFormItems();

declare global {
    interface Window {
        handleFormSubmit: typeof handleFormSubmit;
        logMessage: typeof logMessage;
        clearLog: typeof clearLog;
        clearPreview: typeof clearPreview;
        showDownloadProgress: typeof showDownloadProgress;
        showDownlaodInfo: typeof showDownloadInfo;
    }
}

function handleFormSubmit(event: SubmitEvent) {
    event.preventDefault();

    const actionType = (event.submitter as HTMLButtonElement).value;

    const formItems = (event.target as HTMLFormElement).querySelectorAll("form-item") as NodeListOf<FormItem>;

    // Convert form data to JSON.
    const data: {
        [key: string]: string | string[];
    } = { action: actionType };
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
            data[element.key] = element.value!;
        }
    }

    // Logging
    logMessage("Request: " + JSON.stringify(data, null, 2));

    // Backend call
    webui.call("submit_url", JSON.stringify(data)).then((response: string) => {
        if (actionType === "preview") {
            previewMediaInfo(JSON.parse(response));
        }
    });
}
window.handleFormSubmit = handleFormSubmit;

function logMessage(message: string) {
    const log_output = document.getElementById("log_output") as HTMLTextAreaElement;
    log_output.value += message + "\n";
    log_output.scrollTop = log_output.scrollHeight; // Auto scroll to bottom
}
window.logMessage = logMessage;

function clearLog() {
    const log_output = document.getElementById("log_output") as HTMLTextAreaElement;
    log_output.value = "";
}
window.clearLog = clearLog;

interface UrlDataInfo {
    title: string;
    description: string;
    thumbnail: string;
    formats: UrlFormatInfo[];
    requested_formats: { format_id: string }[];
    filename: string;
}

function previewMediaInfo(data: UrlDataInfo) {
    const preview_area = document.getElementById("preview_area") as HTMLDivElement;

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

interface UrlFormatInfo {
    format_id: string;
    ext: string;
    resolution: string;
    fps: string;
    filesize_approx: number;
    protocol: string;
    vcodec: string;
    acodec: string;
    tbr: number;
    vbr: number;
    abr: number;
}

function analyzeFormats(formats: UrlFormatInfo[], requested_formats: { format_id: string }[]) {
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

function bytesToSize(bytes: number) {
    if (!bytes) bytes = 0;

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes > 1024 && i < sizes.length) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
}

function hideIfEmpty(value: string | number) {
    return value == 0 || value == "none" ? "" : value;
}

function clearPreview() {
    const preview_area = document.getElementById("preview_area") as HTMLDivElement;
    preview_area.innerHTML = "";
}
window.clearPreview = clearPreview;

function showDownloadProgress(rawData: Uint8Array) {
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
window.showDownloadProgress = showDownloadProgress;

function showDownloadInfo(rawData: Uint8Array) {
    const data = new TextDecoder().decode(rawData);
    logMessage(data);
}
window.showDownlaodInfo = showDownloadInfo;
