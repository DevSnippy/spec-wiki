import { invoke } from "@tauri-apps/api/core";

// ---- Pure functions (no Tauri, fully unit-testable) ----

export function mergeProject(list, entry) {
  const idx = list.findIndex((r) => r.path === entry.path);
  if (idx >= 0) {
    const updated = [...list];
    updated[idx] = { ...updated[idx], name: entry.name, lastOpened: entry.lastOpened };
    return updated;
  }
  return [entry, ...list];
}

export function sortByRecent(list) {
  return [...list].sort((a, b) => {
    const ta = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
    const tb = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
    return tb - ta;
  });
}

export function pruneToLimit(list, limit = 10) {
  return list.slice(0, limit);
}

// ---- Async I/O (use Tauri invoke internally) ----

async function getAppDataDir() {
  return invoke("get_app_data_dir");
}

async function projectsFilePath() {
  const dir = await getAppDataDir();
  return `${dir}/projects.json`;
}

export async function getRecentProjects() {
  try {
    const filePath = await projectsFilePath();
    const exists = await invoke("file_exists", { path: filePath });
    if (!exists) return [];
    const raw = await invoke("read_file", { path: filePath });
    const store = JSON.parse(raw);
    if (!store || store.version !== 1 || !Array.isArray(store.projects)) {
      console.warn("projects.json has unexpected format — returning empty list");
      return [];
    }
    return sortByRecent(store.projects);
  } catch (e) {
    console.warn("Failed to read projects.json:", e);
    return [];
  }
}

export async function saveRecentProject(path, name) {
  const list = await getRecentProjects();
  const entry = { path, name, lastOpened: new Date().toISOString() };
  const updated = pruneToLimit(sortByRecent(mergeProject(list, entry)));
  const store = { version: 1, projects: updated };
  const filePath = await projectsFilePath();
  await invoke("write_file", { path: filePath, content: JSON.stringify(store, null, 2) });
}

export async function removeRecentProject(path) {
  const list = await getRecentProjects();
  const filtered = list.filter((r) => r.path !== path);
  const store = { version: 1, projects: filtered };
  const filePath = await projectsFilePath();
  await invoke("write_file", { path: filePath, content: JSON.stringify(store, null, 2) });
}
