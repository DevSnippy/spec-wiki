# Data Model: Project Switcher

All entities are plain JavaScript objects. Persistence format is JSON in `projects.json` inside the Tauri app data directory.

---

## ProjectRecord

One entry in the recent-projects list. Stored in `projects.json` and held in React state.

| Field | Type | Description |
|---|---|---|
| `path` | `string` | Absolute filesystem path to the project root directory (e.g. `/Users/avi/code/my-project`). Acts as the primary key — no two records share the same `path`. |
| `name` | `string` | Display name derived from the constitution title, or the directory name as fallback. Cached at save time; re-resolved on load. |
| `lastOpened` | `string` | ISO 8601 timestamp of the most recent successful `loadProject()` call for this path (e.g. `"2026-06-21T14:30:00.000Z"`). |
| `available` | `boolean` | Runtime-only field (not persisted). Set to `false` when `file_exists(path)` returns `false` during the availability check on WelcomeScreen render. |

**Validation rules**:
- `path` must be a non-empty string.
- `name` must be a non-empty string; if the constitution title is blank, fall back to `path.split("/").pop()`.
- `lastOpened` must be a valid ISO date string; if invalid/missing, treat as the oldest possible entry.

---

## ProjectStore

The full JSON document stored at `<app_data_dir>/projects.json`.

| Field | Type | Description |
|---|---|---|
| `version` | `number` | Schema version — currently `1`. Increment on breaking changes to allow future migration. |
| `projects` | `ProjectRecord[]` | List of recent projects, sorted most-recent-first by `lastOpened`. Maximum 10 entries. |

**Example `projects.json`**:

```json
{
  "version": 1,
  "projects": [
    {
      "path": "/Users/avi/code/my-app",
      "name": "My App Constitution",
      "lastOpened": "2026-06-21T14:30:00.000Z"
    },
    {
      "path": "/Users/avi/code/other-project",
      "name": "Other Project",
      "lastOpened": "2026-06-20T09:00:00.000Z"
    }
  ]
}
```

---

## State shape additions to App.jsx

New React state alongside the existing `project` / `loading` / `error` state:

| State | Type | Description |
|---|---|---|
| `recentProjects` | `ProjectRecord[]` | Loaded from `getRecentProjects()` on mount. Re-fetched after every `loadProject` call. Passed to `WelcomeScreen` and `TopBar`. |
| `switcherOpen` | `boolean` | Whether the TopBar project-switcher dropdown is visible. Local to `TopBar` component (not lifted). |

---

## Pure functions in projectStore.js

These operate on `ProjectRecord[]` without any side effects:

| Function | Signature | Description |
|---|---|---|
| `mergeProject` | `(list: ProjectRecord[], entry: ProjectRecord) → ProjectRecord[]` | Upserts `entry` into `list` by `path` (update `name` + `lastOpened` if exists, prepend if new). |
| `sortByRecent` | `(list: ProjectRecord[]) → ProjectRecord[]` | Sorts descending by `lastOpened`. Returns new array. |
| `pruneToLimit` | `(list: ProjectRecord[], limit?: number) → ProjectRecord[]` | Truncates to `limit` (default 10) entries. Returns new array. |

---

## State transitions

```
App launch
  └─ mount: getRecentProjects() → recentProjects[]
       ├─ [] → WelcomeScreen (empty, only "Browse…" button)
       └─ [...]  → WelcomeScreen with recent project rows
                     ├─ click row → loadProjectByPath(path) → project loaded → MainPage
                     └─ click "Browse…" → pickAndLoadProject() → project loaded → MainPage
                                                                    └─ saveRecentProject() called

Inside app (project loaded)
  └─ TopBar project chip click → switcherOpen = true → dropdown visible
       ├─ click different project → loadProjectByPath(path) → project replaced
       ├─ click "Browse new project…" → pickAndLoadProject() → project replaced
       └─ click active project or click outside → switcherOpen = false

Any successful loadProject / loadProjectByPath
  └─ saveRecentProject(path, constitutionTitle) → projects.json updated
  └─ recentProjects refreshed in App state
```
