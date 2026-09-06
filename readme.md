<p align="center">
  <img src="./assets/logo2.png" alt="NeuroLia Logo" width="180"/>
</p>

# NeuroLia

A modern cross-platform cognitive wellness and performance application built with **React Native, Expo, and TypeScript**.

NeuroLia combines cognitive assessment, personalized cognitive training, AI assistance, daily planning, medication management, cultural cognitive activities, entertainment recommendations, and performance tracking into a single modular application.

The project is designed to provide a personalized experience that connects **mind, behavior, routine, and performance** through interactive tools and data-driven experiences.

---

## Overview

NeuroLia is a cross-platform application targeting:

* Android
* iOS
* Web

The application is built around a modular architecture using **Expo Router**, **React Native**, **TypeScript**, reusable components, React Context, local persistence, and a collection of Expo and React Native libraries.

The current application includes:

* Cognitive assessment
* Cognitive training games
* Performance and cognitive metrics
* Personalized protocols
* AI assistant
* Daily schedule
* Medication management
* Cultural cognitive interventions
* Poetry memorization and training
* Consultation
* Movie recommendations
* Bilingual Persian/English interface
* RTL support
* Light, Dark, and Neon Athlete themes
* Local persistent data storage
* Haptic feedback
* Notifications
* Animated user interfaces
* Cross-platform Web support

---

# Core Features

## 1. Cognitive Assessment

NeuroLia includes cognitive assessment experiences designed around multiple cognitive domains.

The application architecture supports assessment and performance tracking across areas such as:

* Attention
* Memory
* Processing Speed
* Motor Accuracy
* Reasoning
* Resilience

The assessment layer is designed to provide structured performance data that can later be used by other parts of the application.

---

## 2. Cognitive Training Games

NeuroLia contains a growing collection of interactive cognitive games.

Current game modules include:

* **Visual Flow**
* **Stroop**
* **Memory Challenge**
* **Size Discrimination**
* **Last Survival**
* **Forest Adventure**
* **Bilingual Sequence**
* **Anologram**
* **Word**
* **Relaxation / Relaxe**

The games are implemented as independent modules under:

```text
app/games/
```

Each game can collect performance information and report results through the application's game-data architecture.

---

## 3. Adaptive Cognitive Training

Several game experiences are designed around difficulty, performance, timing, accuracy, and repeated trials.

The architecture allows games to adapt their challenge according to user performance.

This makes it possible to build personalized cognitive training rather than providing only static mini-games.

---

## 4. Game Results & Performance Tracking

Game sessions can produce structured results containing information such as:

* Game ID
* Game name
* Timestamp
* Score
* Metrics
* Performance measurements

The application contains a centralized game-data layer:

```text
context/GameDataContext.tsx
```

and game-result utilities under:

```text
app/games/gameResults.ts
```

This provides a foundation for analyzing performance over time.

---

## 5. Cognitive Profile

Game performance can be mapped to broader cognitive dimensions.

The application architecture supports performance dimensions including:

```text
processing_speed
attention
memory
motor_accuracy
resilience
reasoning
```

This allows individual game results to contribute to a broader picture of cognitive performance.

The long-term goal is to transform isolated game scores into meaningful longitudinal performance information.

---

# AI Assistant

NeuroLia includes an integrated AI Assistant designed to provide an interactive conversational experience.

The assistant supports:

* Conversational interaction
* Bilingual communication
* Persian language support
* English language support
* Conversation state
* Typing animations
* Loading states
* Error handling
* Request cancellation
* Context-aware interaction

The assistant interface is implemented within:

```text
app/(tabs)/assistant.tsx
```

The application can send the selected language together with assistant requests so that responses can follow the user's language preference.

---

# Smart Personal Protocol

NeuroLia includes a personalized protocol system designed to organize cognitive and wellness activities into a structured routine.

The protocol experience can combine different activities and interventions into a personalized plan.

The protocol system is implemented in:

```text
app/(tabs)/protocol.tsx
```

The protocol layer is intended to connect:

* Cognitive training
* Daily activities
* Performance goals
* Personalized routines
* User progress

---

# Schedule & Daily Planning

NeuroLia includes a dedicated schedule experience for organizing daily activities.

The schedule supports:

* Daily planning
* Scheduled activities
* Date-based navigation
* Persian calendar presentation
* Persian weekday/month formatting
* RTL-aware presentation
* Animated interactions

The schedule implementation is located at:

```text
app/(tabs)/schedule.tsx
```

---

# Medication Management

NeuroLia includes a medication management system.

Users can manage medication-related information through dedicated screens.

