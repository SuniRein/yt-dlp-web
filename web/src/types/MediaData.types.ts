export interface MediaFormat {
    format_id: string;
    ext: string;
    resolution: string;
    fps: number;
    filesize_approx: number;
    protocol: string;
    vcodec: string;
    acodec: string;
    tbr: number;
    vbr: number;
    abr: number;
}

export interface MediaData {
    title: string;
    description: string;
    thumbnail: string;
    formats: MediaFormat[];
    requested_formats: { format_id: string }[];
    filename: string;
}
