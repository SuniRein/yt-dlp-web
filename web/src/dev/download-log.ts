import { useLogStore } from '@/store/log';

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function showDownloadingLog() {
    const log = useLogStore();

    // Send a request to the server
    const request = {
        action: 'download',
        url_input: 'https://www.bilibili.com/video/BV1n2rKYcEyG/',
    };
    log.log('debug', `Request: ${JSON.stringify(request, null, 2)}`);
    await wait(1000);

    // Server run the download task
    log.log(
        'debug',
        'Run command: /home/SuniRein/Apps/bin/yt-dlp https://www.bilibili.com/video/BV1n2rKYcEyG/ -O pre_process:Extract URL: %(webpage_url)s -O video:[%(extractor)s] %(id)s: %(format_id)q with format %(format)q -O before_dl:Start download... -O post_process:Finished downloading -O post_process:Start post processing... -O after_move:Finished post processing -O after_move:Save video to %(filepath)q --progress --newline --progress-template download:[Progress]%(progress)j',
    );
    log.log('info', 'Run task 0.');
    await wait(1000);

    // Simulate the download process
    log.log('debug', 'Extract URL: https://www.bilibili.com/video/BV1n2rKYcEyG/');
    log.log('debug', "[BiliBili] BV1n2rKYcEyG: 100026+30280 with format '1080P 高清+30280 - audio only'");

    log.log('debug', 'Start download...');
    await wait(1000);
    log.log('debug', 'Finished downloading');
    log.log('debug', 'Start post processing...');
    await wait(100);
    log.log('debug', 'Finished post processing');
    log.log(
        'debug',
        "Save video to '/home/SuniRein/Projects/yt-dlp-web/build/linux/x86_64/debug/【面对面】CR450——全球跑得最快的高铁 [BV1n2rKYcEyG].mp4'",
    );
    log.log('info', 'Download completed.');
}
