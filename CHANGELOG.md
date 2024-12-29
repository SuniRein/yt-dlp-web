# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
