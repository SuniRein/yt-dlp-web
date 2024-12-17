import { type FormInfoSet } from '@/components/FormArea.vue';

const globalInput: FormInfoSet = {
    name: 'Global',
    items: [
        {
            label: 'URL',
            description: '',
            type: 'url',
            name: 'url_input',
            placeholder: 'https://www.bilibili.com/video/BV1hK4y1C7Uw',
            required: true,
        },
        {
            label: 'Audio Only',
            description: '',
            type: 'checkbox',
            name: 'audio_only',
        },
        {
            label: 'yt-dlp Path',
            description: 'Path to the yt-dlp executable.',
            type: 'text',
            name: 'yt_dlp_path',
            placeholder: '/path/to/yt-dlp',
        },
        {
            label: 'Video Quality',
            description: '',
            type: 'select',
            name: 'quality',
            options: [
                {
                    value: 'bestvideo+bestaudio',
                    label: 'Best Video and Audio',
                },
            ],
        },
    ],
};

const cookiesOptions: FormInfoSet = {
    name: 'Cookies Option',
    items: [
        {
            label: 'From Browser',
            description: 'The name of the browser to load cookies from.',
            type: 'select',
            name: 'cookies_from_browser',
            options: [
                { value: '', label: 'None' },
                { value: 'brave', label: 'Brave' },
                { value: 'firefox', label: 'Firefox' },
                { value: 'chrome', label: 'Chrome' },
                { value: 'chromium', label: 'Chromium' },
                { value: 'edge', label: 'Edge' },
                { value: 'opera', label: 'Opera' },
                { value: 'safari', label: 'Safari' },
                { value: 'vivaldi', label: 'Vivaldi' },
                { value: 'whale', label: 'Whale' },
            ],
        },
        {
            label: 'From File',
            description: 'Netscape formatted file to read cookies from and dump cookie jar in.',
            type: 'text',
            name: 'cookies_from_file',
        },
    ],
};

const networdOptions: FormInfoSet = {
    name: 'Network Option',
    items: [
        {
            label: 'Proxy',
            description: `
                Use the specified HTTP/HTTPS/SOCKS proxy.
                To enable SOCKS proxy, specify a proper scheme, e.g. socks5://user:pass@127.0.0.1:1080/.
                Keep empty for direct connection.
            `,
            type: 'text',
            name: 'proxy',
            placeholder: 'http://localhost:8080',
        },
        {
            label: 'Socket Timeout',
            description: 'Time to wait before giving up, in seconds.',
            type: 'number',
            name: 'socket_timeout',
        },
        {
            label: 'Source Address',
            description: 'Client-side IP address to bind to.',
            type: 'text',
            name: 'source_address',
        },
        {
            label: 'IP Protocol',
            description: 'Select the IP protocol to use.',
            type: 'select',
            name: 'force_ip_protocol',
            options: [
                { label: 'Default', value: '' },
                { label: 'Force IPv4', value: 'ipv4' },
                { label: 'Force IPv6', value: 'ipv6' },
            ],
        },
        {
            label: 'Enable File Urls',
            description: 'Enable file:// URLs. This is disabled by default for security reasons.',
            type: 'checkbox',
            name: 'enable_file_urls',
        },
    ],
};

