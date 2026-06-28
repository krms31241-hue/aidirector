import { Menu, Moon, Sun, Languages, Bell, Settings } from "lucide-react";
import { useAppStore } from "../store";

export default function Header() {
  const { toggleSidebar, theme, setTheme, language, setLanguage } =
    useAppStore();

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0F0F0F]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/5 text-gray-400 hover:text-gray-300 rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AI Director
        </h1>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <button className="p-2 hover:bg-white/5 hover:text-gray-300 rounded-md relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="p-2 hover:bg-white/5 hover:text-gray-300 rounded-md flex items-center gap-2 text-sm font-medium"
        >
          <Languages className="w-5 h-5" />
          <span className="hidden sm:inline">{language.toUpperCase()}</span>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 hover:bg-white/5 hover:text-gray-300 rounded-md"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
        <button className="p-2 hover:bg-white/5 hover:text-gray-300 rounded-md">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
