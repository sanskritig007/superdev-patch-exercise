# Issue 1 — SQL Operator Precedence in Task Search Query

**Layer**: Database / SQL + Oracle PL/SQL Reference
### Location
- `backend/src/main/java/com/internal/tasktracker/TaskRepository.java` — lines 14–17
- `db/queries/search_tasks.sql` — lines 10–13
- `db/oracle/task_search_package.sql` — lines 52–55 and 66–69

### Discovery
While testing the UI with search term `api` and status filter set to `Open`, tasks with status `IN_PROGRESS` were appearing in the results. This should not happen — the filter was clearly selected but being ignored.

Further testing with `api` and no filter showed archived tasks (IDs 20 and 21, both marked `archived = true`) leaking into results. These should never be visible.

### Root Cause
In SQL boolean logic, `AND` has higher operator precedence than `OR` — just like multiplication before addition in arithmetic.

Because there were no parentheses around the `OR` clause, the WHERE condition was being evaluated as:

```
(archived = FALSE AND title LIKE term)
OR
(description LIKE term AND status = filter)
```

So: if the title matched, the status filter was skipped. If the description matched, the archived check was skipped. Both bugs from one missing pair of brackets.

### Fix & Why
Added parentheses to explicitly group the OR:

```sql
WHERE archived = FALSE
  AND (LOWER(title) LIKE :term OR LOWER(description) LIKE :term)
  AND (:status IS NULL OR status = :status)
```

Applied the same fix in all three places — including the Oracle PL/SQL package (both the `COUNT(*)` query and the paginated cursor query) to keep the reference artifact consistent with the actual implementation.
