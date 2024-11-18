#include <filesystem>
#include <iostream>

#include "nlohmann/json.hpp"
#include "webui.hpp"

namespace fs = std::filesystem;

fs::path const INDEX_PATH = YT_DLP_WEB_PATH;

using Json = nlohmann::json;

// Process submitted URL
void handle_submit_url(webui::window::event* event)
{
    auto json = event->get_string_view();
    auto data = Json::parse(json);

    std::string action      = data["action"];
    std::string url_input   = data["url_input"];
    bool        audio_only  = data["audio_only"];
    std::string quality     = data["quality"];
    std::string output_path = data["output_path"];

    std::clog << "== Accept request ==\n"
              << "action: " << action << "\n"
              << "url_input: " << url_input << "\n"
              << "audio_only: " << audio_only << "\n"
              << "quality: " << quality << "\n"
              << "output_path: " << output_path << "\n";
}

int main(int argc, char* argv[])
{
    // Check if the index.html file exists
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
    win.show("index.html");
    win.bind("submit_url", handle_submit_url);
    webui::wait();
}