Current functionality includes:

* Medication list
* Add medication
* Medication history
* Medication tracking
* Persistent local storage
* Date-based medication records
* Persian date presentation

Relevant files include:

```text
app/(tabs)/medication.tsx
app/(tabs)/MedicationContext.tsx
app/medication/add.tsx
app/medication/history.tsx
```

The medication architecture is designed so that medication information can remain available across application sessions.

---

# Cultural Cognitive Interventions

NeuroLia includes a cultural intervention section designed to incorporate culturally relevant cognitive activities.

The current application contains a dedicated cultural experience:

```text
app/(tabs)/cultural.tsx
```

This module provides a foundation for connecting cognitive wellness with culturally relevant content and activities.

---

# Poetry & Memorization

The application includes a dedicated poetry memorization/training experience.

The poetry section is accessible through:

```text
app/poems.tsx
```

The feature is designed around:

* Memorization
* Recall
* Training exercises
* Progress tracking
* Local persistence
* Persian content

This module can be extended to support additional poetry and memory-training datasets.

---

# Bilingual Support

NeuroLia supports both:

* English
* Persian

The application contains a language context and translation infrastructure.

The language system supports:

* Language selection
* Persian/English UI
* RTL layout handling
* Localized content
* Localized dates
* Localized weekdays
* Localized month names
* Persian digit formatting

The language architecture is centered around:

```text
context/LanguageContext.tsx
constants/
```

The interface is designed so that language-dependent content can change according to the user's selected language.

---

# RTL Support

Persian users receive a right-to-left interface where appropriate.

RTL support is considered throughout the application, including:

* Text alignment
* Navigation
* Cards
* Schedule
* Forms
* Dates
* Content positioning
* Persian typography

The application can therefore operate as both an English LTR and Persian RTL experience.

---

# Theme System

NeuroLia currently supports three visual themes:

### Light

A standard light interface for everyday use.

### Dark

A dark interface designed for lower-light environments.

### Neon Athlete

A performance-oriented visual theme designed around a darker athletic aesthetic.

The theme system is implemented through:

```text
context/ThemeContext.tsx
constants/theme
```

Themes are persisted locally using AsyncStorage so the selected theme can survive application restarts.

The current theme state supports:

```text
light
dark
athlete
```

---

# Personalization

The application architecture is designed around personalized experiences rather than a single static interface.

Personalization can influence:

* Language
* RTL/LTR presentation
* Visual theme
* Cognitive activities
* Training routines
* Schedule
* Medication information
* Performance history
* AI interaction
* Recommendations

This provides the foundation for a continuously evolving user experience.

---

# Movie Recommendation System

NeuroLia includes a movie recommendation integration designed to connect entertainment with the user's broader application experience.

The client-side recommendation service is implemented in:

```text
services/movieRecommendation.ts
```

The service communicates with a recommendation backend and receives structured movie recommendations.

The recommendation system is designed to use user/game-related information as part of the recommendation request.

The current architecture therefore supports a future connection between:

```text
Cognitive / performance data
        ↓
Recommendation service
        ↓
Personalized movie suggestions
```

The movie recommendation feature is an extensible service and can be replaced or expanded without restructuring the rest of the application.

---

# Consultation

NeuroLia includes a consultation experience:

```text
app/consultation.tsx
```

This provides a dedicated area for future and current consultation-related functionality within the application.

---

# Game Exit Protection

The application contains a game-exit protection layer designed to prevent accidental navigation away from an active game.

A dedicated game exit guard is integrated into the application architecture.

This helps protect:

* Active game sessions
* User progress
* Current game state
* Accidental back/navigation actions

The system is implemented through the application's game-exit guard context.

---

# Local Persistence

NeuroLia uses AsyncStorage for local persistence.

Local storage is used for application information such as:

* Theme preference
* Language-related state
* Game progress
* Game results
* Medication information
* Poetry progress
* User preferences
* Other persistent application state

The local persistence layer allows important user settings and progress to survive application restarts.

---

# User Interface & Animation

The application uses a modern animated interface with reusable components and transitions.

The UI stack includes:

* React Native Reanimated
* Moti
* Expo Linear Gradient
* Expo Blur
* React Native SVG
* Lucide icons
* Expo Haptics
* Safe Area Context

Animations are used throughout the application for:

* Screen transitions
* Cards
* Buttons
* Game interactions
* Loading states
* Assistant typing
* Feedback
* Navigation elements

---

# Notifications

NeuroLia includes Expo Notifications support.

Notifications can be used for features such as:

