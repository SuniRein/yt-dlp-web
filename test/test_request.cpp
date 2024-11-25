#include "boost/process/v1/search_path.hpp"
#include "request.h"

#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include "nlohmann/json.hpp"

#include <string>

using ytweb::Request;
using Json = nlohmann::json;

using namespace std::string_literals;

MATCHER_P(HasOption, name, "has argument \""s + name + "\"")
{
    return std::find(arg.begin(), arg.end(), name) != arg.end();
}

MATCHER_P2(HasArgumentOption, name, value, "has argument option \""s + name + "\" with value \"" + value + "\"")
{
    auto it = std::find(arg.begin(), arg.end(), name);
    if (it == arg.end())
    {
        *result_listener << "where argument not found: \"" << name << "\"";
        return false;
    }

    if (it + 1 == arg.end())
    {
        *result_listener << "where argument \"" << name << "\" has no value";
        return false;
    }

    if (*(it + 1) != value)
    {
        *result_listener << "where argument \"" << name << "\" has wrong value: \"" << *(it + 1) << "\"";
        return false;
    }

    return true;
}

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
    EXPECT_THAT(request.args, HasOption("-j"));
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

TEST(Request, CookiesOptions)
{
    std::string json = R"({
        "action": "preview",
        "url_input": "https://example.com/video",
        "cookies_from_browser": "chrome",
        "cookies_from_file": "/tmp/cookies.txt"
    })";

    Request request(json);

    EXPECT_THAT(request.args, HasArgumentOption("--cookies-from-browser", "chrome"));
    EXPECT_THAT(request.args, HasArgumentOption("--cookies", "/tmp/cookies.txt"));
}

TEST(Request, NetworkOptions)
{
    std::string json = R"({
        "action": "preview",
        "url_input": "https://example.com/video",
        "proxy": "socks5://127.0.0.1:7890",
        "socket_timeout": "10",
        "source_address": "1.2.3.4",
        "force_ip_protocol": "ipv6",
        "enable_file_urls": true
    })";

    Request request(json);

    EXPECT_THAT(request.args, HasArgumentOption("--proxy", "socks5://127.0.0.1:7890"));
    EXPECT_THAT(request.args, HasArgumentOption("--socket-timeout", "10"));
    EXPECT_THAT(request.args, HasArgumentOption("--source-address", "1.2.3.4"));
    EXPECT_THAT(request.args, HasOption("--force-ipv6"));
    EXPECT_THAT(request.args, HasOption("--enable-file-urls"));
}
