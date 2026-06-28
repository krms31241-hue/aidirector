import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppStore } from "../store";

export default function Layout() {
  const { theme, language } = useAppStore();

  return (
    <div
      className={`flex h-screen w-full bg-[#0A0A0A] text-[#E5E5E5] overflow-hidden font-sans ${theme}`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-hidden relative flex">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