* Scheduled reminders
* Medication reminders
* Daily activities
* Routine notifications
* Future personalized interventions

Notification functionality is based on:

```text
expo-notifications
```

---

# Persian Typography

The project includes Persian font resources to support Persian-language presentation.

A Persian font file is included in the repository:

```text
XB Niloofar.ttf
```

The application can therefore provide dedicated Persian typography rather than relying exclusively on system fonts.

---

# Technology Stack

| Technology              | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| React Native            | Cross-platform mobile development          |
| Expo                    | Application development and build platform |
| TypeScript              | Type-safe development                      |
| Expo Router             | File-based navigation                      |
| Redux Toolkit           | State management                           |
| React Redux             | Redux integration                          |
| React Hook Form         | Forms and validation                       |
| React Native Reanimated | Animations                                 |
| Moti                    | Declarative animations                     |
| React Native Web        | Web support                                |
| AsyncStorage            | Local persistence                          |
| Expo Camera             | Camera functionality                       |
| Expo Notifications      | Notifications                              |
| Expo Haptics            | Haptic feedback                            |
| Expo Linear Gradient    | Gradients                                  |
| Expo Blur               | Blur effects                               |
| Expo Image              | Image handling                             |
| Expo File System        | File operations                            |
| Expo Sharing            | Content sharing                            |
| Expo Clipboard          | Clipboard functionality                    |
| Expo Web Browser        | Browser integration                        |
| React Native WebView    | Web content                                |
| React Native SVG        | SVG rendering                              |
| React Native Calendars  | Calendar UI                                |
| Lucide React Native     | Icons                                      |
| date-fns                | Date utilities                             |

---

# Project Structure

```text
Norulia-App/
│
├── app/
│   ├── (tabs)/
│   │   ├── assistant.tsx
│   │   ├── cultural.tsx
│   │   ├── medication.tsx
│   │   ├── profile.tsx
│   │   ├── protocol.tsx
│   │   ├── psycho.tsx
│   │   ├── schedule.tsx
│   │   └── ...
│   │
│   ├── games/
│   │   ├── AnologramGame.tsx
│   │   ├── BilingualSequence.tsx
│   │   ├── Relaxe.tsx
│   │   ├── Word.tsx
│   │   ├── forest-adventure.tsx
│   │   ├── last-survival.tsx
│   │   ├── memory-challenge.tsx
│   │   ├── size-discrimination.tsx
│   │   ├── stroop.tsx
│   │   ├── visual-flow.tsx
│   │   ├── results.tsx
│   │   └── ...
│   │
│   ├── medication/
│   │   ├── add.tsx
│   │   └── history.tsx
│   │
│   ├── bilingual-games.tsx
│   ├── consultation.tsx
│   ├── poems.tsx
│   └── ...
│
├── assets/
│
├── components/
│
├── constants/
│   ├── theme
│   └── ...
│
├── context/
│   ├── ThemeContext.tsx
│   ├── LanguageContext.tsx
│   ├── GameDataContext.tsx
│   └── ...
│
├── hooks/
│
├── services/
│   └── movieRecommendation.ts
│
├── types/
│
├── app.json
├── babel.config.js
├── codemagic.yaml
├── eas.json
├── index.ts
├── package.json
├── tsconfig.json
└── package-lock.json
```

---

# Requirements

Before running NeuroLia, install:

* Node.js
* npm
* Expo tooling
* Android Studio for Android development
* Xcode for iOS development on macOS

For Android development, make sure the Android SDK and required build tools are correctly configured.

For iOS development, a macOS environment with Xcode is required.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/jawadstalker/Norulia-App.git
```

Enter the project directory:

```bash
cd Norulia-App
```

Switch to the development branch:

```bash
git checkout new
```

Install dependencies:

```bash
npm install
```

---

# Running the Application

Start the Expo development server:

```bash
npm start
```

## Android

```bash
npm run android
```

## iOS

```bash
npm run ios
```

## Web

```bash
npm run web
```

---

# Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm start`       | Starts the Expo development server |
| `npm run android` | Runs the Android application       |
| `npm run ios`     | Runs the iOS application           |
| `npm run web`     | Starts the Web version             |

These commands reflect the current scripts defined in `package.json`.

---

# Expo Configuration

The project uses:

```text
Expo SDK 53
React Native 0.79
React 19
TypeScript 5.8
Expo Router 5
```

The Expo configuration is maintained in:

```text
app.json
```

The project also includes:

```text
eas.json
codemagic.yaml
```

for build and deployment workflows.

---

# Production Builds

The project supports Expo Application Services and Codemagic-based build workflows.

