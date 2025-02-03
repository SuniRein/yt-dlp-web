declare global {
    interface Window {
        logMessage: (level: string, message: string) => void;
        showDownloadProgress: (rawData: Uint8Array) => void;
        showDownloadInfo: (rawData: Uint8Array) => void;
        showPreviewInfo: (rawData: Uint8Array) => void;
        reportCompletion: (id: number) => void;
        reportInterruption: (id: number) => void;
    }
}

export {};
