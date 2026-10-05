# Issue 2 — Backend Controller: Artificial Latency, Invalid Status Crash, Pagination Bounds

**Layer**: Backend / Java (Spring Boot)

---

### Location
`backend/src/main/java/com/internal/tasktracker/TaskController.java` — lines 36–54

---

### Discovery

**Delay**: On first page load (empty search box), there was a noticeable 1-second pause before tasks appeared. Traced it to `Thread.sleep(queryWeight)` where `queryWeight = complexityScore * 100` and `complexityScore = Math.max(0, 10 - query.length())`. Empty query → score = 10 → sleep = 1000ms.

**500 Crash**: Sending `?status=INVALID` via curl returned a raw 500 Internal Server Error. `TaskStatus.valueOf("INVALID")` throws `IllegalArgumentException` which was unhandled — propagating straight to the user.

**Pagination Crash**: Inspecting the code, `start = (page - 1) * pageSize` with `page = 0` gives `start = -10`. Java's `subList(-10, ...)` throws `IndexOutOfBoundsException` — another unhandled 500.

---

### Root Cause
- **Sleep**: Artificial "complexity estimation" block that blocked a real thread for no production benefit — inversely penalizing short queries which are the most common case.
- **Enum crash**: No validation or error handling around `TaskStatus.valueOf()` — any unexpected input crashes the request.
- **Pagination**: No lower-bound enforcement on the `page` parameter before computing list slice indices.

---

### Fix & Why
1. **Removed `Thread.sleep` entirely** — blocking a request thread degrades throughput under load with no benefit.
2. **Wrapped enum parsing in try-catch** — returns `400 Bad Request` with a descriptive error message instead of an unhandled 500.
3. **Added `Math.max(1, page)` and `Math.min(100, pageSize)`** — safe bounds before computing start/end indices, preventing crashes from invalid input.
