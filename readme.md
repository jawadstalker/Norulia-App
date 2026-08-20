# NeuroLia App

A modern cross-platform mobile application built with React Native and Expo.

NeuroLia is designed with a modular and scalable architecture, combining Expo Router, TypeScript, Redux Toolkit, React Hook Form, and a collection of React Native libraries to provide a solid foundation for building a production-ready mobile experience.

## Overview

NeuroLia is a React Native application developed with Expo and TypeScript. The project follows a component-oriented architecture and is structured to support maintainability, scalability, and cross-platform development.

The application currently targets:

* Android
* iOS
* Web

The project uses Expo Router for navigation and typed routes, while Redux Toolkit and React Redux provide state-management capabilities.

## Tech Stack

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| React Native            | Cross-platform application development |
| Expo                    | Development and build platform         |
| TypeScript              | Type-safe application development      |
| Expo Router             | File-based navigation                  |
| Redux Toolkit           | Application state management           |
| React Redux             | React bindings for Redux               |
| React Hook Form         | Form state and validation              |
| React Native Reanimated | Animations and transitions             |
| React Navigation        | Navigation infrastructure              |
| React Native Web        | Web support                            |
| AsyncStorage            | Local persistent storage               |
| React Native SVG        | SVG rendering                          |
| Expo Camera             | Camera functionality                   |
| Expo Haptics            | Haptic feedback                        |
| Expo Web Browser        | In-app browser integration             |
| date-fns                | Date manipulation                      |
| Lucide                  | Icon system                            |

## Project Structure

```text
Norulia-App/
├── app/                    # Application routes and screens
├── assets/                 # Static assets and resources
├── components/             # Reusable UI components
├── constants/              # Application constants
├── context/                # React context providers
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── .gitignore
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
├── codemagic.yaml          # CI/CD configuration
├── eas.json                # Expo Application Services configuration
├── index.ts                # Application entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── package-lock.json       # Dependency lock file
```

## Requirements

Before running the project, make sure the following tools are installed:

* Node.js
* npm
* Expo CLI
* Android Studio for Android development
* Xcode for iOS development on macOS

For the best development experience, use a current Node.js LTS release compatible with the installed Expo SDK.

## Installation

Clone the repository:

```bash
git clone https://github.com/jawadstalker/Norulia-App.git
```

Navigate to the project directory:

```bash
cd Norulia-App
```

Install dependencies:

```bash
npm install
```

## Running the Project

Start the Expo development server:

```bash
npm run dev
```

After the development server starts, you can launch the application on a connected device, emulator, simulator, or web environment.

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Starts the Expo development server |
| `npm run android` | Runs the application on Android    |
| `npm run ios`     | Runs the application on iOS        |

## Configuration

The Expo configuration is defined in `app.json`.

The application is currently configured with:

```text
Application Name: NeuroLia
Slug: neurolia
Bundle Identifier: com.neurolia.app
Android Package: com.neurolia.app
```

The project also uses:

* Expo Router
* Typed routes
* Expo Font
* Expo Asset
* Expo Build Properties

Android is configured with SDK 35 and Kotlin 2.0.21.

## Architecture

The project is organized around a modular React Native architecture.

### Routes

Application screens and navigation are managed through the `app/` directory using Expo Router's file-based routing system.

### Components

Reusable interface elements are maintained inside:

```text
components/
```

This keeps UI building blocks separated from route-specific logic and makes components easier to reuse throughout the application.

### State Management

Global application state can be managed using:

```text
Redux Toolkit
React Redux
```

This provides a predictable architecture for shared state and application-level data.

### Hooks

Reusable application logic is organized inside:

```text
hooks/
```

Custom hooks help keep components focused on presentation while allowing shared behavior to be reused across screens.

### Context

Application-level providers and contextual state are organized inside:

```text
context/
```

### Types

Shared TypeScript definitions are stored in:

```text
types/
```

Keeping type definitions centralized helps maintain consistency across the application.

## Development Guidelines

When contributing to the project:

1. Keep components small and reusable.
2. Prefer TypeScript types over untyped JavaScript.
3. Keep business logic separate from presentation components.
4. Reuse existing components and hooks before introducing duplicates.
5. Keep navigation logic inside the Expo Router structure.
6. Avoid unnecessary global state.
7. Keep dependencies focused on actual project requirements.
8. Test changes on the target platforms before opening a pull request.

## Building for Production

The project includes Expo Application Services configuration through:

```text
eas.json
```

and a Codemagic configuration through:

```text
codemagic.yaml
```

Before creating production builds, make sure the required Expo and platform credentials are configured for the target environment.

A typical EAS workflow can be started with:

```bash
npx eas build
```

The exact build profile should be selected according to the project's deployment configuration.

## Environment Variables

If environment-specific configuration is introduced, sensitive credentials should not be committed directly to the repository.

Use environment variables or the appropriate Expo/EAS configuration mechanism instead.

Do not commit:

```text
API keys
Access tokens
Private credentials
Signing credentials
Production secrets
```

## Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application.
5. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

## Commit Convention

The project can follow conventional commit prefixes such as:

```text
feat:     New functionality
fix:      Bug fixes
refactor: Code restructuring
docs:     Documentation changes
style:    Formatting changes
test:     Tests
chore:    Maintenance
```

Example:

```bash
git commit -m "feat: add authentication flow"
```

## Roadmap

Potential future improvements include:

* Expanded test coverage
* Improved error handling
* Enhanced accessibility
* Performance optimization
* Automated CI/CD checks
* Production monitoring
* More comprehensive documentation
* Automated release workflows

The roadmap may evolve as the application develops.

## License

No license file is currently included in the repository.

If this project is intended to be open source, adding a license such as MIT, Apache-2.0, or GPL-3.0 is recommended before accepting external contributions.

## Repository

Source code:

[GitHub Repository](https://github.com/jawadstalker/Norulia-App?utm_source=chatgpt.com)

## Author

Developed and maintained by [jawadstalker](https://github.com/jawadstalker).

---

If you find an issue or have an improvement, feel free to open an issue or submit a pull request.
