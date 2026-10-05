# Issue 3 — Frontend: Debounce, Race Condition, Loading State, and Pagination Reset

**Layer**: Frontend / React 18

---

### Location
- `frontend/src/hooks/useTasks.js` — lines 4–49
- `frontend/src/App.jsx` — lines 15–30
- `frontend/src/api.js` — lines 3, 12

---

### Discovery

1. **Keystroke Network Flood**: Typing a search term like "refactor" fired 8 immediate API requests (one per character) visible in browser DevTools Network tab.
2. **Race Condition**: Fast typing followed by backspacing caused stale responses from earlier queries to arrive after newer ones, overwriting the table with outdated results.
3. **Deadlock on Error**: Simulating a backend failure left the UI permanently showing "Loading tasks...". The error state message was never displayed.
4. **Pagination Desync**: Navigating to Page 3 and then filtering by a status with only 1 page of results displayed "No tasks found" because `page` remained 3.

---

### Root Cause
- **Debounce**: `query` was passed directly into `useEffect` with no delay, executing a fetch on every keystroke.
- **Race Condition**: `fetchTasks` promise had no abort/cancellation logic. Out-of-order network responses resolved and overwrote state unconditionally.
- **Loading State**: `setLoading(false)` was only called inside `.then()` and omitted in `.catch()`. Because `loading` remained `true`, `TaskTable`'s loading check always intercepted before reaching the error branch.
- **Pagination**: `page` state in `App.jsx` had no linkage to `query` or `status` changes.

---

### Fix & Why
1. **Added 600ms Debounce**: Stored `debouncedQuery` with a 600ms `setTimeout` in `useTasks.js`. Gives comfortable typing time before firing, reducing network traffic and server load significantly.
2. **Added `AbortController`**: Passed `signal` to `fetchTasks` in `api.js` and aborted previous in-flight requests on effect cleanup, eliminating race conditions.
3. **Moved `setLoading(false)` to `.finally()`**: Guarantees loading is cleared on both success and error, allowing the error banner to render properly. Also reset `setError(null)` on each new request.
4. **Page Reset on Query / Status Change**: Updated `App.jsx` handlers (`handleQueryChange`, `handleStatusChange`) to call `setPage(1)`, preventing blank pages from invalid offsets.
