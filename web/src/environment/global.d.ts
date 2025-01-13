declare global {
    interface Window {
        logMessage: (message: string) => void;
        showDownloadProgress: (rawData: Uint8Array) => void;
        showDownloadInfo: (rawData: Uint8Array) => void;
        showPreviewInfo: (rawData: Uint8Array) => void;
        reportCompletion: (id: number) => void;
    }
}

export {};
