import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./Shell";
import { WelcomeScreen, MainPage } from "./ScreensMain";
import { ArticlePage, AllSpecsPage, RecentChangesPage, SearchPage } from "./ScreensArticle";
import { SettingsPage } from "./ScreensSettings";
import { pickAndLoadProject, loadProjectByPath } from "./projectLoader";
import { getRecentProjects, removeRecentProject } from "./projectStore";

export default function App() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState({ page: "main" });
  const [recentProjects, setRecentProjects] = useState([]);
  const navigate = (r) => setRoute(r);

  // Load and annotate recent projects (mark stale paths as unavailable)
  async function refreshRecentProjects() {
    try {
      const list = await getRecentProjects();
      const annotated = await Promise.all(
        list.map(async (r) => {
          const available = await invoke("file_exists", { path: r.path }).catch(() => false);
          return { ...r, available };
        })
      );
      setRecentProjects(annotated);
    } catch {
      setRecentProjects([]);
    }
  }

  useEffect(() => { refreshRecentProjects(); }, []);

  async function handleOpen() {
    setLoading(true);
    setError(null);
    try {
      const data = await pickAndLoadProject();
      if (data) {
        setProject(data);
        setRoute({ page: "main" });
        refreshRecentProjects();
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenRecent(path) {
    setLoading(true);
    setError(null);
    try {
      const data = await loadProjectByPath(path);
      if (data) {
        setProject(data);
        setRoute({ page: "main" });
        refreshRecentProjects();
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitch(path) {
    setLoading(true);
    setError(null);
    try {
      const data = await loadProjectByPath(path);
      if (data) {
        setProject(data);
        setRoute({ page: "main" });
        refreshRecentProjects();
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(path) {
    await removeRecentProject(path).catch(() => {});
    refreshRecentProjects();
  }

  if (!project) {
    return (
      <WelcomeScreen
        onOpen={handleOpen}
        onOpenRecent={handleOpenRecent}
        onRemove={handleRemove}
        recentProjects={recentProjects}
        loading={loading}
        error={error}
      />
    );
  }

  const { projectPath } = project;

  let content;
  if (route.page === "main") {
    content = <MainPage data={project} navigate={navigate} />;
  } else if (route.page === "article") {
    const feature = project.features.find((x) => x.slug === route.slug) || project.features[0];
    content = (
      <ArticlePage
        feature={feature}
        route={route}
        navigate={navigate}
        isGitRepo={project.project.isGitRepo}
        projectPath={projectPath}
      />
    );
  } else if (route.page === "special" && route.which === "recent") {
    content = <RecentChangesPage data={project} navigate={navigate} />;
  } else if (route.page === "special" && route.which === "search") {
    content = <SearchPage data={project} navigate={navigate} route={route} />;
  } else if (route.page === "settings") {
    content = <SettingsPage constitution={project.constitution} />;
  } else {
    content = <AllSpecsPage data={project} navigate={navigate} />;
  }

  return (
    <AppShell
      features={project.features}
      route={route}
      navigate={navigate}
      projectName={project.project.name}
      projectPath={projectPath}
      recentProjects={recentProjects}
      onBrowse={handleOpen}
      onSwitch={handleSwitch}
      onRemove={handleRemove}
      onClose={() => { setProject(null); setError(null); refreshRecentProjects(); }}
    >
      {content}
    </AppShell>
  );
}
