#include "boost/process/v1/search_path.hpp"
#include "request.h"

#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "nlohmann/json.hpp"

#include <string>

using ytweb::Request;
using Json = nlohmann::json;

using namespace std::string_literals;

namespace
{

auto make_args(std::string_view json)
{
    Json data = Json::parse(json);
    data.emplace("action", "preview");
    data.emplace("url_input", "http://example.com");

    Request request(data.dump());
    return request.args();
}

MATCHER_P(HasOption, name, "has argument \""s + name + "\"")
{
    return std::find(arg.begin(), arg.end(), name) != arg.end();
}

MATCHER_P2(HasArgumentOption, name, value, "has argument option \""s + name + "\" with value \"" + value + "\"")
{
    auto it = std::find(arg.begin(), arg.end(), name);
    while (it != arg.end())
    {
        if (it + 1 != arg.end() && *(it + 1) == value)
        {
            return true;
        }
        it = std::find(it + 1, arg.end(), name);
    }
    return false;
}

}  // anonymous namespace

TEST(Request, ParseValidJSON)
{
    std::string json = R"({
        "action": "preview",
        "yt_dlp_path": "/usr/bin/yt-dlp",
        "url_input": "https://example.com/video",
        "audio_only": true,
        "quality": "high",
        "output_path": "/tmp/output"
    })";

    Request request(json);

    EXPECT_EQ(request.action(), Request::Action::Preview);
    EXPECT_EQ(request.yt_dlp_path(), "/usr/bin/yt-dlp");
    EXPECT_EQ(request.args().front(), "https://example.com/video");
    EXPECT_THAT(request.args(), HasOption("-j"));
}

TEST(Request, InterruptAction)
{
    std::string json = R"({"action": "interrupt"})";
    EXPECT_EQ(Request(json).action(), Request::Action::Interrupt);
}

TEST(Request, MissingFields)
{
    std::string json = R"({"action": "download", "url_input": "https://example.com/video"})";

    Request request(json);

    EXPECT_EQ(request.action(), Request::Action::Download);
    EXPECT_EQ(request.yt_dlp_path(), boost::process::search_path("yt-dlp"));
    EXPECT_EQ(request.args().front(), "https://example.com/video");
}

TEST(Request, MissingAction)
{
    std::string json = R"({"yt_dlp_path": "/usr/bin/yt-dlp", "url_input": "https://example.com/video"})";
    EXPECT_THROW(Request request(json), Json::out_of_range);
}

TEST(Request, MissingURLInput)
{
    std::string json = R"({"action": "download", "yt_dlp_path": "/usr/bin/yt-dlp"})";
    EXPECT_THROW(Request request(json), Json::out_of_range);
}

TEST(Request, InvalidJSON)
{
    std::string json = "invalid_json";
    EXPECT_THROW(Request request(json), Json::parse_error);
}

TEST(Request, CookiesOptions)
{
    auto args = make_args(R"({
        "cookies_from_browser": "chrome",
        "cookies_from_file": "/tmp/cookies.txt"
    })");

    EXPECT_THAT(args, HasArgumentOption("--cookies-from-browser", "chrome"));
    EXPECT_THAT(args, HasArgumentOption("--cookies", "/tmp/cookies.txt"));
}

TEST(Request, CommonNetworkOptions)
{
    auto args = make_args(R"({
        "proxy": "socks5://127.0.0.1:7890",
        "socket_timeout": "10",
        "source_address": "1.2.3.4",
        "enable_file_urls": true
    })");

    EXPECT_THAT(args, HasArgumentOption("--proxy", "socks5://127.0.0.1:7890"));
    EXPECT_THAT(args, HasArgumentOption("--socket-timeout", "10"));
    EXPECT_THAT(args, HasArgumentOption("--source-address", "1.2.3.4"));
    EXPECT_THAT(args, HasOption("--enable-file-urls"));
}

TEST(Request, ForceIpProtocolOption)
{
    EXPECT_THAT(make_args(R"({"force_ip_protocol": "ipv4"})"), HasOption("--force-ipv4"));
    EXPECT_THAT(make_args(R"({"force_ip_protocol": "ipv6"})"), HasOption("--force-ipv6"));
}

