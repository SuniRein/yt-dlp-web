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
    duration_string: string;
    thumbnail: string;

    uploader: string;
    upload_date: string;

    like_count: number;
    view_count: number;
    comment_count: number;

    filename: string;

    webpage_url: string;

    formats: MediaFormat[];
    requested_formats: { format_id: string }[];
}
