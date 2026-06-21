# Contract: New Rust Commands

**Module**: `src-tauri/src/lib.rs`
**Registration**: Added to `tauri::generate_handler![]` alongside existing commands.

---

## get_app_data_dir

```rust
#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String>
```

Returns the platform-appropriate Tauri app data directory as an absolute path string.

**Parameters**: `app` — injected by Tauri, not passed from JS.

**Return**:
- `Ok(String)` — absolute path to the app data directory (e.g. `/Users/avi/Library/Application Support/com.specwiki.app`). The directory is NOT guaranteed to exist; callers must use `write_file` (which calls `create_dir_all`) before writing.
- `Err(String)` — error message if the path cannot be resolved.

**JS call**:
```js
const dir = await invoke("get_app_data_dir");
// → "/Users/avi/Library/Application Support/com.specwiki.app"
```

---

## write_file

```rust
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String>
```

Writes `content` (UTF-8 string) to `path`, creating parent directories as needed.

**Parameters**:
- `path` — absolute filesystem path to write to.
- `content` — UTF-8 string content (typically JSON).

**Return**:
- `Ok(())` — file written successfully.
- `Err(String)` — OS error message if write fails.

**Behaviour**:
- Calls `std::fs::create_dir_all(parent)` before writing so the app data directory is created on first use.
- Overwrites existing files (atomic-enough for a single-user desktop app).

**JS call**:
```js
await invoke("write_file", { path: "/…/projects.json", content: JSON.stringify(store) });
```

---

## Existing commands (unchanged)

These existing commands are reused by `projectStore.js`:

| Command | Used for |
|---|---|
| `read_file(path)` | Read `projects.json` if it exists |
| `file_exists(path)` | Check if `projects.json` exists before reading; check project directories for availability |
