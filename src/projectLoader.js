import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { parseConstitution, parseSpec, parseTasks, inferStatus } from "./parsers.js";
import { saveRecentProject } from "./projectStore.js";

// ---- Tauri bridge ----

async function readFile(path) {
  return invoke("read_file", { path });
}

async function readDir(path) {
  return invoke("read_dir", { path });
}

async function fileExists(path) {
  return invoke("file_exists", { path });
}

async function git(projectPath, args) {
  try {
    return await invoke("run_git", { projectPath, args });
  } catch {
    return "";
  }
}

// ---- Public API ----

export async function pickAndLoadProject() {
  const projectPath = await open({
    directory: true,
    multiple: false,
    title: "Open Spec Kit Project",
  });
  if (!projectPath) return null;
  return loadProjectByPath(projectPath);
}

export async function loadProjectByPath(projectPath) {
  const data = await loadProject(projectPath);
  if (data) {
    await saveRecentProject(projectPath, data.project.name).catch(() => {});
  }
  return data;
}

export async function loadProject(projectPath) {
  const [hasSpecs, hasSpecify] = await Promise.all([
    fileExists(`${projectPath}/specs`),
    fileExists(`${projectPath}/.specify`),
  ]);

  if (!hasSpecs && !hasSpecify) {
    throw new Error(
      "Not a Spec Kit project — no specs/ or .specify/ folder found."
    );
  }

  const isGitRepo = await fileExists(`${projectPath}/.git`);
  const projectName = projectPath.split("/").pop();

  const constitution = await loadConstitution(projectPath, projectName);
  const features = hasSpecs
    ? await loadFeatures(`${projectPath}/specs`, projectPath, isGitRepo)
    : [];
  const recentChanges = isGitRepo
    ? await loadRecentChanges(projectPath, features)
    : [];

  return {
    projectPath,
    project: {
      name: constitution.title,
      tagline: "A Spec Kit Project Wiki",
      isGitRepo,
    },
    constitution,
    features,
    recentChanges,
  };
}

// ---- Loaders ----

async function loadConstitution(projectPath, defaultTitle) {
  const candidates = [
    `${projectPath}/.specify/memory/constitution.md`,
    `${projectPath}/.specify/constitution.md`,
    `${projectPath}/constitution.md`,
  ];
  for (const p of candidates) {
    if (await fileExists(p)) {
      return parseConstitution(await readFile(p), defaultTitle);
    }
  }
  return { title: defaultTitle, principles: [] };
}

async function loadFeatures(specsPath, projectPath, isGitRepo) {
  const entries = await readDir(specsPath);
  const dirs = entries.filter((e) => e.is_directory);
  const features = [];
  for (const dir of dirs) {
    const f = await loadFeature(
      `${specsPath}/${dir.name}`,
      dir.name,
      projectPath,
      isGitRepo
    );
    if (f) features.push(f);
  }
  return features;
}

async function loadFeature(featurePath, dirName, projectPath, isGitRepo) {
  const [
    hasSpec,
    hasPlan,
    hasTasks,
    hasDataModel,
    hasResearch,
    hasQuickstart,
    hasContracts,
  ] = await Promise.all([
    fileExists(`${featurePath}/spec.md`),
    fileExists(`${featurePath}/plan.md`),
    fileExists(`${featurePath}/tasks.md`),
    fileExists(`${featurePath}/data-model.md`),
    fileExists(`${featurePath}/research.md`),
    fileExists(`${featurePath}/quickstart.md`),
    fileExists(`${featurePath}/contracts`),
  ]);

  if (!hasSpec) return null;

  const specContent = await readFile(`${featurePath}/spec.md`);
  const spec = parseSpec(specContent);

  const [planContent, dataModelContent, researchContent, quickstartContent] =
    await Promise.all([
      hasPlan ? readFile(`${featurePath}/plan.md`) : Promise.resolve(null),
      hasDataModel
        ? readFile(`${featurePath}/data-model.md`)
        : Promise.resolve(null),
      hasResearch
        ? readFile(`${featurePath}/research.md`)
        : Promise.resolve(null),
      hasQuickstart
        ? readFile(`${featurePath}/quickstart.md`)
        : Promise.resolve(null),
    ]);

  let tasks = [];
  if (hasTasks) {
    tasks = parseTasks(await readFile(`${featurePath}/tasks.md`));
  }

  let contracts = [];
  if (hasContracts) {
    const contractEntries = await readDir(`${featurePath}/contracts`);
    contracts = contractEntries.filter((e) => e.is_file).map((e) => e.name);
  }

  let modified = "unknown";
  if (isGitRepo) {
    const out = await git(projectPath, [
      "log",
      "-1",
      "--pretty=tformat:%ar",
      "--",
      `specs/${dirName}/`,
    ]);
    modified = out.trim() || "unknown";
  }

  const numberMatch = dirName.match(/^(\d+)/);
  let status;
  if (tasks.length > 0) {
    status = tasks.every(t => t.done) ? "implemented" : "ready";
  } else {
    status = spec.status || inferStatus({ hasSpec, hasPlan, hasTasks });
  }

  return {
    slug: dirName,
    number: numberMatch ? numberMatch[1] : dirName,
    title: spec.title || dirName,
    branch: spec.branch || dirName,
    status,
    modified,
    files: {
      spec: hasSpec,
      plan: hasPlan,
      tasks: hasTasks,
      dataModel: hasDataModel,
      research: hasResearch,
      quickstart: hasQuickstart,
    },
    summary: spec.overview || "",
    stories: spec.stories,
    requirements: spec.requirements,
    clarifications: spec.clarifications,
    callouts: spec.callouts || [],
    tables: spec.tables || [],
    tasks,
    contracts,
    specContent,
    planContent,
    dataModelContent,
    researchContent,
    quickstartContent,
  };
}

async function loadRecentChanges(projectPath, features) {
  const out = await git(projectPath, [
    "log",
    "--name-only",
    "--pretty=tformat:COMMIT|%ar",
    "--diff-filter=ACMR",
    "--",
    "specs/",
    "-n",
    "30",
  ]);

  const changes = [];
  let when = "";

  for (const line of out.split("\n")) {
    if (line.startsWith("COMMIT|")) {
      when = line.slice(7).trim();
    } else if (line.startsWith("specs/")) {
      const parts = line.split("/");
      if (parts.length < 2) continue;
      const slug = parts[1];
      const feature = features.find((f) => f.slug === slug);
      if (!feature) continue;
      // deduplicate: one entry per feature per commit window
      const exists = changes.find((c) => c.slug === slug && c.when === when);
      if (!exists) {
        changes.push({ file: parts.slice(1).join("/"), when, feature: feature.title, slug });
      }
    }
  }

  return changes.slice(0, 20);
}

// Parsers are in src/parsers.js (imported above) for testability.
