# Flowboard

Flowboard is an Angular task-management dashboard built as a modular Nx workspace. It provides a Kanban board for organizing tasks, with separate application areas for analytics, team management, and settings.

## Project overview and architecture

The workspace is organized as an Nx application and libraries:

```text
apps/
  fe-test-workspace/       Angular application shell, routing, global styles, and SSR
  fe-test-workspace-e2e/   Playwright end-to-end tests
libs/
  task-management/         Task board, task features, UI, state, and domain models
  analytics/               Analytics area
  team-management/         Team area
  settings/                Settings area
  shared/                  Shared UI and design tokens
```

The application shell owns routing and shared providers. Domain-specific functionality lives in its own library so each area can evolve independently. Within task management, code is further separated into `features`, `ui`, `data-access`, `data-access/models`, and `utils`. This follows domain-driven design (DDD) principles by keeping domain behavior and implementation details close to the domain that owns them, rather than coupling every feature to a single application-wide module.

Sheriff and Nx module-boundary lint rules help enforce those boundaries. The Sheriff configuration prevents one domain from importing another domain directly and defines which architectural layers may depend on one another. It also enables barrel-less imports. Keep cross-domain sharing explicit through shared libraries and stable public interfaces.

### Routing and code splitting

The board, analytics, team, and settings routes use Angular's `loadComponent` with dynamic imports. These routes are loaded on demand, allowing Angular to create separate chunks instead of placing every route's component code in the initial bundle. The empty route redirects to the board, and unknown routes also return to the board.

### State management

Task state is managed with an NgRx Signal Store. The store owns task data and CRUD/reordering methods, while computed signals derive views such as tasks by status, assignees, tags, and overdue tasks. Components can consume reactive state without duplicating domain calculations. Other application areas do not yet have comparable domain stores.

### Design system and tokens

Shared Sass files define primitive color tokens and semantic tokens. Primitive values (for example, palette colors) are mapped to purpose-based variables such as `--color-bg-surface` and `--color-primary`. Components use semantic tokens rather than hard-coding colors, making it easier to update the visual language consistently as the design system grows. Global styles also configure Angular Material's theme.

## Setup and installation

### Prerequisites

- Node.js version compatible with the Angular 22 toolchain
- npm (the package manager and lockfile are used by this workspace)

### Install and run

From the repository root:

```bash
npm ci
npx nx serve fe-test-workspace
```

The development server is available at `http://localhost:4200`.

Create a production build with:

```bash
npx nx build fe-test-workspace --configuration=production
```

The Angular application is configured for server-side rendering and client hydration.

## Run with Docker Compose

Build the production image and start the SSR application from the workspace root:

```bash
docker compose up --build
```

Open `http://localhost:4000`. To use a different host port, set the `APP_PORT`
environment variable before running Compose; the application continues to
listen on port 4000 inside the container. Stop the application with:

```bash
docker compose down
```

The SSR server allows `localhost` and `127.0.0.1` for local access. If deploying
behind a custom hostname, add that hostname to `security.allowedHosts` in
`apps/fe-test-workspace/project.json` and rebuild the image.

## Environment configuration

The application does not currently require environment variables or a `.env` file. Task data is provided by local mock JSON assets.

The Playwright configuration supports:

| Variable   | Purpose                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `BASE_URL` | Optional base URL for end-to-end tests; defaults to the local application at `http://localhost:4200`. |
| `CI`       | When set, Playwright serves the built application; otherwise it starts the development server.        |

For CI runs, build the app before using the configured static server/test workflow. Do not put secrets in frontend environment variables; values shipped to a browser are public.

## Available scripts and commands

Run Nx targets directly from the workspace root:

| Command                            | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| `npx nx serve fe-test-workspace`   | Start the development server.                       |
| `npx nx build fe-test-workspace`   | Build the application.                              |
| `npx nx test <project>`            | Run a project's unit tests.                         |
| `npx nx lint <project>`            | Lint a project, including architecture constraints. |
| `npx nx e2e fe-test-workspace-e2e` | Run the Playwright end-to-end project.              |
| `npx nx graph`                     | Open the Nx project dependency graph.               |
| `npx nx show project <project>`    | Inspect a project's available targets.              |
| `npx nx affected -t build`         | Build projects affected by the current changes.     |
| `npx nx affected -t test`          | Test projects affected by the current changes.      |
| `npx nx affected -t lint`          | Lint projects affected by the current changes.      |
| `npx nx reset`                     | Clear Nx's local cache and workspace state.         |

Examples:

```bash
npx nx test task-mangement
npx nx lint task-mangement
npx nx test fe-test-workspace
npx nx e2e fe-test-workspace-e2e
```

The package scripts also include `format` and `format:check` for Prettier, plus `watch` for a development build in watch mode. The `start`, `build`, `test`, and `lint` package scripts currently contain `<app-name>` or `<project-name>` placeholders; use the Nx commands above with an actual project name, or replace the placeholders before invoking those scripts.

## Testing strategy

- **Unit and component tests:** Vitest with Angular testing utilities. Tests cover the task store's data loading, computed state, and CRUD behavior, as well as components and utilities in the domain libraries.
- **End-to-end tests:** Playwright is configured for Chromium, Firefox, and WebKit. The Nx Playwright target starts the app automatically and reuses an existing server when available.
- **Architecture and quality checks:** ESLint runs Angular, TypeScript, template-accessibility, Nx module-boundary, and Sheriff rules. `npx nx lint <project>` is the project-level check.
- **Build validation:** The production build has an initial bundle budget (warning at 500 kB, error at 1 MB) and per-component-style budgets (warning at 4 kB, error at 8 kB).

Run the relevant checks before submitting changes, for example:

```bash
npx nx test task-mangement
npx nx lint task-mangement
npx nx build fe-test-workspace --configuration=production
```

The Playwright suite currently contains a starter smoke test; add user-flow assertions as the product behavior is completed.

## Performance techniques

- **Route-level lazy loading and code splitting** defer non-active areas until navigation, reducing work and code needed for the initial route.
- **Production optimizations and output hashing** are enabled through the Angular production build configuration.
- **Bundle and component-style budgets** provide guardrails against uncontrolled growth.
- **Nx task caching and affected commands** avoid repeating unchanged work and focus validation on impacted projects.
- **Signal-based state and computed selectors** provide reactive derived values and avoid recalculating those values independently in multiple UI components.
- **Server-side rendering and hydration** are configured to support rendering on the server and continuing on the client.

## Known limitations and future improvements

- Task data is mock-backed. Changes made through the Signal Store are in-memory and are not persisted to a backend.
- Analytics, team management, and settings are scaffolded route areas; they do not yet provide the same depth of functionality as the task-management domain.
- The end-to-end test is still a generated starter test and should be replaced or expanded with checks for real board, task creation/editing, and navigation flows.
- There is no configured application-specific environment file or production API configuration yet.
- Future work could introduce a real API and persistence, define loading/error states around data access, expand domain stores and tests as other areas gain behavior, and add accessibility and performance checks to CI.
