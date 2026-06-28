import { create } from "zustand";
import { AppState } from "./types";

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  language: "en",
  projects: [],
  currentProject: null,
  conversations: [],
  currentConversation: null,
  messages: [],
  files: [],
  currentFile: null,
  isSidebarOpen: true,
  providers: [],

  setTheme: (theme) => {
    set({ theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
  setLanguage: (language) => {
    set({ language });
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  },
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (currentConversation) => set({ currentConversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setFiles: (files) => set({ files }),
  setCurrentFile: (currentFile) => set({ currentFile }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setProviders: (providers) => set({ providers }),
}));
