#include "async_process.h"

#include "boost/process/v2/environment.hpp"
#include "gtest/gtest.h"

using namespace std::chrono_literals;

using boost::process::environment::find_executable;

class AsyncProcess: public ::testing::Test
{
  public:
    ytweb::AsyncProcess process{
        find_executable("python").string(), {YT_DLP_WEB_FAKE_BIN}, [&](std::string_view line) { responce += line; }, [&]() { eof_called = true; }};

    bool eof_called{false};

    std::string responce;
};

TEST_F(AsyncProcess, LaunchAndInterrupt)
{
    EXPECT_TRUE(process.running());

    process.interrupt();
    process.wait();

    EXPECT_FALSE(process.running());
    EXPECT_NE(responce, "start running");
    EXPECT_FALSE(eof_called);
}

TEST_F(AsyncProcess, LaunchAndWait)
{
    EXPECT_TRUE(process.running());

    process.wait();

    EXPECT_FALSE(process.running());
    EXPECT_EQ(responce, "start running");
    EXPECT_TRUE(eof_called);
}
