#include "request.h"

#include "boost/process/search_path.hpp"
#include "nlohmann/json.hpp"

namespace ytweb
{

using Json = nlohmann::json;

namespace
{

void set_download_output_format(std::vector<std::string>& args)
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

void set_cookies_options(Json const& data, std::vector<std::string>& args)
{
    if (data.find("cookies_from_browser") != data.end())
    {
        args.emplace_back("--cookies-from-browser");
        args.emplace_back(data.at("cookies_from_browser").get<std::string>());
    }
    if (data.find("cookies_from_file") != data.end())
    {
        args.emplace_back("--cookies");
        args.emplace_back(data.at("cookies_from_file").get<std::string>());
    }
}

void set_network_options(Json const& data, std::vector<std::string>& args)
{
    if (data.find("proxy") != data.end())
    {
        args.emplace_back("--proxy");
        args.emplace_back(data.at("proxy").get<std::string>());
    }

    if (data.find("socket_timeout") != data.end())
    {
        args.emplace_back("--socket-timeout");
        args.emplace_back(data.at("socket_timeout").get<std::string>());
    }

    if (data.find("source_address") != data.end())
    {
        args.emplace_back("--source-address");
        args.emplace_back(data.at("source_address").get<std::string>());
    }

    if (data.find("force_ip_protocol") != data.end())
    {
        auto force_ip_protocol = data.at("force_ip_protocol").get<std::string>();
        if (force_ip_protocol == "ipv4")
        {
            args.emplace_back("--force-ipv4");
        }
        else if (force_ip_protocol == "ipv6")
        {
            args.emplace_back("--force-ipv6");
        }
    }

    if (data.find("enable_file_urls") != data.end())
    {
        args.emplace_back("--enable-file-urls");
    }
}

}  // anonymous namespace

Request::Request(std::string_view json)
{
    // Parse the JSON data.
    auto data = Json::parse(json);

    // If `yt_dlp_path` is not provided, run yt-dlp from `$PATH`
    yt_dlp_path = data.value("yt_dlp_path", boost::process::search_path("yt-dlp").string());

    // Parse the action.
    std::string action_str = data.at("action");

    // If action is "interrupt", other fields are not needed.
    if (action_str == "interrupt")
    {
        action = Action::Interrupt;
        return;
    }

    action = action_str == "preview" ? Action::Preview : Action::Download;

    // Generate arguments for yt-dlp
    args.push_back(data.at("url_input").get<std::string>());

    set_cookies_options(data, args);
    set_network_options(data, args);

    if (action == Request::Action::Preview)
    {
        args.emplace_back("-j");
    }
    else
    {
        set_download_output_format(args);

        // Set the output path.
        if (data.find("output_path") != data.end())
        {
            args.emplace_back("-P");
            args.emplace_back(data.at("output_path").get<std::string>());
        }

        // Only download audio.
        if (data.find("audio_only") != data.end())
        {
            args.emplace_back("--extract-audio");
        }
    }
}

}  // namespace ytweb
