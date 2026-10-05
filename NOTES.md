# NOTES.md

## Issue 1 — SQL Operator Precedence
- **Summary:** Fixed missing parentheses around `OR` in `TaskRepository.java`, `search_tasks.sql`, and Oracle PL/SQL package. Restored strict filtering so archived tasks don't leak and status filters are respected.
- **What I chose not to change:** Kept native query instead of rewriting in JPA/Criteria API to minimize blast radius.
- **Biggest remaining risk:** Duplicated query logic across Java, SQL, and Oracle reference files risks drift if maintained separately.
- **Tools / AI used:** Used Antigravity AI to cross-reference all 3 files; verified with curl.

---

## Issue 2 — Backend Controller Stability
- **Summary:** In `TaskController.java`, removed artificial `Thread.sleep` (up to 1s delay), caught invalid `status` enum values returning 400 instead of 500, and enforced `page >= 1` bounds.
- **What I chose not to change:** Kept in-memory pagination; did not rewrite repository layer to use SQL `LIMIT/OFFSET`.
- **Biggest remaining risk:** In-memory slicing fetches all matching records before pagination, creating memory pressure under heavy load.
- **Tools / AI used:** AI helped verify enum parsing and boundary handling patterns.

---

## Issue 3 — Frontend Debounce, Race Condition & Pagination
- **Summary:** In `useTasks.js`, added a 600ms debounce on search, wired `AbortController` to prevent stale response race conditions, and ensured `setLoading(false)` runs in `.finally()`. In `App.jsx`, reset page to 1 on filter/search change.
- **What I chose not to change:** Avoided adding external data-fetching libraries (TanStack Query / SWR) to keep bundle small and dependencies minimal.
- **Biggest remaining risk:** No client-side caching; rapid back-and-forth toggling between filters still re-fetches from network.
- **Tools / AI used:** Used Antigravity AI to draft debounce and abort cleanup, then manually tested edge cases and adjusted delay.