const videoSelectionOptions: FormInfoSet = {
    name: 'Video Selection Option',
    items: [
        {
            label: 'Playlist Index Filter',
            description: `
                Comma separated playlist_index of the items to download.
                You can specify a range using "[START]:[STOP][:STEP]".
                Use negative indices to count from the right and negative STEP to download in reverse order.
                E.g. "-I 1:3,7,-5::2" used on a playlist of size 15 will download the items at index 1,2,3,7,11,13,15".
            `,
            type: 'C-item-spec',
            name: 'playlist_indices',
        },
        {
            label: 'Min Filesize',
            description: 'Only download file with a size greater than this value. Format: 100, 10K, 1.2M',
            type: 'C-filesize',
            name: 'filesize_min',
        },
        {
            label: 'Max Filesize',
            description: 'Only download file with a size less than this value. Format: 100, 10K, 1.2M',
            type: 'C-filesize',
            name: 'filesize_max',
        },
        {
            label: 'Date',
            description: `
                Download only videos uploaded on this date.
                The date can be "YYYYMMDD" or in the format [now|today|yesterday][-N[day|week|month|year]].
            `,
            type: 'C-date',
            name: 'date',
        },
        {
            label: 'Date Before',
            description: 'Download only videos uploaded on or before this date',
            type: 'C-date',
            name: 'date_before',
        },
        {
            label: 'Date After',
            description: 'Download only videos uploaded on or after this date',
            type: 'C-date',
            name: 'date_after',
        },
        {
            label: 'Filters',
            description: `
                Generic video filter. Any "OUTPUT TEMPLATE" field can be compared with a number or a string
                using the operators defined in "Filtering Formats".
            `,
            type: 'text',
            name: 'filters',
            multiple: true,
        },
        {
            label: 'Stop Filters',
            description: "Stop the download process when a video doesn't match the filters.",
            type: 'text',
            name: 'stop_filters',
            multiple: true,
        },
        {
            label: 'Is Playerlist',
            description: 'Treat the URL as a playlist or not.',
            type: 'select',
            name: 'is_playlist',
            options: [
                { value: '', label: 'Auto' },
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
            ],
        },
        {
            label: 'Age Limit',
            description: 'Download only videos suitable for the given age.',
            type: 'number',
            name: 'age_limit',
        },
        {
            label: 'Max Download Number',
            description: 'Abort after downloading NUMBER files.',
            type: 'number',
            name: 'max_download_number',
        },
        {
            label: 'Download Archive',
            description:
                'Download only videos not listed in the archive file. Record the IDs of all downloaded videos in it.',
            type: 'text',
            name: 'download_archive',
        },
        {
            label: 'Break On Existing',
            description: `
                Stop the download process when encountering an already downloaded file
                that is in the archive supplied by the "Download Archive" option.
            `,
            type: 'checkbox',
            name: 'break_on_existing',
        },
        {
            label: 'Break Per Input',
            description: `
                Reset per input for options "Stop Filters", "Max Download Number" and "Break On Existing"
                or else they will terminate the whole download process.
            `,
            type: 'checkbox',
            name: 'break_per_input',
        },
        {
            label: 'Skip Playlist After Errors',
            description: 'Number of allowed failures until the rest of the playlist is skipped.',
            type: 'number',
            name: 'skip_playlist_after_errors',
        },
    ],
};

