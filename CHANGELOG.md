# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased - 2025-2-7

### Added

- Four log levels: debug, info, warning, and error.
- Added timestamp information to the logs.
- Enabled automatic line wrapping for long log entries.
- Used [SysCmdLine](https://github.com/SineStriker/syscmdline) to parse cmdline arguments.
- Enabled specifying runtime environment by cmdline argument "--runtime". Useful aliases "--browser" and "--webview" are provided.
- Enabled specifying web file path by cmdline argument "--server-path".
- Auto create a release when pushing a tag.
  - Linux deb format.
  - Linux tar.gz format.
  - Windows zip format.

### Changed

- Displayed logs in a table format.
  - Enabled sorting logs by time.
  - Enabled filtering logs by level.
- More detailed log messages when users perform actions.
  - Handled exceptions and logged error messages when the frontend sends an invalid request.
  - Added a warning when sending an interrupt request to a non-running task.
- Macro "YT_DLP_WEB_PATH" is removed, replaced by a soft link created on building.

### Fixed

- The task status was incorrectly displayed as interrupted when restarting a failed task.
- Quote in log message lead to decoding error. #27

## 0.3.0 - 2024-1-22

### Added

- Multiple tasks can be run simultaneously.
- A task view is added to show and manage all running tasks.

### Fixed

- Error in preview media info due to memory leak in backend.

### Internal

- Upgrade C++ backend to use C++20.
- Add clang-format and clang-tidy to enforce code style.

## [0.2.0] - 2024-12-29

### Added

- Added extensive options provided by `yt-dlp`.
- Implemented frontend input validation for certain input options.
- UI improvements for better user experience.
  - Header navigation bar.
  - Automatic dark mode and a display mode switch.
  - Make preview and log area a single page view.
  - A '\*' symbol will be displayed when an input is required.
  - Real-time validation for user input.
  - Auto focus on the first invalid input field when submitted.
  - Hover-to-show description text.
  - Dev tools for developers.
- Using floating buttons to interactive.

### Changed

- Remove `data-test` attribute in production environment.

### Internal

- Used `pnpm` as the package manager for the frontend part.
- Introduced `vue-ts` to refactor the frontend.
- Introduced `ESLint` and `Prettier` to enforce code style.
- Introduced `Vitest` for testing the frontend components.
- Introduced `Pinia` for state management in the frontend.
- Introduced `NaiveUI` and `XIcons` as the UI library for the frontend.
- Adjusted the JavaScript API provided by `WebUI` backend and added TypeScript type definition files.

## [0.1.0] - 2024-11-24

### Added

- Initial release of yt-dlp-web.
- Implemented a simple download feature for audio and video files using `yt-dlp`.
- Introduced a basic logging system.
- Added a simple video preview feature to view video info before downloading.
- Allowed users to specify custom download paths for saving files.
- Enabled users to define the path for the `yt-dlp` executable.
- Added the ability to interrupt a currently running task.
- Provided a real-time progress display for ongoing downloads, showing status updates and percentage.
