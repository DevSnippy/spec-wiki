use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri::Manager;

#[derive(Serialize)]
struct DirEntry {
    name: String,
    is_directory: bool,
    is_file: bool,
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("{}: {}", path, e))
}

#[tauri::command]
fn read_dir(path: String) -> Result<Vec<DirEntry>, String> {
    let entries = fs::read_dir(&path).map_err(|e| format!("{}: {}", path, e))?;
    let mut result: Vec<DirEntry> = entries
        .filter_map(|e| e.ok())
        .filter_map(|e| {
            let meta = e.metadata().ok()?;
            Some(DirEntry {
                name: e.file_name().to_string_lossy().to_string(),
                is_directory: meta.is_dir(),
                is_file: meta.is_file(),
            })
        })
        .collect();
    result.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(result)
}

#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
fn run_git(project_path: String, args: Vec<String>) -> String {
    std::process::Command::new("git")
        .current_dir(&project_path)
        .args(&args)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default()
}

#[tauri::command]
fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    app.path()
        .app_data_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("{}: {}", parent.display(), e))?;
    }
    fs::write(&path, content).map_err(|e| format!("{}: {}", path, e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_file, read_dir, file_exists, run_git,
            get_app_data_dir, write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn write_file_creates_file_and_content() {
        let dir = std::env::temp_dir().join("specwiki_test");
        let path = dir.join("test_write.txt");
        let path_str = path.to_string_lossy().to_string();
        write_file(path_str.clone(), "hello specwiki".to_string()).expect("write failed");
        let content = fs::read_to_string(&path).expect("read failed");
        assert_eq!(content, "hello specwiki");
        fs::remove_dir_all(dir).ok();
    }

    #[test]
    fn write_file_creates_parent_dirs() {
        let dir = std::env::temp_dir().join("specwiki_test_deep").join("a").join("b");
        let path = dir.join("deep.json");
        let path_str = path.to_string_lossy().to_string();
        write_file(path_str, r#"{"ok":true}"#.to_string()).expect("write failed");
        assert!(path.exists());
        fs::remove_dir_all(std::env::temp_dir().join("specwiki_test_deep")).ok();
    }
}
