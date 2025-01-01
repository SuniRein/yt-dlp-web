#include "request.h"

#include <map>
#include <string_view>

#include "boost/process/v1/search_path.hpp"
#include "nlohmann/json.hpp"

namespace ytweb
{

using Json = nlohmann::json;

class Request::Impl
{
  public:
    Action                   action{};
    std::string              yt_dlp_path;
    std::vector<std::string> args;

    void parse(std::string_view json);

  private:
    Json data_;

    void check_argument_option(std::string_view key, std::string_view option);
    void check_multiple_argument_option(std::string_view key, std::string_view option);
    void check_option(std::string_view key, std::string_view option);
    void map_option(std::string_view key, std::map<std::string, std::string> const& options);

    void set_download_output_format();

    void set_cookies_options();
    void set_network_options();
    void set_video_selection_options();
    void set_download_options();
    void set_output_options();
    void set_filesystem_options();
};

void Request::Impl::check_argument_option(std::string_view key, std::string_view option)
{
    if (data_.find(key) != data_.end())
    {
        args.emplace_back(option);
        args.emplace_back(data_.at(key).get<std::string>());
    }
}

// The value is an array => make multiple argument options.
void Request::Impl::check_multiple_argument_option(std::string_view key, std::string_view option)
{
    if (data_.find(key) != data_.end())
    {
        for (auto const& value : data_.at(key))
        {
            args.emplace_back(option);
            args.emplace_back(value.get<std::string>());
        }
    }
}

void Request::Impl::check_option(std::string_view key, std::string_view option)
{
    if (data_.find(key) != data_.end())
    {
        args.emplace_back(option);
    }
}

void Request::Impl::map_option(std::string_view key, std::map<std::string, std::string> const& options)
{
    if (data_.find(key) != data_.end())
    {
        auto value = data_.at(key).get<std::string>();
        if (options.find(value) != options.end())
        {
            args.emplace_back(options.at(value));
        }
    }
}

void Request::Impl::set_download_output_format()
{
    // Set common output information.
    args.emplace_back("-O");
    args.emplace_back("pre_process:Extract URL: %(webpage_url)s");

    args.emplace_back("-O");
    args.emplace_back("video:[%(extractor)s] %(id)s: %(format_id)q with format %(format)q");

    args.emplace_back("-O");
    args.emplace_back("before_dl:Start download...");

    args.emplace_back("-O");
    args.emplace_back("post_process:Finished downloading");

    args.emplace_back("-O");
    args.emplace_back("post_process:Start post processing...");

    args.emplace_back("-O");
    args.emplace_back("after_move:Finished post processing");

    args.emplace_back("-O");
    args.emplace_back("after_move:Save video to %(filepath)q");

    // Show downloading progress even in quiet mode.
    args.emplace_back("--progress");

    // Show downloading progress in a new line.
    args.emplace_back("--newline");

    // Show downloading progress as json format.
    // Add a prefix to the progress information to distinguish it from other information.
    args.emplace_back("--progress-template");
    args.emplace_back("download:[Progress]%(progress)j");
}

void Request::Impl::set_cookies_options()
{
    check_argument_option("cookies_from_browser", "--cookies-from-browser");
    check_argument_option("cookies_from_file", "--cookies");
}

void Request::Impl::set_network_options()
{
    check_argument_option("proxy", "--proxy");
    check_argument_option("socket_timeout", "--socket-timeout");
    check_argument_option("source_address", "--source-address");
    map_option("force_ip_protocol",
        {
            {"ipv4", "--force-ipv4"},
            {"ipv6", "--force-ipv6"}
    });
    check_option("enable_file_urls", "--enable-file-urls");
}

void Request::Impl::set_video_selection_options()
{
    check_argument_option("playlist_indices", "--playlist-items");
    check_argument_option("filesize_min", "--min-filesize");
    check_argument_option("filesize_max", "--max-filesize");
    check_argument_option("date", "--date");
    check_argument_option("date_before", "--datebefore");
    check_argument_option("date_after", "--dateafter");
    check_multiple_argument_option("filters", "--match-filters");
    check_multiple_argument_option("stop_filters", "--break-match-filters");
    map_option("is_playlist",
        {
            {"yes", "--yes-playlist"},
            { "no",  "--no-playlist"}
    });
    check_argument_option("age_limit", "--age-limit");
    check_argument_option("max_download_number", "--max-downloads");
    check_argument_option("download_archive", "--download-archive");
    check_option("break_on_existing", "--break-on-existing");
    check_option("break_per_input", "--break-per-input");
    check_argument_option("skip_playlist_after_errors", "--skip-playlist-after-errors");
}

void Request::Impl::set_download_options()
{
    check_argument_option("concurrent_fragments", "--concurrent-fragments");
    check_argument_option("limit_rate", "--limit-rate");
    check_argument_option("throttle_rate", "--throttle-rate");
    check_argument_option("retries", "--retries");
    check_argument_option("file_access_retries", "--file-access-retries");
    check_argument_option("fragment_retries", "--fragment-retries");
    check_multiple_argument_option("retry_sleep", "--retry-sleep");
    check_option("abort_on_unavailable_fragment", "--abort-on-unavailable-fragment");
    check_option("keep_fragments", "--keep-fragments");
    check_argument_option("buffer_size", "--buffer-size");
    check_option("no_resize_buffer", "--no-resize-buffer");
    check_argument_option("http_chunk_size", "--http-chunk-size");
    check_option("playlist_random", "--playlist-random");
    check_option("lazy_playlist", "--lazy-playlist");
    check_option("xattr_set_filesize", "--xattr-set-filesize");
    map_option("hls_use_mpegts",
        {
            {"yes",    "--hls-use-mpegts"},
            { "no", "--no-hls-use-mpegts"}
    });
    check_multiple_argument_option("download_sections", "--download-section");
    check_multiple_argument_option("downloader", "--downloader");
    check_multiple_argument_option("download_args", "--downloader-args");
}

void Request::Impl::set_output_options()
{
    check_multiple_argument_option("output_path", "-P");
    check_multiple_argument_option("output_filename", "-o");
    check_argument_option("output_na_placeholder", "--output-na-placeholder");
    check_option("restrict_filename", "--restrict-filenames");
    check_option("windows_filename", "--windows-filenames");
    check_argument_option("trim_filename", "--trim-filename");
}

void Request::Impl::set_filesystem_options()
{
    check_argument_option("batch_file", "--batch-file");
    map_option("overwrite",
        {
            { "never",    "--no-overwrites"},
            {"always", "--force-overwrites"}
    });
    check_option("no_continue", "--no-continue");
    check_option("no_part", "--no-part");
    check_option("no_mtime", "--no-mtime");
    check_option("write_description", "--write-description");
    check_option("write_info_json", "--write-info-json");
    check_option("no_write_playlist_metafile", "--no-write-playlist-metafiles");
    check_option("write_all_info_json", "--no-clean-info-json");
    check_option("write_comments", "--write-comments");
    check_argument_option("load_info_json", "--load-info-json");
    check_argument_option("cache_dir", "--cache-dir");
    check_option("no_cache_dir", "--no-cache-dir");
    check_option("rm_cache_dir", "--rm-cache-dir");
}

void Request::Impl::parse(std::string_view json)
{
    data_ = Json::parse(json);

    // If `yt_dlp_path` is not provided, run yt-dlp from `$PATH`
    yt_dlp_path = data_.value("yt_dlp_path", boost::process::search_path("yt-dlp").string());

    // Parse the action.
    std::string action_str = data_.at("action");

    action = action_str == "preview" ? Action::Preview : Action::Download;

    // Generate arguments for yt-dlp
    args.emplace_back(data_.at("url_input").get<std::string>());

    set_cookies_options();
    set_network_options();
    set_video_selection_options();
    set_download_options();
    set_output_options();
    set_filesystem_options();

    if (action == Request::Action::Preview)
    {
        args.emplace_back("-j");
    }
    else
    {
        set_download_output_format();

        // Only download audio.
        check_option("audio_only", "--extract-audio");
    }

    // JSON data is not needed anymore.
    data_.clear();
}

/// Implement the `Request` class.

auto Request::action() const -> Action
{
    return impl_->action;
}

auto Request::yt_dlp_path() const -> std::string const&
{
    return impl_->yt_dlp_path;
}

auto Request::args() const -> std::vector<std::string> const&
{
    return impl_->args;
}

Request::Request(std::string_view json): impl_(std::make_unique<Impl>())
{
    impl_->parse(json);
}

Request::~Request() = default;

}  // namespace ytweb
