# 🏗️ React Native Architecture Generator

[![npm](https://img.shields.io/npm/v/react-native-architecture-generator)](https://www.npmjs.com/package/react-native-architecture-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, production-ready CLI tool to instantly scaffold professional React Native applications with **4 architecture patterns**, **3 state management** options, and full auto-wiring.

Stop wasting hours on boilerplate. Generate a complete, scalable project architecture in seconds — with state management, networking, routing, theming, and tests all wired up and ready to go.

## ✨ Why This Tool?

| Feature | |
|---------|---|
| 🚀 **Zero to Production** | Generates a complete architecture with Networking, Routing, State Management, and Theming in seconds |
| 🏛️ **4 Architecture Patterns** | Clean Architecture, Feature-Based, Atomic Design, or MVVM — choose what fits your team |
| 🧠 **Context-Aware** | Remembers your project config so subsequent commands "just work" |
| ⚡ **Auto-Wiring** | New features auto-register in your navigation and router — no manual wiring |
| 🎨 **Premium Auth UI** | Includes polished Login & Register screens out of the box |
| 📦 **Latest Packages** | All dependencies pinned to the most recent stable versions |
| 🧪 **Test Ready** | Generates architecture-specific tests for every feature |

## 🏛️ Architecture Patterns

### 1️⃣ Clean Architecture (Domain → Data → Presentation)

The gold standard for large-scale enterprise apps. Strict separation of concerns with explicit layers.

```
features/auth/
├── data/
│   ├── datasources/AuthRemoteDataSource.ts
│   ├── models/AuthModel.ts
│   └── repositories/AuthRepositoryImpl.ts
├── domain/
│   ├── entities/authEntity.ts
│   ├── repositories/AuthRepository.ts
│   └── usecases/GetAuthUseCase.ts
└── presentation/
    ├── redux/authSlice.ts       # (or zustand/ or context/)
    ├── screens/LoginScreen.tsx
    └── components/
```

**Best for:** Enterprise apps, large teams, complex business logic

---

### 2️⃣ Feature-Based Architecture (Lightweight)

A flat, pragmatic structure that keeps things simple — services, hooks, screens, and types per feature.

```
features/auth/
├── components/
├── hooks/useAuth.ts
├── screens/LoginScreen.tsx
├── services/auth.service.ts
├── types/auth.types.ts
├── utils/
└── index.ts                    # Barrel export
```

**Best for:** Startups, MVPs, small-to-medium apps, rapid prototyping

---

### 3️⃣ Atomic Design + Feature

Brad Frost's Atomic Design methodology applied to React Native. Build UIs from atoms up.

```
features/auth/
├── atoms/AuthButton.tsx         # Smallest UI elements
├── molecules/AuthFormField.tsx  # Combinations of atoms
├── organisms/AuthCard.tsx       # Complex, self-contained sections
├── templates/AuthLayout.tsx     # Page-level layouts
├── screens/LoginScreen.tsx
├── hooks/useAuth.ts
├── services/auth.service.ts
└── types/auth.types.ts
```

**Best for:** Design system-driven teams, component libraries, highly reusable UI

---

### 4️⃣ MVVM with Hooks (Model → ViewModel → View)

The classic MVVM pattern implemented with React hooks as ViewModels.

```
features/auth/
├── models/AuthModel.ts           # Data structures
├── viewmodels/useAuthViewModel.ts # Business logic (custom hooks)
├── views/
│   ├── screens/LoginScreen.tsx    # Full-page views
│   └── components/AuthListItem.tsx
└── services/AuthService.ts       # API layer
```

**Best for:** Teams from Android/iOS/WPF background, clear separation of UI and logic

---

## 🎯 Supported Features

### State Management

| Option | Generated Code |
|--------|----------------|
| **Redux Toolkit** | Redux slice with async thunk, typed hooks |
| **Zustand** | Zustand store with async actions |
| **Context API** | React Context + useReducer pattern |

### Routing

| Option | Generated Code |
|--------|----------------|
| **React Navigation** | Stack Navigator with typed params, auto-registration |
| **Expo Router** | File-based routing placeholder |

### Additional Features

| Feature | Details |
|---------|---------|
| **Axios HTTP Client** | Pre-configured with timeout, interceptors |
| **TypeScript Models** | Model classes with `fromJson` / `toJson` serialization |
| **Environment Config** | `.env.development` and `.env.production` with `react-native-config` |
| **Firebase** | `@react-native-firebase/app` initialization |
| **Localization (i18n)** | `i18next` + `react-i18next` with locale JSON files |
| **Light/Dark Theming** | Theme context with system auto-detection |
| **Error Handling** | Failure classes: `ServerFailure`, `CacheFailure`, `NetworkFailure` |
| **Unit Tests** | Architecture-specific tests generated per feature |

## 📦 Package Versions (Latest)

| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.7.2 | HTTP networking |
| @reduxjs/toolkit | ^2.2.1 | Redux state management |
| zustand | ^4.5.2 | Zustand state management |
| @react-navigation/native | ^6.1.14 | Navigation |
| @react-navigation/native-stack | ^6.9.22 | Stack navigation |
| react-native-config | ^1.5.1 | Environment variables |
| i18next | ^23.10.1 | Internationalization |
| react-i18next | ^14.1.0 | React i18n integration |
| @react-native-firebase/app | ^19.0.1 | Firebase initialization |
| jest | ^29.7.0 | Testing |
| @testing-library/react-native | ^12.4.3 | React Native testing utils |

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g react-native-architecture-generator
```

This adds the `rn-arch-gen` command to your PATH.

### Verify Installation

```bash
rn-arch-gen --help
```

## ⚡ Quick Start

### 1. Create a React Native project

```bash
npx react-native init my_awesome_app
cd my_awesome_app
```

### 2. Initialize the architecture

```bash
rn-arch-gen init
```

You'll be prompted to choose:

```
? Select architecture pattern: (Use arrow keys)
❯ 🏛️  Clean Architecture (Domain → Data → Presentation)
  📦 Feature-Based (Lightweight, flat structure)
  ⚛️  Atomic Design + Feature (Atoms → Molecules → Organisms)
  🧩 MVVM with Hooks (Model → ViewModel → View)

? Select state management:
❯ redux
  zustand
  context

? Select routing:
❯ reactNavigation
  expoRouter

? Enable localization (i18next)? (Y/n)
? Enable Firebase? (y/N)
? Enable tests? (Y/n)
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run your app

```bash
npx react-native run-android
# or
npx react-native run-ios
```

That's it! You now have a complete architecture with state management, routing, theming, networking, and an example auth feature — all production-ready.

## 📖 Commands Reference

### `rn-arch-gen init`

Initializes the complete project architecture with interactive prompts.

**What it generates:**
- Directory structure based on chosen architecture
- `App.tsx` with initialization pipeline & theming
- `apiClient.ts` with Axios configuration
- `AppTheme.ts` with light/dark theme
- `AppNavigator.tsx` with React Navigation config
- `store.ts` with state management setup
- `failures.ts` with error hierarchy
- `.env.development` / `.env.production` environment files
- `.gitignore` with security exclusions
- Example auth feature with Login & Register screens
- Localization files (if enabled)
- Test scaffolding (if enabled)

### `rn-arch-gen feature <name>`

Generates a complete feature module following your chosen architecture.

```bash
# Basic usage
rn-arch-gen feature products

# PascalCase input is auto-normalized
rn-arch-gen feature UserProfile  # → features/user_profile/
```

**Generated structure varies by architecture:**

| Architecture | Generated Layers |
|-------------|-----------------|
| Clean Architecture | `data/` `domain/` `presentation/` + state management |
| Feature-Based | `services/` `hooks/` `screens/` `types/` + barrel export |
| Atomic Design | `atoms/` `molecules/` `organisms/` `templates/` `screens/` |
| MVVM | `models/` `viewmodels/` `views/` `services/` |

**Auto-wiring (all architectures):**
- ✅ Adds screen + import to `AppNavigator.tsx`
- ✅ Adds route type to `RootStackParamList`
- ✅ Generates architecture-specific tests

### `rn-arch-gen model <name> [-f feature]`

Generates a TypeScript model with JSON serialization.

```bash
# Inside a feature
rn-arch-gen model Product -f shop

# Standalone (in src/core/models/)
rn-arch-gen model AppUser
```

### `rn-arch-gen screen <name> [-f feature]`

Generates a new screen with optional navigation auto-registration.

```bash
# Inside a feature
rn-arch-gen screen Settings -f settings

# Standalone screen
rn-arch-gen screen About
```

**Screen path adapts to architecture:**
- Clean Architecture → `presentation/screens/`
- Feature-Based / Atomic → `screens/`
- MVVM → `views/screens/`

## 📂 Generated Structure (Common Base)

```
src/
├── App.tsx                            # App entry point
├── core/
│   ├── api/apiClient.ts               # Axios HTTP client
│   ├── constants/AppConstants.ts      # Global constants
│   ├── components/                    # Shared components
│   ├── errors/failures.ts            # Error hierarchy
│   ├── theme/
│   │   ├── AppTheme.ts                # Colors, Spacing, FontSizes
│   │   └── ThemeContext.tsx            # Light/Dark theme provider
│   └── utils/
├── features/                          # Architecture-specific feature modules
├── navigation/AppNavigator.tsx        # Auto-updated navigation
├── state/store.ts                     # State management setup
├── i18n/                              # (if localization enabled)
├── .env.development
├── .env.production
├── .gitignore
└── .rn_arch_gen.json                  # Persisted project config

__tests__/
├── features/                          # Architecture-specific tests
└── unit/sample.test.ts
```

## 💾 Configuration Persistence

After running `init`, your choices are saved in `.rn_arch_gen.json`:

```json
{
  "architecture": "cleanArchitecture",
  "stateManagement": "redux",
  "routing": "reactNavigation",
  "localization": true,
  "firebase": false,
  "tests": true
}
```

All subsequent commands (`feature`, `model`, `screen`) automatically read this config — no need to pass flags every time.

## 🔧 Post-Generation Steps

```bash
# 1. Install all dependencies
npm install

# 2. Configure your API base URL
# Edit .env.development and .env.production with your actual endpoints

# 3. Run your app
npx react-native run-android
# or
npx react-native run-ios
```

## ❓ FAQ

**Q: Can I use this on an existing project?**
A: Yes! Run `rn-arch-gen init` in your existing React Native project root. It will add files alongside your existing code.

**Q: Does it modify my existing `package.json`?**
A: Yes, it adds the required dependencies. Existing dependencies are not overwritten — only new ones are added.

**Q: Can I switch architectures later?**
A: You can re-run `rn-arch-gen init` with a different architecture. Existing files won't be deleted — only new ones are created.

**Q: Does it work on Windows?**
A: Yes! All path handling uses cross-platform `path.join` to ensure correct behavior on Windows, macOS, and Linux.

**Q: What naming convention is used?**
A: Files use PascalCase for component files and snake_case for directories. Input like `UserProfile` or `user_profile` both work correctly.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for the React Native community
