set_project("yt-dlp-web")
set_version("0.0.1")

add_rules("mode.debug", "mode.release")

add_requires("webui")
add_requires("nlohmann_json") -- json parser

target("main", function(target)
	set_kind("binary")
	add_files("src/*.cpp")
	add_defines('YT_DLP_WEB_PATH="$(projectdir)/web"')
	add_packages("webui")
	add_packages("nlohmann_json")
end)
