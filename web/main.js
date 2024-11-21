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
    thumbnail.referrerPolicy = "no-referrer"; // Some sites block requests with referrer
    preview_area.appendChild(thumbnail);

    // Show formats
    const formats = analyzeFormats(data.formats);
    preview_area.appendChild(formats);
}

function analyzeFormats(formats) {
    // Create format table
    const formats_table = document.createElement("table");
    formats_table.classList.add("formats");

    // Create table header
    const thead = document.createElement("thead");

    const header_row = document.createElement("tr");
    const headers = [
        "Format",
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
    ];
    header_row.innerHTML = headers
        .map((header) => `<th>${header}</th>`)
        .join("");

    thead.appendChild(header_row);
    formats_table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");

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
        ];
        row.innerHTML = data.map((value) => `<td>${value || ""}</td>`).join("");

        tbody.appendChild(row);
    });

    formats_table.appendChild(tbody);

    return formats_table;
}

function bytesToSize(bytes) {
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