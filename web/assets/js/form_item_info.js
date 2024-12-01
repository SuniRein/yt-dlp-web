const globalInput = {
    name: "Global",
    items: [
        {
            label: "URL",
            description: "",
            type: "url",
            key: "url_input",
            placeholder: "https://www.bilibili.com/video/BV1hK4y1C7Uw",
            required: true,
        },
        {
            label: "Audio Only",
            description: "",
            type: "checkbox",
            key: "audio_only",
        },
        {
            label: "yt-dlp Path",
            description: "Path to the yt-dlp executable.",
            type: "text",
            key: "yt_dlp_path",
            placeholder: "/path/to/yt-dlp",
        },
        {
            label: "Video Quality",
            description: "",
            type: "select",
            key: "quality",
            options: [
                {
                    value: "bestvideo+bestaudio",
                    label: "Best Video and Audio",
                },
            ],
        },
        {
            label: "Output Path",
            description: "Set the output path for the downloaded file.",
            type: "text",
            key: "output_path",
            placeholder: "/path/to/output",
        },
    ],
};

const cookiesOptions = {
    name: "Cookies Option",
    items: [
        {
            label: "From Browser",
            description: "The name of the browser to load cookies from.",
            type: "select",
            key: "cookies_from_browser",
            options: [
                { value: "none", label: "None" },
                { value: "brave", label: "Brave" },
                { value: "firefox", label: "Firefox" },
                { value: "chrome", label: "Chrome" },
                { value: "chromium", label: "Chromium" },
                { value: "edge", label: "Edge" },
                { value: "opera", label: "Opera" },
                { value: "safari", label: "Safari" },
                { value: "vivaldi", label: "Vivaldi" },
                { value: "whale", label: "Whale" },
            ],
        },
        {
            label: "From File",
            description:
                "Netscape formatted file to read cookies from and dump cookie jar in.",
            type: "text",
            key: "cookies_from_file",
            accept: "text/plain",
        },
    ],
};

const networdOptions = {
    name: "Network Option",
    items: [
        {
            label: "Proxy",
            description: `
                Use the specified HTTP/HTTPS/SOCKS proxy.
                To enable SOCKS proxy, specify a proper scheme, e.g. socks5://user:pass@127.0.0.1:1080/.
                Keep empty for direct connection.
            `,
            type: "text",
            key: "proxy",
            placeholder: "http://localhost:8080",
        },
        {
            label: "Socket Timeout",
            description: "Time to wait before giving up, in seconds.",
            type: "number",
            key: "socket_timeout",
        },
        {
            label: "Source Address",
            description: "Client-side IP address to bind to.",
            type: "text",
            key: "source_address",
        },
        {
            label: "IP Protocol",
            description: "Select the IP protocol to use.",
            type: "select",
            key: "force_ip_protocol",
            options: [
                { label: "Default", value: "none" },
                { label: "Force IPv4", value: "ipv4" },
                { label: "Force IPv6", value: "ipv6" },
            ],
        },
        {
            label: "Enable File Urls",
            description:
                "Enable file:// URLs. This is disabled by default for security reasons.",
            type: "checkbox",
            key: "enable_file_urls",
        },
    ],
};

const videoSelectionOptions = {
    name: "Video Selection Option",
    items: [
        {
            label: "Playlist Index Filter",
            description: `
                Comma separated playlist_index of the items to download.
                You can specify a range using "[START]:[STOP][:STEP]".
                Use negative indices to count from the right and negative STEP to download in reverse order.
                E.g. "-I 1:3,7,-5::2" used on a playlist of size 15 will download the items at index 1,2,3,7,11,13,15".
            `,
            type: "C-item-spec",
            key: "playlist_indices",
        },
        {
            label: "Min Filesize",
            description:
                "Only download file with a size greater than this value. Format: 100, 10K, 1.2M",
            type: "C-filesize",
            key: "filesize_min",
        },
        {
            label: "Max Filesize",
            description:
                "Only download file with a size less than this value. Format: 100, 10K, 1.2M",
            type: "C-filesize",
            key: "filesize_max",
        },
        {
            label: "Date",
            description: `
                Download only videos uploaded on this date.
                The date can be "YYYYMMDD" or in the format [now|today|yesterday][-N[day|week|month|year]].
            `,
            type: "C-date",
            key: "date",
        },
        {
            label: "Date Before",
            description: "Download only videos uploaded on or before this date",
            type: "C-date",
            key: "date_before",
        },
        {
            label: "Date After",
            description: "Download only videos uploaded on or after this date",
            type: "C-date",
            key: "date_after",
        },
        {
            label: "Filters",
            description: `
                Generic video filter. Any "OUTPUT TEMPLATE" field can be compared with a number or a string
                using the operators defined in "Filtering Formats".
            `,
            type: "text",
            key: "filters",
            multiple: true,
        },
        {
            label: "Stop Filters",
            description:
                "Stop the download process when a video doesn't match the filters.",
            type: "text",
            key: "stop_filters",
            multiple: true,
        },
        {
            label: "Is Playerlist",
            description: "Treat the URL as a playlist or not.",
            type: "select",
            key: "is_playlist",
            options: [
                { value: "none", label: "Auto" },
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
            ],
        },
        {
            label: "Age Limit",
            description: "Download only videos suitable for the given age.",
            type: "number",
            key: "age_limit",
        },
        {
            label: "Max Download Number",
            description: "Abort after downloading NUMBER files.",
            type: "number",
            key: "max_download_number",
        },
        {
            label: "Download Archive",
            description:
                "Download only videos not listed in the archive file. Record the IDs of all downloaded videos in it.",
            type: "text",
            key: "download_archive",
        },
        {
            label: "Break On Existing",
            description: `
                Stop the download process when encountering an already downloaded file
                that is in the archive supplied by the "Download Archive" option.
            `,
            type: "checkbox",
            key: "break_on_existing",
        },
        {
            label: "Break Per Input",
            description: `
                Reset per input for options "Stop Filters", "Max Download Number" and "Break On Existing"
                or else they will terminate the whole download process.
            `,
            type: "checkbox",
            key: "break_per_input",
        },
        {
            label: "Skip Playlist After Errors",
            description:
                "Number of allowed failures until the rest of the playlist is skipped.",
            type: "number",
            key: "skip_playlist_after_errors",
        },
    ],
};

export const formItemInfo = [
    globalInput,
    cookiesOptions,
    networdOptions,
    videoSelectionOptions,
];
