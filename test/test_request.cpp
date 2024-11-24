#include "boost/process/v1/search_path.hpp"
#include "request.h"

#include "gtest/gtest.h"
#include "nlohmann/json.hpp"

using ytweb::Request;
using Json = nlohmann::json;

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

    EXPECT_EQ(request.action, Request::Action::Preview);
    EXPECT_EQ(request.yt_dlp_path, "/usr/bin/yt-dlp");
    EXPECT_EQ(request.args[0], "https://example.com/video");
    EXPECT_NE(std::find(request.args.begin(), request.args.end(), "-j"), request.args.end());
}

TEST(Request, InterruptAction)
{
    std::string json = R"({"action": "interrupt"})";
    EXPECT_EQ(Request(json).action, Request::Action::Interrupt);
}

TEST(Request, MissingFields)
{
    std::string json = R"({"action": "download", "url_input": "https://example.com/video"})";

    Request request(json);

    EXPECT_EQ(request.action, Request::Action::Download);
    EXPECT_EQ(request.yt_dlp_path, boost::process::search_path("yt-dlp"));
    EXPECT_EQ(request.args[0], "https://example.com/video");
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

TEST(Request, Cookies)
{
    std::string json = R"({
        "action": "proview",
        "yt_dlp_path": "/usr/bin/yt-dlp",
        "url_input": "https://example.com/video",
        "cookies_from_browser": "chrome",
        "cookies_from_file": "/tmp/cookies.txt"
    })";

    Request request(json);

    auto cookies_from_browser = std::find(request.args.begin(), request.args.end(), "--cookies-from-browser");
    EXPECT_NE(cookies_from_browser, request.args.end());
    EXPECT_EQ(*(cookies_from_browser + 1), "chrome");

    auto cookies_from_file = std::find(request.args.begin(), request.args.end(), "--cookies");
    EXPECT_NE(cookies_from_file, request.args.end());
    EXPECT_EQ(*(cookies_from_file + 1), "/tmp/cookies.txt");
}