TEST(Request, CommonVideoSelectionOptions)
{
    auto args = make_args(R"({
        "playlist_indices": "1,2:3,-6:-1,-5::0",
        "age_limit": "18",
        "max_download_number": "10",
        "download_archive": "/tmp/downloaded.txt",
        "break_on_existing": true,
        "break_per_input": true,
        "skip_playlist_after_errors": "8"
    })");

    EXPECT_THAT(args, HasArgumentOption("--playlist-items", "1,2:3,-6:-1,-5::0"));
    EXPECT_THAT(args, HasArgumentOption("--age-limit", "18"));
    EXPECT_THAT(args, HasArgumentOption("--max-downloads", "10"));
    EXPECT_THAT(args, HasArgumentOption("--download-archive", "/tmp/downloaded.txt"));
    EXPECT_THAT(args, HasOption("--break-on-existing"));
    EXPECT_THAT(args, HasOption("--break-per-input"));
    EXPECT_THAT(args, HasArgumentOption("--skip-playlist-after-errors", "8"));
}

TEST(Request, FilesizeOption)
{
    EXPECT_THAT(make_args(R"({"filesize_min": "100K"})"), HasArgumentOption("--min-filesize", "100K"));
    EXPECT_THAT(make_args(R"({"filesize_max": "0.2M"})"), HasArgumentOption("--max-filesize", "0.2M"));
}

TEST(Request, DateOption)
{
    EXPECT_THAT(make_args(R"({"date": "20220101"})"), HasArgumentOption("--date", "20220101"));
    EXPECT_THAT(make_args(R"({"date_before": "now"})"), HasArgumentOption("--datebefore", "now"));
    EXPECT_THAT(make_args(R"({"date_after": "today-2week"})"), HasArgumentOption("--dateafter", "today-2week"));
}

TEST(Request, FiltersOption)
{
    auto args = make_args(R"({
        "filters": [
            "!is_live",
            "like_count>?100 & description~='(?i)\\bcats \\& dogs\\b'"
        ]
    })");

    EXPECT_THAT(args, HasArgumentOption("--match-filters", "!is_live"));
    EXPECT_THAT(args, HasArgumentOption("--match-filters", R"(like_count>?100 & description~='(?i)\bcats \& dogs\b')"));
}

TEST(Request, StopFiltersOption)
{
    auto args = make_args(R"({
        "stop_filters": [
            "duration > 600",
            "duration < 3600"
        ]
    })");

    EXPECT_THAT(args, HasArgumentOption("--break-match-filters", "duration > 600"));
    EXPECT_THAT(args, HasArgumentOption("--break-match-filters", "duration < 3600"));
}

TEST(Request, IsPlaylistOption)
{
    EXPECT_THAT(make_args(R"({"is_playlist": "no" })"), HasOption("--no-playlist"));
    EXPECT_THAT(make_args(R"({"is_playlist": "yes"})"), HasOption("--yes-playlist"));
}

TEST(Request, DownloadOptions)
{
    auto args = make_args(R"({
        "concurrent_fragments": "4",
        "limit_rate": "1M",
        "throttle_rate": "100",
        "retries": "15",
        "file_access_retries": "5",
        "fragment_retries": "infinite",
        "retry_sleep": [
            "linear=1::2",
            "fragment:exp=1:20"
        ],
        "abort_on_unavailable_fragment": true,
        "keep_fragments": true,
        "buffer_size": "10M",
        "no_resize_buffer": true,
        "http_chunk_size": "1M",
        "playlist_random": true,
        "lazy_playlist": true,
        "xattr_set_filesize": true,
        "hls_use_mpegts": "no",
        "download_sections": [
            "*10:15-inf",
            "intro"
        ],
        "downloader": [
            "aria2c",
            "dash,m3u8:native"
        ],
        "download_args": [
            "aria2c:--max-connection-per-server=5",
            "curl:--proxy socks5://127.0.0.1:7890"
        ]
    })");

    EXPECT_THAT(args, HasArgumentOption("--concurrent-fragments", "4"));
    EXPECT_THAT(args, HasArgumentOption("--limit-rate", "1M"));
    EXPECT_THAT(args, HasArgumentOption("--throttle-rate", "100"));
    EXPECT_THAT(args, HasArgumentOption("--retries", "15"));
    EXPECT_THAT(args, HasArgumentOption("--file-access-retries", "5"));
    EXPECT_THAT(args, HasArgumentOption("--fragment-retries", "infinite"));
    EXPECT_THAT(args, HasArgumentOption("--retry-sleep", "linear=1::2"));
    EXPECT_THAT(args, HasArgumentOption("--retry-sleep", "fragment:exp=1:20"));
    EXPECT_THAT(args, HasOption("--abort-on-unavailable-fragment"));
    EXPECT_THAT(args, HasOption("--keep-fragments"));
    EXPECT_THAT(args, HasArgumentOption("--buffer-size", "10M"));
    EXPECT_THAT(args, HasOption("--no-resize-buffer"));
    EXPECT_THAT(args, HasArgumentOption("--http-chunk-size", "1M"));
    EXPECT_THAT(args, HasOption("--playlist-random"));
    EXPECT_THAT(args, HasOption("--lazy-playlist"));
    EXPECT_THAT(args, HasOption("--xattr-set-filesize"));
    EXPECT_THAT(args, HasOption("--no-hls-use-mpegts"));
    EXPECT_THAT(args, HasArgumentOption("--download-section", "*10:15-inf"));
    EXPECT_THAT(args, HasArgumentOption("--download-section", "intro"));
    EXPECT_THAT(args, HasArgumentOption("--downloader", "aria2c"));
    EXPECT_THAT(args, HasArgumentOption("--downloader", "dash,m3u8:native"));
    EXPECT_THAT(args, HasArgumentOption("--downloader-args", "aria2c:--max-connection-per-server=5"));
    EXPECT_THAT(args, HasArgumentOption("--downloader-args", "curl:--proxy socks5://127.0.0.1:7890"));
}

