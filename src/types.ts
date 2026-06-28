export type Theme = "light" | "dark";
export type Language = "en" | "ar";

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderStats {
  status: "online" | "offline" | "degraded";
  latency: number;
  availability: number;
  requestCount: number;
  successRate: number;
  errorCount: number;
}

export interface ProviderCapabilities {
  retrySupport: boolean;
  streamingSupport: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  stats: ProviderStats;
  capabilities: ProviderCapabilities;
}

export interface AppState {
  theme: Theme;
  language: Language;
  projects: Project[];
  currentProject: Project | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  files: ProjectFile[];
  currentFile: ProjectFile | null;
  isSidebarOpen: boolean;
  providers: AIProvider[];

  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setFiles: (files: ProjectFile[]) => void;
  setCurrentFile: (file: ProjectFile | null) => void;
  toggleSidebar: () => void;
  setProviders: (providers: AIProvider[]) => void;
}
