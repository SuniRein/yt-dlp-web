#include "app.h"
#include "runtime.h"
#include "syscmdline/parser.h"
#include "syscmdline/system.h"

namespace SCL = SysCmdLine;

int main()
{
    auto runtime_option = SCL::Option({"--runtime", "-r"}, "Set the runtime to use.");
    runtime_option.setRequired(false);
    runtime_option.addArgument(SCL::Argument("runtime").expect({
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
    }));

    SCL::Option browser_option({"--browser", "-b"}, "Show in browser. Alias for '--runtime browser'.");
    browser_option.setRequired(false);

    SCL::Option webview_option({"--webview", "-w"}, "Show in webview. Alias for '--runtime webview'. (Default)");
    webview_option.setRequired(false);

    SCL::Command root_command("yt-dlp-web");
    root_command.addHelpOption();
    root_command.addOptions({runtime_option, browser_option, webview_option});
    root_command.setHandler([&](SCL::ParseResult const& result) {
        auto& app = ytweb::App::instance();
        app.init();

        if (result.isOptionSet(browser_option))
        {
            app.set_runtime(ytweb::Runtime::AnyBrowser);
        }
        else if (result.isOptionSet(webview_option))
        {
            app.set_runtime(ytweb::Runtime::Webview);
        }
        else if (result.isOptionSet(runtime_option))
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
