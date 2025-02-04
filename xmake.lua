set_project("yt-dlp-web")

set_languages("c++20")

add_rules("mode.debug", "mode.release")

add_requires("webui nightly")
add_requires("nlohmann_json") -- json parser

add_requires("boost", { configs = { cmake = false, process = true } }) -- boost.process, boost.asio
add_defines("BOOST_ASIO_NO_DEPRECATED") -- disable deprecated asio features

target("main", function()
    set_kind("binary")
    add_files("src/*.cpp")
    add_defines('YT_DLP_WEB_PATH="$(projectdir)/web/dist"')
    add_packages("webui", "nlohmann_json", "boost")
end)

option("enable_test", function()
    set_default(false)
end)

if has_config("enable_test") then
    add_requires("gtest[main]")

    target("test", function()
        set_default(false)
        set_kind("binary")

        add_files("src/*.cpp|main.cpp|app.cpp") -- exclude main.cpp
        add_includedirs("src")

        add_files("test/*.cpp")

        add_packages("webui", "nlohmann_json", "boost")
        add_packages("gtest")

        -- fake yt-dlp executable for testing
        -- python is required
        add_defines('YT_DLP_WEB_FAKE_BIN="$(projectdir)/test/yt-dlp-test.py"')
    end)
end