const downloadOptions: FormInfoSet = {
    name: 'Download Option',
    items: [
        {
            label: 'Concurrent Fragments',
            description:
                'Number of fragments of a dash/hlsnative video that should be downloaded concurrently (default is 1).',
            type: 'number',
            name: 'concurrent_fragments',
        },
        {
            label: 'Limit Rate',
            description: 'Maximum download rate in bytes per second.',
            type: 'C-filesize',
            name: 'limit_rate',
        },
        {
            label: 'Throttle Rate',
            description:
                'Minimum download rate in bytes per second below which throttling is assumed and the video data is re-extracted.',
            type: 'C-filesize',
            name: 'throttle_rate',
        },
        {
            label: 'Retries',
            description: 'Number of retries (default is 10), or "infinite".',
            type: 'C-integer-or-infinite',
            name: 'retries',
        },
        {
            label: 'File Accress Retries',
            description: 'Number of times to retry on file access error (default is 3), or "infinite".',
            type: 'C-integer-or-infinite',
            name: 'file_access_retries',
        },
        {
            label: 'Fragment Retries',
            description: 'Number of retries for a fragment (default is 10), or "infinite".',
            type: 'C-integer-or-infinite',
            name: 'fragment_retries',
        },
        {
            label: 'Retry Sleep',
            description: `
                Time to sleep between retries in seconds (optionally) prefixed by the type of
                retry (http (default), fragment, file_access, extractor) to apply the sleep to.
                It can be a number, linear=START[:END[:STEP=1]] or exp=START[:END[:BASE=2]].
                This option can be used multiple times to set the sleep for the different retry types,
                e.g. "linear=1::2", "fragment:exp=1:20".
            `,
            type: 'text',
            name: 'retry_sleep',
            multiple: true,
        },
        {
            label: 'Abort On Unavailable Fragments',
            description: 'Abort download if a fragment is unavailable.',
            type: 'checkbox',
            name: 'abort_on_unavailable_fragment',
        },
        {
            label: 'Keep Fragments',
            description: 'Keep downloaded fragments on disk after downloading is finished.',
            type: 'checkbox',
            name: 'keep_fragments',
        },
        {
            label: 'Buffer Size',
            description: 'Size of download buffer (e.g. 1024 or 16K) (default is 1024).',
            type: 'C-filesize',
            name: 'buffer_size',
        },
        {
            label: 'No Resize Buffer',
            description: 'Do not automatically adjust the buffer size. Follow the `Buffer Size` option.',
            type: 'checkbox',
            name: 'no_resize_buffer',
        },
        {
            label: 'HTTP Chunk Size',
            description: `
                Size of a chunk for chunk-based HTTP downloading, e.g. 10485760 or 10M (default is disabled).
                May be useful for bypassing bandwidth throttling imposed by a webserver (experimental).
            `,
            type: 'C-filesize',
            name: 'http_chunk_size',
        },
        {
            label: 'Playlist Random',
            description: 'Download playlist videos in random order.',
            type: 'checkbox',
            name: 'playlist_random',
        },
        {
            label: 'Lazy Playlist',
            description:
                'Process entries in the playlist as they are received. This disables "Playlist Random" and "Playlist Reverse".',
            type: 'checkbox',
            name: 'lazy_playlist',
        },
        {
            label: 'Set Xattribute Filesize',
            description: 'Set file xattribute ytdl.filesize with expected file size.',
            type: 'checkbox',
            name: 'xattr_set_filesize',
        },
        {
            label: 'HLS Use Mpegts',
            description: `
                Use the mpegts container for HLS videos; allowing some players to play the video
                while downloading, and reducing the chance of file corruption if download is interrupted.
                This is only used by default when downloading live streams.
           `,
            type: 'select',
            name: 'hls_use_mpegts',
            options: [
                { value: '', label: 'Auto' },
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
            ],
        },
        {
            label: 'Download Sections',
            description: `
                Download only chapters that match the regular expression.
                A "*" prefix denotes time-range instead of chapter.
                Negative timestamps are calculated from the end.
                "*from-url" can be used to download between the "start_time" and "end_time" extracted from the URL.
                Needs ffmpeg.
                This option can be used multiple times to download multiple sections.
                E.g. "*10:15-inf", "intro".
            `,
            type: 'text',
            name: 'download_sections',
            multiple: true,
        },
        {
            label: 'Downloader',
            description: `
                Name or path of the external downloader to use
                (optionally) prefixed by the protocols (http, ftp, m3u8, dash, rstp, rtmp, mms) to use it for.
                Currently supports native, aria2c, avconv, axel, curl, ffmpeg, httpie, wget.
                E.g. "aria2c", "dash,m3u8:native" will
                use aria2c for http/ftp downloads, and the native downloader for dash/m3u8 downloads.
            `,
            type: 'text',
            name: 'downloader',
            multiple: true,
        },
        {
            label: 'Download Arguments',
            description: `
                Give these arguments to the external downloader.
                Specify the downloader name and the arguments separated by a colon ":".
                For ffmpeg, arguments can be passed to different positions using the same syntax as "Postprocessor Arguments".
            `,
            type: 'text',
            name: 'download_args',
            multiple: true,
        },
    ],
};

