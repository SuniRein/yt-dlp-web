#include "app.h"
#include "exception.h"
#include "runtime.h"
#include "syscmdline/parser.h"
#include "syscmdline/system.h"

#include <iostream>

namespace SCL = SysCmdLine;

int main()
{
    SCL::Option runtime_option({"--runtime", "-r"}, "Set the runtime to use.");
    runtime_option.setRequired(false);
    runtime_option.addArgument(SCL::Argument("runtime")
                                   .expect({
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
                                   })
                                   .default_value("webview"));

    SCL::Option browser_option({"--browser", "-b"}, "Show in browser. Alias for '--runtime browser'.");
    browser_option.setRequired(false);

    SCL::Option webview_option({"--webview", "-w"}, "Show in webview. Alias for '--runtime webview'. (Default)");
    webview_option.setRequired(false);

    SCL::Option server_dir_option(
        {"--server-dir", "-s"}, "Set the path to the web server files.\n"
                                "Default is the 'server' directory in the same directory as the executable."
    );
    server_dir_option.setRequired(false);
    server_dir_option.addArgument(SCL::Argument("path").default_value("server"));

    SCL::Command root_command("yt-dlp-web");
    root_command.addHelpOption();
    root_command.addOptions({runtime_option, browser_option, webview_option});
    root_command.addOptions({server_dir_option});
    root_command.setHandler([&](SCL::ParseResult const& result) {
        auto& app = ytweb::App::instance();

        if (result.isOptionSet(browser_option))
        {
            app.set_runtime(ytweb::Runtime::AnyBrowser);
        }
        else if (result.isOptionSet(webview_option))
        {
            app.set_runtime(ytweb::Runtime::Webview);
        }
        else
        {
            auto runtime = ytweb::get_runtime(result.valueForOption(runtime_option).toString());
            if (runtime.has_value())
            {
                app.set_runtime(runtime.value());
            }
        }

        try
        {
            auto server_dir = std::filesystem::absolute(result.valueForOption(server_dir_option).toString());
            app.set_server_dir(server_dir);
        }
        catch (ytweb::PathError const& e)
        {
            std::cerr << e.what() << "\n";
            return 1;
        }

        app.init();
        app.run();

        return 0;
    });

    SCL::Parser parser(root_command);
    return parser.invoke(SCL::commandLineArguments());
}
