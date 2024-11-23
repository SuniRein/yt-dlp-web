#include <filesystem>
#include <iostream>

#include "webui.hpp"

#include "handle.h"

namespace fs = std::filesystem;

fs::path const INDEX_PATH = YT_DLP_WEB_PATH;

int main(int argc, char* argv[])
{
    // Check if the index.html file exists.
    if (!fs::exists(INDEX_PATH) || !fs::is_directory(INDEX_PATH))
    {
        std::cerr << "Path not exist: " << INDEX_PATH << std::endl;
        return 1;
    }
    if (!fs::exists(INDEX_PATH / "index.html") || !fs::is_regular_file(INDEX_PATH / "index.html"))
    {
        std::cerr << "index.html not exist in: " << INDEX_PATH << std::endl;
        return 1;
    }

    webui::window win;
    win.set_root_folder(INDEX_PATH.string());
    win.show_browser("index.html", AnyBrowser);
    win.bind("submit_url", ytweb::handle_submit_url);
    webui::wait();
}
