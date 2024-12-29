export function bytesToSize(bytes: number) {
    if (!bytes) bytes = 0;

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes > 1024 && i < sizes.length) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${sizes[i]}`;
}
