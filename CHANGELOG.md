# Changelog

## 1.1.0

- **New: 4 Architecture Patterns**
  - Added support for multiple project structures: Clean Architecture, Feature-Based, Atomic Design, and MVVM.
  - Architecture choice is prompted during `init` and respected by all other commands.
- **Updated: Architecture-Aware Commands**
  - `feature`: Generates directory structures and files specific to the selected architecture.
  - `screen`: Resolves correct screen paths (e.g., `presentation/screens` vs `views/screens`).
  - `model`: Generates models in the appropriate format (Classes for Clean Arch, factory functions for MVVM, Interfaces for Feature-Based).
- **Improved: Latest Dependency Versions**
  - Updated all injected dependencies to 2025/2026 latest versions.
  - Upgraded to React Navigation v7+, Redux Toolkit v2.11+, and Zustand v5+.
  - Upgraded CLI dependencies (Chalk 5, Inquirer 13, Ora 9).
- **Added: Public API**
  - `lib/index.ts` now exports all core helpers and types for programmatic usage.

## 1.0.0

- Initial release
- Scaffold complete React Native Clean Architecture
- State Management: Redux Toolkit, Zustand, Context API
- Routing: React Navigation, Expo Router
- Material-style Light/Dark theming
- Axios HTTP client with interceptors
- Failures/Error management
- Firebase & i18next support
