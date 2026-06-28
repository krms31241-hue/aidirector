import { useEffect } from "react";
import { useAppStore } from "../store";
import ChatInterface from "./ChatInterface";
import Workspace from "./Workspace";

export default function MainArea() {
  const { currentProject, setProjects, setCurrentProject } = useAppStore();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.length > 0) {
          setProjects(data);
          if (!currentProject) {
            setCurrentProject(data[0]);
          }
        } else {
          // Auto create first project
          const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "My First Project",
              description: "Auto generated project",
            }),
          });
          const newProject = await res.json();
          setProjects([newProject]);
          setCurrentProject(newProject);
        }
      });
  }, []);

  if (!currentProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0A0A0A]">
        <div className="w-16 h-16 mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-2xl">🏗️</span>
        </div>
        <h2 className="text-xl font-medium text-gray-300">
          Welcome to AI Director
        </h2>
        <p className="mt-2 text-sm max-w-md text-center text-gray-500">
          Create a new project from the sidebar to start orchestrating AI
          agents.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="flex-[6] min-w-0 h-full border-r border-white/5">
        <Workspace />
      </div>
      <div className="flex-[4] min-w-0 h-full bg-[#0d0d0d]">
        <ChatInterface />
      </div>
    </div>
  );
}
