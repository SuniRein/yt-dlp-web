# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-12-12

### Added

- Added extensive options provided by `yt-dlp`.
- Implemented frontend input validation for certain input options.

### Internal

- Used `pnpm` as the package manager for the frontend part.
- Introduced `vue-ts` to refactor the frontend.
- Introduced `ESLint` and `Prettier` to enforce code style.
- Introduced `Vitest` for testing the frontend components.
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

