#include "async_process.h"

#include "boost/process/search_path.hpp"
#include "gtest/gtest.h"
#include "nlohmann/json.hpp"

#include "request.h"

using ytweb::Request;

using Json = nlohmann::json;

using namespace std::chrono_literals;

class AsyncProcess: public ::testing::Test
{
  public:
    inline static bool eof_called_;

    inline static std::unique_ptr<Request> request_;

    static void SetUpTestSuite()
    {
        Json json;
        json["action"]      = "preview";
        json["url_input"]   = YT_DLP_WEB_FAKE_BIN;
        json["yt_dlp_path"] = boost::process::search_path("python").string();

        request_ = std::make_unique<Request>(json.dump());
    }

    void SetUp() override
    {
        auto& process = ytweb::AsyncProcess::get_instance();
        process.launch(*request_, [&](std::string_view line) {}, [&]() { eof_called_ = true; });
    }

    void TearDown() override {}
};

TEST_F(AsyncProcess, LaunchAndInterrupt)
{
    auto& process = ytweb::AsyncProcess::get_instance();

    EXPECT_TRUE(process.running());

    process.interrupt();
    process.wait();

    EXPECT_FALSE(process.running());
    EXPECT_FALSE(eof_called_);
}

TEST_F(AsyncProcess, LaunchAndWait)
{
    auto& process = ytweb::AsyncProcess::get_instance();

    EXPECT_TRUE(process.running());

    process.wait();

    EXPECT_FALSE(process.running());
    EXPECT_TRUE(eof_called_);
}
