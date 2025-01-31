#include "task_manager.h"

#include "boost/process/v2/environment.hpp"

#include "gmock/gmock.h"
#include "gtest/gtest.h"
#include <string>
#include <thread>

using namespace std::chrono_literals;

using boost::process::environment::find_executable;

class TaskManager : public ::testing::Test
{
  public:
    ytweb::TaskManager manager;

    std::string response;

    auto launch()
    {
        auto task = manager.launch(
            find_executable("python").string(), {YT_DLP_WEB_FAKE_BIN},
            [&](ytweb::TaskManager::TaskId id, std::string_view line) {
                response += "Task " + std::to_string(id) + ": ";
                response += line;
                response += "\n";
            },
            [&](ytweb::TaskManager::TaskId id) { response += "Task " + std::to_string(id) + " ended\n"; }
        );

        auto thread = std::jthread([this, task] { manager.wait(task); });

        return std::pair{task, std::move(thread)};
    }

    void TearDown() override
    {
        EXPECT_EQ(manager.size(), 0);
    }
};

TEST_F(TaskManager, LaunchOneTask)
{
    auto [task, thread] = launch();
    EXPECT_TRUE(manager.is_running(task));
    EXPECT_TRUE(response.empty());

    thread.join();

    EXPECT_FALSE(manager.is_running(task));
    EXPECT_EQ(response, "Task 0: start running\nTask 0: \nTask 0 ended\n");
}

TEST_F(TaskManager, LaunchTwoTasks)
{
    auto [task1, thread1] = launch();
    auto [task2, thread2] = launch();

    EXPECT_TRUE(manager.is_running(task1));
    EXPECT_TRUE(manager.is_running(task2));
    EXPECT_TRUE(response.empty());

    thread1.join();
    EXPECT_FALSE(manager.is_running(task1));
    EXPECT_THAT(response, testing::HasSubstr("Task 0: start running\n"));
    EXPECT_THAT(response, testing::HasSubstr("Task 0: \n"));
    EXPECT_THAT(response, testing::HasSubstr("Task 0 ended\n"));

    thread2.join();
    EXPECT_FALSE(manager.is_running(task2));
    EXPECT_THAT(response, testing::HasSubstr("Task 0: start running\n"));
    EXPECT_THAT(response, testing::HasSubstr("Task 0: \n"));
    EXPECT_THAT(response, testing::HasSubstr("Task 0 ended\n"));
}

TEST_F(TaskManager, KillTask)
{
    auto [task, thread] = launch();

    manager.kill(task);
    thread.join();

    EXPECT_FALSE(manager.is_running(task));
    EXPECT_TRUE(response.empty());
}

TEST_F(TaskManager, KillTaskBeforeWait)
{
    auto [task, thread] = launch();

    manager.kill(task);
    thread.join();
    EXPECT_FALSE(manager.is_running(task));
    EXPECT_TRUE(response.empty());
}

TEST_F(TaskManager, LaunchTwoTasksAndKillOne)
{
    auto [task1, thread1] = launch();
    auto [task2, thread2] = launch();

    manager.kill(task1);

    thread1.join();
    thread2.join();

    EXPECT_FALSE(manager.is_running(task1));
    EXPECT_FALSE(manager.is_running(task2));

    EXPECT_THAT(response, testing::Not(testing::HasSubstr("Task 0")));
    EXPECT_THAT(response, testing::HasSubstr("Task 1: start running\n"));
    EXPECT_THAT(response, testing::HasSubstr("Task 1: \n"));
    EXPECT_THAT(response, testing::HasSubstr("Task 1 ended\n"));
}
