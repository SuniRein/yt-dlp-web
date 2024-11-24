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