A typical EAS build can be started with:

```bash
npx eas build
```

Build profiles should be selected according to the project's EAS configuration.

Codemagic configuration is available through:

```text
codemagic.yaml
```

Before production deployment, make sure that:

* Android credentials are configured
* iOS credentials are configured where required
* Environment variables are configured
* API services are available
* Production endpoints are used
* Application identifiers are correctly configured

---

# Backend Services

Some NeuroLia functionality depends on external services.

Examples include:

* AI Assistant backend
* Movie Recommendation API

These services should be configured separately from the mobile application.

Production API credentials and private keys must never be committed to the repository.

---

# Environment & Security

Never commit sensitive credentials such as:

```text
API keys
Access tokens
Private keys
Signing credentials
Authentication secrets
Production secrets
```

Use environment variables and appropriate Expo/EAS or CI/CD secret-management mechanisms.

---

# Architecture

NeuroLia follows a modular application architecture.

### Routes

Application routes are organized through:

```text
app/
```

using Expo Router.

### Components

Reusable UI elements are organized in:

```text
components/
```

### Context

Application-wide state and providers are organized in:

```text
context/
```

Examples include:

* Theme
* Language
* Game data
* Authentication
* Assessment
* Game exit protection

### Services

External integrations are isolated in:

```text
services/
```

This allows APIs and external services to evolve independently from UI components.

### Hooks

Reusable application logic is maintained in:

```text
hooks/
```

### Types

Shared TypeScript definitions are maintained in:

```text
types/
```

---

# Data Flow

A simplified application data flow is:

```text
User
  │
  ├── Language / Theme
  │
  ├── Assessment
  │
  ├── Cognitive Games
  │       │
  │       └── Game Results
  │
  ├── Daily Schedule
  │
  ├── Medication
  │
  ├── Cultural Activities
  │
  └── AI Assistant
          │
          ▼
   Personalized Experience
```

Game results can also feed broader performance analysis and recommendation systems.

---

# Design Philosophy

NeuroLia is built around several principles:

### Personalization

The experience should adapt to the individual user.

### Modularity

Features should remain independently maintainable.

### Cross-platform Design

The same application architecture should support Android, iOS, and Web.

### Cognitive Engagement

Activities should encourage interaction with different cognitive abilities.

### Longitudinal Tracking

Performance should be viewed over time rather than as isolated sessions.

### Cultural Awareness

The application should support culturally relevant experiences, particularly for Persian-speaking users.

### Accessibility & Usability

The interface should remain understandable and usable across different languages, themes, and device sizes.

---

# Development Guidelines

When modifying the project:

1. Keep components reusable.
2. Prefer TypeScript.
3. Keep business logic separate from presentation.
4. Reuse existing contexts and hooks.
5. Avoid duplicating existing functionality.
6. Keep route-specific logic inside `app/`.
7. Keep external APIs inside `services/`.
8. Preserve Persian RTL support.
9. Test both Light and Dark themes.
10. Test Neon Athlete theme when modifying shared UI.
11. Test both English and Persian interfaces.
12. Test Android and Web when modifying cross-platform components.
13. Avoid committing secrets.
14. Test game navigation and exit behavior when modifying games.

---

# Roadmap

Potential future development includes:

* Expanded cognitive assessments
* More adaptive cognitive games
* Advanced cognitive profile visualization
* Longitudinal performance analytics
* Improved personalized protocols
* More AI-powered personalization
* Enhanced movie recommendations
* More cultural cognitive interventions
* Expanded Persian content
* Improved accessibility
* Advanced notification and reminder systems
* Cloud synchronization
* User accounts and secure remote persistence
* Improved offline support
* Automated testing
* CI/CD improvements
* Production monitoring
* Analytics and performance monitoring
* More comprehensive documentation

---

# Project Status

NeuroLia is an actively developed project.

The `new` branch contains the current development architecture and includes substantially more functionality than the original project foundation.

Features and APIs may continue to change as development progresses.

---

# License

No license file is currently included in the repository.

If NeuroLia is intended to be distributed as an open-source project, an appropriate license should be added before accepting external contributions.

Possible choices include:

* MIT
* Apache-2.0
* GPL-3.0

The final license should be selected according to the project's intended distribution and ownership requirements.

---

# Repository

Source code:

https://github.com/jawadstalker/Norulia-App

Development branch:

https://github.com/jawadstalker/Norulia-App/tree/new

---

# Author

Developed and maintained by:

**jawadstalker**

---

## NeuroLia

**Mind, beautifully calibrated.**
