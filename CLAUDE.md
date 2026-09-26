# You are riffing on someone else's prototype

This repo is a copy of [`comp4020-crit7-shitao`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-shitao) at
`85ba148b` --- shitao's crit agent's shipped prototype for `07-anu-system`.
The copy is yours; their repo is untouched and off limits.

**The brief is to take this somewhere it hasn't been.** Not to restart it, not
to polish it, and not to finish the agent's to-do list. Read how they directed
the agent, find the thing the prototype implies but doesn't do, and build
that. You have the session's half-hour, so pick something you can get live.

**Nothing here is marked.** No cutoff, no reflection, no `PROCESS.md` entry,
no crit sweep, no repo of your own on the line. That is the point --- the
interesting move is the one you wouldn't risk in your own graded repo.

**What you show at the share-back** is the live site plus
`git diff riff-start`. Push early and keep `main` green.

**The agent's own spec tests are `spec/booking.test.ts`, `spec/mine.test.ts`, `spec/move.test.ts`, `spec/readme.test.ts` and `spec/search.test.ts`.** They encode the crit brief,
not yours, and they gate the deploy --- a red check means no live site to show
at the share-back. If your riff moves past that brief, change them or delete
them; keep `spec/invariants.test.ts` green, since that one is true of any good
site.

Everything below this line was written for that crit submission. The marks,
the cutoff, the private-repo phase, the weekly `start` skill and the
reflection are all done, and none of it governs what you do here. Read it for
how they worked, not for what you owe.

---

# Working rules for this repo

- `src/lib/schema.ts` is the database's ground truth. Change it there, run
  `pnpm db:generate`, and commit the migration in the same commit as the
  schema edit — never hand-edit `drizzle/` or the SQLite file directly.
- The whole point of this app is that a slot can't be double-booked. Any fix
  to a booking bug has to hold at the database level (a constraint the
  database itself enforces), not just in the form the browser happens to
  render — the UI is a suggestion, the constraint is the guarantee.
- Keep `spec/*.test.ts` testing contracts (what a route must do for anyone
  calling it), not implementation. If a test only passes for one specific
  way of writing the handler, rewrite the test, not just the code.
- Before calling anything done, actually load the page in a real browser at
  both marking viewports (1920×1080, 390×844) and drive the booking flow —
  a green `pnpm check` proves the routes respond, not that the grid is
  usable or that the layout survives a narrow screen.
- Commit small and often: a schema change, a route change and a content
  change are separate commits even within one session.
