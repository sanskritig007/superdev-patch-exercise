# Issues 4–5: Secondary Issues & Tech Debt

### Issue 4: In-Memory Pagination
- **Location**: `TaskController.java` (lines 46–52)
- **Problem**: Backend fetches *all* matching tasks into memory, then slices them using Java `.subList()`.
- **Risk**: Fine for 50 tasks, but with 100k+ tasks it will cause massive memory spikes and `OutOfMemoryError`.
- **Fix / Tradeoff**: Added bounds guard (`Math.max(1, page)`) to stop crashes now. Left SQL `LIMIT/OFFSET` migration for future sprint to keep diff minimal.

---

### Issue 5: SQL Wildcard Characters (`%` and `_`)
- **Location**: `TaskController.java` (line 31)
- **Problem**: Input is directly wrapped as `"%term%"`. Searching `%` or `_` acts as a wildcard instead of matching literal text.
- **Fix**: Escape `%` and `_` with backslashes before search, and add `ESCAPE '\'` to the SQL `LIKE` clause.
