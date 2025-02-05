import { useLogStore } from '@/store/log';

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function showDownloadingLog() {
    const log = useLogStore();

    const id = 0;

    // Send a request to the server
    const request = {
        action: 'download',
        url_input: 'https://www.bilibili.com/video/BV1n2rKYcEyG/',
    };
    log.debug(`Request: ${JSON.stringify(request, null, 2)}`);
    log.debug(`Received request: ${JSON.stringify(request)}`);
    await wait(1000);

    // Server run the download task
    log.info(`[Task ${id}] Successfully parsed request.`);
    log.debug(
        `[Task ${id}] Run command: /home/SuniRein/Apps/bin/yt-dlp https://www.bilibili.com/video/BV1n2rKYcEyG/ -O pre_process:Extract URL: %(webpage_url)s -O video:[%(extractor)s] %(id)s: %(format_id)q with format %(format)q -O before_dl:Start download... -O post_process:Finished downloading -O post_process:Start post processing... -O after_move:Finished post processing -O after_move:Save video to %(filepath)q --progress --newline --progress-template download:[Progress]%(progress)j`,
    );
    await wait(1000);

    // Simulate the download process
    log.debug(`[Task ${id}] Extract URL: https://www.bilibili.com/video/BV1n2rKYcEyG/`);
    log.debug(`[Task ${id}] [BiliBili] BV1n2rKYcEyG: 100026+30280 with format '1080P 高清+30280 - audio only'`);

    log.debug(`[Task ${id}] Start download...`);
    await wait(1000);
    log.debug(`[Task ${id}] Finished downloading`);
    log.debug(`[Task ${id}] Start post processing...`);
    await wait(100);
    log.debug(`[Task ${id}] Finished post processing`);
    log.debug(
        `[Task ${id}] Save video to '/home/SuniRein/Projects/yt-dlp-web/build/linux/x86_64/debug/【面对面】CR450——全球跑得最快的高铁 [BV1n2rKYcEyG].mp4'`,
    );

    log.info(`[Task ${id}] Download completed.`);
}
