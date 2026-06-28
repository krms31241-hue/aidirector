import {
  FileCode2,
  Play,
  GitBranch,
  Shield,
  Zap,
  Plus,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "../store";

export default function Workspace() {
  const { currentProject, files, setFiles, currentFile, setCurrentFile } =
    useAppStore();
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    if (currentProject) {
      fetch(`/api/projects/${currentProject.id}/files`)
        .then((res) => res.json())
        .then((data) => {
          setFiles(data);
          if (data.length > 0) {
            setCurrentFile(data[0]);
          } else {
            setCurrentFile(null);
          }
        });
    }
  }, [currentProject, setFiles, setCurrentFile]);

  useEffect(() => {
    if (currentFile) {
      setEditingContent(currentFile.content || "");
    }
  }, [currentFile]);

  const handleSave = async () => {
    if (!currentProject || !currentFile) return;
    try {
      const res = await fetch(
        `/api/projects/${currentProject.id}/files/${currentFile.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editingContent }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setFiles(files.map((f) => (f.id === updated.id ? updated : f)));
        setCurrentFile(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFile = async () => {
    if (!currentProject) return;
    const name = prompt("File path (e.g. src/main.py):");
    if (!name) return;

    try {
      const res = await fetch(`/api/projects/${currentProject.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: name,
          content: "",
          language: name.split(".").pop() || "text",
        }),
      });
      if (res.ok) {
        const newFile = await res.json();
        setFiles([...files, newFile]);
        setCurrentFile(newFile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
      <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto bg-[#0A0A0A]">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => setCurrentFile(file)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 cursor-pointer ${
              currentFile?.id === file.id
                ? "text-[#E5E5E5] bg-[#141414] border-t-2 border-indigo-500 cursor-default"
                : "text-gray-500 hover:bg-white/5 border-t-2 border-transparent"
            }`}
          >
            <FileCode2
              className={`w-4 h-4 ${currentFile?.id === file.id ? "text-indigo-400" : ""}`}
            />
            <span>{file.path}</span>
          </div>
        ))}
        <button
          onClick={handleCreateFile}
          className="p-1 text-gray-500 hover:bg-white/10 rounded ml-2"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-[#141414] border border-white/5 p-4 rounded-xl shadow-sm">
            <div>
              <h2 className="font-semibold text-lg text-[#E5E5E5]">
                System Status
              </h2>
              <p className="text-sm text-gray-500">
                Orchestrator ready. Waiting for tasks.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">
                <Play className="w-4 h-4" />
                Run Pipeline
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#141414] border border-white/5 p-4 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="font-medium text-sm mb-1 text-gray-400">
                Active Branches
              </h3>
              <p className="text-2xl font-semibold text-[#E5E5E5]">1</p>
            </div>
            <div className="bg-[#141414] border border-white/5 p-4 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-medium text-sm mb-1 text-gray-400">
                Security Score
              </h3>
              <p className="text-2xl font-semibold text-[#E5E5E5]">100%</p>
            </div>
            <div className="bg-[#141414] border border-white/5 p-4 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-medium text-sm mb-1 text-gray-400">
                Performance
              </h3>
              <p className="text-2xl font-semibold text-[#E5E5E5]">A+</p>
            </div>
          </div>

          {/* Code Editor Space */}
          <div className="bg-[#141414] rounded-xl overflow-hidden border border-white/5 shadow-xl flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0F0F0F] border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="text-xs text-gray-500 font-mono ml-4">
                  {currentFile ? currentFile.path : "No file selected"}
                </div>
              </div>
              {currentFile && (
                <button
                  onClick={handleSave}
                  className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-colors"
                  title="Save File"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>
            {currentFile ? (
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-gray-300 resize-none outline-none leading-relaxed"
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-600">
                Select a file from the tabs above to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
