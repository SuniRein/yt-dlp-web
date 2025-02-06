#include "app.h"
#include "runtime.h"
#include "syscmdline/parser.h"
#include "syscmdline/system.h"

namespace SCL = SysCmdLine;

int main()
{
    SCL::Argument runtime_argument("runtime");
    runtime_argument.setExpectedValues({
        "no",
        "browser",
        "chrome",
        "firefox",
        "edge",
        "safari",
        "chromium",
        "opera",
        "brave",
        "vivaldi",
        "epic",
        "yandex",
        "chromium",
        "webview",
    });

    SCL::Option runtime_option({"--runtime", "-r"}, "Set the runtime to use");
    runtime_option.setRequired(false);
    runtime_option.addArgument(runtime_argument);

    SCL::Command root_command("yt-dlp-web");
    root_command.addHelpOption();
    root_command.addOption(runtime_option);
    root_command.setHandler([&](SCL::ParseResult const& result) {
        auto& app = ytweb::App::instance();
        app.init();

        if (result.isOptionSet(runtime_option))
        {
            auto runtime = ytweb::get_runtime(result.valueForOption(runtime_option).toString());
            if (runtime.has_value())
            {
                app.set_runtime(runtime.value());
            }
        }

        app.run();

        return 0;
    });

    SCL::Parser parser(root_command);
    return parser.invoke(SCL::commandLineArguments());
}
