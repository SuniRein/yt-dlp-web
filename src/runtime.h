#pragma once

#include <cstdint>
#include <initializer_list>
#include <optional>
#include <string_view>
#include <unordered_map>

namespace ytweb
{

enum class Runtime : std::uint8_t
{
    NoBrowser,
    AnyBrowser,
    Chrome,
    Firefox,
    Edge,
    Safari,
    Chromium,
    Opera,
    Brave,
    Vivaldi,
    Epic,
    Yandex,
    ChromiumBased,
    Webview,
};

inline std::optional<Runtime> get_runtime(std::string_view str)
{
    using enum Runtime;

    std::unordered_map<std::string_view, Runtime> map{
        {"no", NoBrowser},           {"browser", AnyBrowser}, {"chrome", Chrome},
        {"firefox", Firefox},        {"edge", Edge},          {"safari", Safari},
        {"chromium", Chromium},      {"opera", Opera},        {"brave", Brave},
        {"vivaldi", Vivaldi},        {"epic", Epic},          {"yandex", Yandex},
        {"chromium", ChromiumBased}, {"webview", Webview},
    };

    if (auto it = map.find(str); it != map.end())
    {
        return std::make_optional(it->second);
    }
    return std::nullopt;
}

} // namespace ytweb
