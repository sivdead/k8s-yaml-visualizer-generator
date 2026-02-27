# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript app for generating Kubernetes YAML manifests.

- `src/` contains all application code.
- `src/components/` holds UI pieces, including `forms/`, `modals/`, and `topology/`.
- `src/services/` contains YAML conversion, validation, templates, and template library logic.
- `src/contexts/`, `src/hooks/`, and `src/utils/` contain shared state, reusable logic, and helpers.
- `public/` stores static assets (`robots.txt`, `sitemap.xml`).
- `dist/` is build output and should be treated as generated artifacts.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local dev server (Vite) on port `3000`.
- `npm run build`: create production bundle in `dist/`.
- `npm run preview`: preview the production build locally.
- `npx tsc --noEmit`: run strict TypeScript checks before opening a PR.

## Coding Style & Naming Conventions
- Use TypeScript and React functional components (`.tsx`) for UI.
- Follow existing formatting in each file; most TS/TSX files use 2-space indentation.
- Components and types use `PascalCase` (`DeploymentForm`, `K8sResource`).
- Hooks use `camelCase` with `use` prefix (`useFormValidation`).
- Utility/service modules use descriptive `camelCase` filenames (`yamlUtils.ts`, `typeGuards.ts`).
- Keep Kubernetes resource route/type strings lowercase (`deployment`, `configmap`, `statefulset`).
- Prefer alias imports with `@/` where appropriate.

## Testing Guidelines
There is currently no dedicated test framework configured (`npm test` is not defined).

- At minimum, validate changes with `npm run build` and `npx tsc --noEmit`.
- Manually test impacted flows in `npm run dev`:
1. Form editing and YAML preview generation
2. Import/export modal behavior
3. Saved config loading and topology view navigation
- If you add tests, place them near feature code as `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history: `feat:`, `fix:`, `docs:`, `chore(scope):`.
- Write short, imperative commit subjects (for example: `fix: add SPA rewrite for Vercel`).
- PRs should include:
1. Clear summary of user-facing and technical changes
2. Linked issue/task ID when available
3. Screenshots or short recordings for UI changes
4. Validation steps and commands run locally

## Security & Configuration Tips
- Set `GEMINI_API_KEY` in `.env.local` for local runs.
- Never commit secrets or environment files containing credentials.
- Keep deployment behavior aligned with `vercel.json` rewrite rules for SPA routes.