TEST(Request, FilesystemOptions)
{
    EXPECT_THAT(make_args(R"({"batch_file": "/tmp/batch_file.txt"})"), HasArgumentOption("--batch-file", "/tmp/batch_file.txt"));
    EXPECT_THAT(make_args(R"({"overwrite": "never"})"), HasOption("--no-overwrites"));
    EXPECT_THAT(make_args(R"({"overwrite": "always"})"), HasOption("--force-overwrites"));
    EXPECT_THAT(make_args(R"({"no_continue": true})"), HasOption("--no-continue"));
    EXPECT_THAT(make_args(R"({"no_part": true})"), HasOption("--no-part"));
    EXPECT_THAT(make_args(R"({"no_mtime": true})"), HasOption("--no-mtime"));
    EXPECT_THAT(make_args(R"({"write_description": true})"), HasOption("--write-description"));
    EXPECT_THAT(make_args(R"({"write_info_json": true})"), HasOption("--write-info-json"));
    EXPECT_THAT(make_args(R"({"no_write_playlist_metafile": true})"), HasOption("--no-write-playlist-metafiles"));
    EXPECT_THAT(make_args(R"({"write_all_info_json": true})"), HasOption("--no-clean-info-json"));
    EXPECT_THAT(make_args(R"({"write_comments": true})"), HasOption("--write-comments"));
    EXPECT_THAT(make_args(R"({"load_info_json": "info.json"})"), HasArgumentOption("--load-info-json", "info.json"));
    EXPECT_THAT(make_args(R"({"cache_dir": "/tmp/cache"})"), HasArgumentOption("--cache-dir", "/tmp/cache"));
    EXPECT_THAT(make_args(R"({"no_cache_dir": true})"), HasOption("--no-cache-dir"));
    EXPECT_THAT(make_args(R"({"rm_cache_dir": true})"), HasOption("--rm-cache-dir"));
}

TEST(Request, OutputOptions)
{
    auto args = make_args(R"({
        "output_path": [
            "home:~/Downloads",
            "temp:~/tmp"
        ],
        "output_filename": [
            "subtitle:sub",
            "%(uploader)s/%(title)s.%(ext)s"
        ],
        "output_na_placeholder": "N/A",
        "restrict_filename": true,
        "windows_filename": true,
        "trim_filename": "50"
    })");

    EXPECT_THAT(args, HasArgumentOption("-P", "home:~/Downloads"));
    EXPECT_THAT(args, HasArgumentOption("-P", "temp:~/tmp"));
    EXPECT_THAT(args, HasArgumentOption("-o", "subtitle:sub"));
    EXPECT_THAT(args, HasArgumentOption("-o", "%(uploader)s/%(title)s.%(ext)s"));
    EXPECT_THAT(args, HasArgumentOption("--output-na-placeholder", "N/A"));
    EXPECT_THAT(args, HasOption("--restrict-filenames"));
    EXPECT_THAT(args, HasOption("--windows-filenames"));
    EXPECT_THAT(args, HasArgumentOption("--trim-filename", "50"));
}
