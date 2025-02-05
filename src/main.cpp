#include "app.h"
#include "syscmdline/parser.h"
#include "syscmdline/system.h"

int main()
{
    SysCmdLine::Command root_command("yt-dlp-web");
    root_command.addHelpOption();
    root_command.setHandler([](SysCmdLine::ParseResult const& result) {
        auto& app = ytweb::App::instance();
        app.init();
        app.run();

        return 0;
    });

    SysCmdLine::Parser parser(root_command);
    return parser.invoke(SysCmdLine::commandLineArguments());
}
