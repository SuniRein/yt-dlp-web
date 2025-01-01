#include "app.h"

int main(int argc, char* argv[])
{
    auto& app = ytweb::App::instance();
    app.init();
    app.run();
}