const outputOptions: FormInfoSet = {
    name: 'Output Option',
    items: [
        {
            label: 'Output Path',
            description: `
                The paths where the files should be downloaded to. Format: [TYPE:]PATH.
                Additionally, you can also provide "home" (default) and "temp" paths.
                All intermediary files are first downloaded to the temp path and then
                the final files are moved over to the home path after download is finished.
                This options is ignored if "Output File" is a absolute path.
            `,
            type: 'text',
            name: 'output_path',
            multiple: true,
        },
        {
            label: 'Output Filename',
            description: 'Output filename template. Format: [TYPE]:TEMPLATE.',
            type: 'text',
            name: 'output_filename',
            multiple: true,
        },
        {
            label: 'Output NA placeholder',
            description: 'Placeholder for unavailable fields in "Output Filename". Default is "NA".',
            type: 'text',
            name: 'output_na_placeholder',
        },
        {
            label: 'Resctict Filename',
            description: 'Restrict filenames to only ASCII characters, and avoid "&" and spaces in filenames',
            type: 'checkbox',
            name: 'restrict_filename',
        },
        {
            label: 'Windows Filename',
            description: 'Force the filenames to be Windows compatible.',
            type: 'checkbox',
            name: 'windows_filename',
        },
        {
            label: 'Trim Filename',
            description: 'Trim the filename to this length.',
            type: 'C-integer',
            name: 'trim_filename',
        },
    ],
};

const filesystemOptions: FormInfoSet = {
    name: 'Filesystem Option',
    items: [
        {
            label: 'Batch File',
            description: "File containing URLs to download ('-' for stdin), one URL per line.",
            type: 'text',
            name: 'batch_file',
        },
        {
            label: 'Overwrite Setting',
            description: 'Specify the overwrite behavior.',
            type: 'select',
            name: 'overwrite',
            options: [
                { label: 'Auto', value: '' },
                { label: 'Never', value: 'never' },
                { label: 'Always', value: 'always' },
            ],
        },
        {
            label: 'No Continue',
            description:
                'Do not resume partially downloaded fragments. If the file is not fragmented, restart download of the entire file.',
            type: 'checkbox',
            name: 'no_continue',
        },
        {
            label: 'No Part',
            description: 'Do not use .part files - write directly into output file',
            type: 'checkbox',
            name: 'no_part',
        },
        {
            label: 'No Mtime',
            description: 'Do not use the Last-modified header to set the file modification time.',
            type: 'checkbox',
            name: 'no_mtime',
        },
        {
            label: 'Write Description',
            description: 'Write video description to a .description file.',
            type: 'checkbox',
            name: 'write_description',
        },
        {
            label: 'Write Info JSON',
            description: 'Write video metadata to a .info.json file (this may contain personal information).',
            type: 'checkbox',
            name: 'write_info_json',
        },
        {
            label: 'No Write Playerlist Metafile',
            description: 'Do not write playlist metadata when using "Write description", "Write Info JSON", etc.',
            type: 'checkbox',
            name: 'no_write_playlist_metafile',
        },
        {
            label: 'Write All Info JSON',
            description:
                'Write all fields to the infojson. By default, some internal metadata such as filenames are removed.',
            type: 'checkbox',
            name: 'write_all_info_json',
        },
        {
            label: 'Write Comments',
            description: `
                Retrieve video comments to be placed in the infojson.
                The comments are fetched even without this option if the extraction is known to be quick
            `,
            type: 'checkbox',
            name: 'write_comments',
        },
        {
            label: 'Load Info JSON',
            description: 'JSON file containing the video information (created with the "Write Info JSON" option).',
            type: 'text',
            name: 'load_info_json',
        },
        {
            label: 'Cache Directory',
            description: `
                Location in the filesystem where yt-dlp can store some downloaded information (such as
                client ids and signatures) permanently. By default "\${XDG_CACHE_HOME}/yt-dlp".
            `,
            type: 'text',
            name: 'cache_dir',
        },
        {
            label: 'No Cache',
            description: 'Disable filesystem caching.',
            type: 'checkbox',
            name: 'no_cache_dir',
        },
        {
            label: 'Remove Cache',
            description: 'Delete all filesystem cache files.',
            type: 'checkbox',
            name: 'rm_cache_dir',
        },
    ],
};

export const formItemInfo = [
    globalInput,
    cookiesOptions,
    networdOptions,
    videoSelectionOptions,
    downloadOptions,
    outputOptions,
    filesystemOptions,
];
