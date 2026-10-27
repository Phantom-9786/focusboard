# FocusBoard

A calm, browser-local task planner for internship work. Built with React and TypeScript for FlyRank's standalone **React app development with AI** assignment.

## What works

- Add and edit tasks with descriptions, priorities, statuses, and optional due dates.
- Complete or reopen tasks, delete a task, and undo the most recent deletion during the session.
- Search titles/descriptions, combine status and priority filters, and sort by due date or priority.
- See live totals, in-progress counts, completed tasks, and completion percentage.
- Restore validated preferences from localStorage. An intentionally empty board stays empty.
- Continue in memory when browser storage is blocked; failures are clearly labelled.
- Use keyboard controls, a native task dialog, focus restoration, labels, and a skip link.
- Responsive layouts for desktop and smaller screens. A new browser begins with five clearly identified sample tasks.

This frontend has no backend, authentication, cloud sync, external task API, or AI inference feature. AI was the development assistant. Tasks are stored only in this browser; clearing browser data removes them. Google Fonts is optional presentation styling; system fonts provide a fallback.

## Run locally

Node.js 24 and npm were used.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

```sh
npm test
npm run build
npm run preview
```

`npm test` runs 26 tests; `npm run build` runs strict TypeScript checking and produces dist/. The source repository is the assignment deliverable; the localhost preview is not a publicly hosted URL.

## Prompts and development direction

The owner's request was **“ye le next one”**, with the assignment brief asking for an independent React build using AI, development prompts, an explanation, and reviewed improvements. The implementation scope adopted and stated by Codex before coding was:

> Build FocusBoard as a standalone internship task planner: add/edit tasks, filter by status, search, due dates, and browser-local persistence. Keep it separate from the RankLens capstone and work on the D: drive.

The review direction during development was to test edge cases, inspect actual browser behavior, correct problems, and document AI-generated work separately from the learner's personal contributions. These are the real task direction and development specification, not a fabricated transcript of separate user prompts. See [development record](docs/DEVELOPMENT.md) for the implementation and verification sequence.

## How AI assisted

Codex converted the supplied brief into a bounded frontend, reused a minimal React toolchain, implemented typed task data and UI components, wrote tests, inspected the local browser preview, corrected defects, and prepared this documentation. No separate subagent was used for this assignment. The mentor video could not be fetched; the supplied Q&A explicitly allows independently chosen frontend applications, so this app does not claim to reproduce the recording.

## Reviewed corrections and refactoring

1. **Focus bug caught in a real browser:** the original dialog opened with focus on Close because React autofocus ran before the native dialog opened. The correction focuses the title immediately after showModal. Browser inspection confirmed the fix; the component test also checks initial focus.
2. **Sorting corrected:** the original due-date ordering placed old completed tasks before unfinished work. Sorting was extracted into compareTasks(), which groups unfinished tasks first and then applies the requested sort. Three regression cases cover both sort modes and undated tasks.
3. **Readability improved:** browser review found faint supporting text. Secondary text, priorities, and status text received darker CSS colors. This is a visual review correction, not a claim of a certified contrast/accessibility audit.
4. **Verification caught a test typing mistake:** Vitest initially passed, but TypeScript rejected an unsupported exact option in two getByRole queries. Removing that option fixed the build; tests and build were rerun successfully.

These review corrections were performed by Codex. They are not represented as manual edits by the repository owner. The owner should personally review the app and make/document a meaningful improvement before claiming that part of the assignment as their own. The [owner review guide](docs/OWNER-REVIEW.md) explains a small concrete next step.

## Verification

- 26 passing tests across task-model and component tests.
- Production build and TypeScript check pass.
- Browser check: task dialog focus, task creation/count update, and persistence after reload verified.
- Tests cover validation, corrupt storage, duplicate IDs, blocked storage, empty boards, CRUD, undo, combined filtering, sorting, and modal cancellation.
- Browser inspection was performed at the available preview size. No separate phone/device test or complete assistive-technology audit is claimed.

## License

MIT — see [LICENSE](LICENSE).
