# Contract: projectStore.js Public API

**Module**: `src/projectStore.js`
**Consumer**: `src/projectLoader.js`, `src/App.jsx`

---

## Pure functions (no Tauri, fully unit-testable)

### mergeProject

```js
mergeProject(list: ProjectRecord[], entry: ProjectRecord) → ProjectRecord[]
```

Upserts `entry` into `list` by `path`.
- If a record with the same `path` already exists: updates its `name` and `lastOpened` in place.
- If no match: prepends `entry` to `list`.
- Does not mutate `list`; returns a new array.
- Does not sort or prune — call `sortByRecent` and `pruneToLimit` after.

### sortByRecent

```js
sortByRecent(list: ProjectRecord[]) → ProjectRecord[]
```

Returns a new array sorted descending by `lastOpened` (most recent first). Does not mutate.

### pruneToLimit

```js
pruneToLimit(list: ProjectRecord[], limit?: number) → ProjectRecord[]
```

Returns a new array with at most `limit` entries (default `10`). Takes the first `limit` items (i.e. the most recent after sorting). Does not mutate.

---

## Async I/O functions (use Tauri invoke internally)

### getRecentProjects

```js
async getRecentProjects() → ProjectRecord[]
```

Reads and parses `<app_data_dir>/projects.json`. Returns the `projects` array sorted by recency.

- If the file does not exist: returns `[]` (not an error).
- If the file is malformed JSON or has an unknown schema version: returns `[]` and logs a warning.
- Does not mutate persisted data.

### saveRecentProject

```js
async saveRecentProject(path: string, name: string) → void
```

Adds or updates a project entry in `projects.json`.

1. Calls `getRecentProjects()` to load current list.
2. Calls `mergeProject(list, { path, name, lastOpened: new Date().toISOString() })`.
3. Calls `sortByRecent` then `pruneToLimit`.
4. Writes the updated `ProjectStore` back to `projects.json` via `write_file`.

Throws if `write_file` fails (caller should handle).

### removeRecentProject

```js
async removeRecentProject(path: string) → void
```

Removes the entry matching `path` from `projects.json`.

1. Calls `getRecentProjects()`.
2. Filters out the entry with matching `path`.
3. Writes updated list back to `projects.json`.

No-op if `path` is not in the list.

---

## ProjectRecord type

```js
// ProjectRecord (persisted fields only — 'available' is runtime-only)
{
  path: string,        // primary key — absolute directory path
  name: string,        // display name
  lastOpened: string,  // ISO 8601 timestamp
}
```

See `data-model.md` for full definition including the runtime `available` field.
