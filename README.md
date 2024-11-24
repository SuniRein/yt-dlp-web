# yt-dlp-web

A simple web-based front-end for [yt-dlp](https://github.com/yt-dlp/yt-dlp),
designed to make video downloading more accessible through a simple and user-friendly interface.

## 🚀 Features

- **User-Friendly Interface**: Intuitive web UI for managing downloads.
- **Rich Options**: Full support for yt-dlp's extensive list of options.
- **Log Viewer**: Detailed logging of download progress and errors.
- **Real-Time Progress Tracking**: Monitor download progress directly in the browser.
- **Cross-Platform**: Compatible with major operating systems (Linux, macOS, Windows).

## 🔧 Dependencies

This project relies on the following libraries:

- ![Boost logo](https://img.shields.io/badge/Boost-Asio-blue?logo=boost)  
  [**Boost.Asio**](https://www.boost.org/doc/libs/1_86_0/doc/html/boost_asio.html) -
  A cross-platform C++ library for network and low-level I/O programming.

- ![Boost logo](https://img.shields.io/badge/Boost-Process-blue?logo=boost)  
  [**Boost.Process**](https://www.boost.org/doc/libs/1_86_0/doc/html/process.html) -
  A C++ library that provides facilities for launching and managing processes.

- ![WebUI logo](https://img.shields.io/badge/WebUI-v2.5.2-green?logo=web?logo=cplusplus)  
  [**WebUI**](https://webui.me/) - A framework for building web-based user interfaces.

- ![nlohmann/json logo](https://img.shields.io/badge/nlohmann%2Fjson-v3.11.3-blue?logo=cplusplus)  
  [**nlohmann/json**](https://github.com/nlohmann/json) - A modern JSON library for C++ with an easy-to-use API.  

- ![Google Test logo](https://img.shields.io/badge/Google%20Test-v1.15.2-lightgray?logo=google)  
  [**gtest**](https://github.com/google/googletest) (Optional) -
  Google Test is a C++ testing framework. *(Optional dependency for running unit tests.)*

## 📦 Installation & Usage

### Prerequisites

- [Python 3.7+](https://www.python.org/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [xmake](https://xmake.io/)

### Steps

1. Clone the repository:
```sh
git clone https://github.com/SuniRein/yt-dlp-web.git
cd yt-dlp-web
```

2. Build the project:
```sh
xmake build
```

3. Start the server:
```sh
xmake run
```

After doing so, a web page should open in your default browser.

## 📝 License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
See the LICENSE file for details.

