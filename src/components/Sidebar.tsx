import {
  FolderKanban,
  MessageSquare,
  Plus,
  ChevronRight,
  FileCode2,
} from "lucide-react";
import { useAppStore } from "../store";
import { motion, AnimatePresence } from "motion/react";

export default function Sidebar() {
  const {
    isSidebarOpen,
    projects,
    currentProject,
    setCurrentProject,
    setCurrentConversation,
  } = useAppStore();

  const handleNewProject = async () => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Project ${projects.length + 1}`,
          description: "New AI Orchestrated Project",
        }),
      });
      const data = await res.json();
      setCurrentProject(data);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    useAppStore.getState().setProjects(data);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full border-r border-white/5 bg-[#0F0F0F] flex flex-col shrink-0 overflow-hidden"
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Projects
              </h2>
              <button
                onClick={handleNewProject}
                className="p-1 hover:bg-white/10 rounded text-gray-400"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project);
                    setCurrentConversation(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between group transition-colors ${currentProject?.id === project.id ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-white/5 text-gray-400 hover:text-gray-300"}`}
                >
                  <span className="truncate">{project.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-gray-500 italic p-2">
                  No projects yet.
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-2 text-sm text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                  AI
                </div>
                <div>
                  <div className="font-medium text-gray-200">
                    Director Engine
                  </div>
                  <div className="text-xs text-gray-500">v1.0.0-beta</div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
