# FocusBoard development context

Standalone FlyRank React app exercise, separate from the RankLens capstone.

React 19, strict TypeScript, Vite, standard CSS, Vitest, Testing Library. Commands: npm ci, npm run dev, npm test, npm run build.

- Store only validated task arrays under focusboard.tasks.v1; reject duplicate identifiers and malformed records. Preserve intentionally empty arrays.
- Use local calendar dates for date-only deadlines; never convert them through UTC formatting.
- Keep unfinished tasks ahead of completed tasks; sort within these groups. Tests must cover both sorting choices.
- Use native dialog semantics, explicitly focus the title after showModal, restore focus on close, and keep keyboard focus visible.
- Do not claim storage success when writes fail. Keep the in-memory state usable and explain session-only changes.
- No API keys, backend, account creation, cloud sync, or real internship records. Example tasks are samples.
- Record real corrections and checks. Do not claim the learner personally made edits or watched the mentor video unless they confirm it.
- Use Conventional Commits. Run tests and production build after source changes.
