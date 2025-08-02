# Archie: Technical README

This document provides a technical overview of the Archie application, a personal digital vault built with React, TypeScript, and Firebase. It is intended for developers contributing to the project.

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/your-username/archie/ci.yml?branch=main&style=for-the-badge)](https://github.com/your-username/archie/actions)
[![License](https://img.shields.io/github/license/your-username/archie?style=for-the-badge)](./LICENSE.md)

## 1. Core Architecture

The application follows a layered architecture to ensure a clean separation of concerns, making the codebase scalable and maintainable. The source code (`/src`) is divided into four primary layers:

1.  **Domain (`/src/domain`)**: This is the core of the application. It contains the business logic and entity definitions, completely independent of any framework or external service.
    -   `Item.ts`: Defines the `ItemData` interface and encapsulates the core business logic for CRUD operations on items via the `Item` object.
    -   `User.tsx`: Defines the `UserData` interface and handles user profile management.

2.  **Application (`/src/application`)**: This layer contains application-specific logic, including state management and services.
    -   `state/itemStore.ts`: Implements a centralized [Zustand](https://github.com/pmndrs/zustand) store for managing the global state of items, including fetching logic, loading states, and errors. This is the single source of truth for item data in the UI.
    -   `services/logger.ts`: A lightweight, structured logger using `pino` for client-side logging, with child loggers for different application contexts (UI, DB, AI).

3.  **Infrastructure (`/src/infrastructure`)**: This layer handles all communication with external services.
    -   `integrations/firebase.ts`: Initializes and exports all Firebase services (Auth, Firestore, Storage, Cloud Functions) for use throughout the application.
    -   `integrations/Core.ts`: Provides abstracted functions (`UploadFile`, `InvokeLLM`) for interacting with Firebase Storage and the AI backend (Cloud Functions), decoupling the presentation layer from the direct Firebase SDK calls.

4.  **Presentation (`/src/presentation`)**: This layer contains all user-facing code, built with React.
    -   `pages/`: Contains top-level components for each route, such as `Dashboard.tsx`, `ItemDetail.tsx`, and `Upload.tsx`.
    -   `components/`: Holds reusable UI components, including both general-purpose UI elements (`ui/`) built with Radix and custom application components (`dashboard/`, `upload/`).
    -   `providers/`: Contains React context providers for managing theme, language, and user state across the component tree.

Path aliasing (`@/`) is configured in `vite.config.ts` to point to the `src` directory for cleaner import paths.

## 2. Technical Stack & Key Libraries

The project leverages a modern, type-safe stack, as detailed in `package.json`.

-   **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand) for minimal, hook-based global state management.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling. UI components in `src/presentation/components/ui/` use `class-variance-authority` and `tailwind-merge` for creating composable and flexible variants.
-   **UI Components**: A combination of custom components and unstyled primitives from [Radix UI](https://www.radix-ui.com/) (`@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, etc.) providing accessibility and interaction logic out of the box.
-   **Routing**: [React Router DOM](https://reactrouter.com/) for client-side routing, as configured in `App.tsx`.
-   **Icons**: [Lucide React](https://lucide.dev/) for a clean and consistent icon set.
-   **Animations**: [Framer Motion](https://www.framer.com/motion/) for animations, notably used in `ItemCard.tsx` to animate the appearance of items on the dashboard.
-   **Data Visualization**: [Recharts](https://recharts.org/) is used on the `Insights.tsx` page to render bar charts for spending analysis.
-   **Backend**: [Firebase](https://firebase.google.com/) is used for:
    -   **Authentication**: Google Sign-In via `signInWithPopup` as seen in `Login.tsx`.
    -   **Database**: Firestore for storing user and item data.
    -   **Storage**: Firebase Storage for hosting uploaded receipt images.
    -   **Serverless Functions**: Firebase Cloud Functions for backend logic, such as the AI-powered receipt processing triggered by `InvokeLLM`.

## 3. Getting Started

### Prerequisites

-   Node.js (`>=18.0.0`)
-   `npm` (`>=8.0.0`)

### Installation & Setup

1.  **Clone the Repository**
    ```sh
    git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/archie.git
    cd archie
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the project root. This file is ignored by Git as per `.gitignore`. Populate it with your Firebase project credentials, which are accessed in `src/infrastructure/integrations/firebase.ts`.

    ```env
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_APP_ID"
    ```

## 4. Available Scripts

The following scripts are defined in `package.json`:

-   `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
-   `npm run build`: Compiles and bundles the application for production into the `/dist` folder.
-   `npm run lint`: Runs ESLint across the codebase to check for code quality and style issues, based on the configuration in `eslint.config.js`.
-   `npm run preview`: Serves the production build locally for final verification.

## 5. Contributing via GitHub

Contributions are welcome. Please follow the standard GitHub Fork & Pull Request workflow.

1.  **Fork the Project**: Click the 'Fork' button at the top-right of this page.
2.  **Create your Feature Branch**:
    ```sh
    git checkout -b feature/NewFeature
    ```
3.  **Commit your Changes**:
    ```sh
    git commit -m 'feat: Add some NewFeature'
    ```
4.  **Push to the Branch**:
    ```sh
    git push origin feature/NewFeature
    ```
5.  **Open a Pull Request**: Navigate to the original repository and open a new pull request from your forked branch.