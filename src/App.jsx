import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatBox from "./ChatBox";
import "./styles.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const closeSidebar = () => { if (!pinned) setSidebarOpen(false); };

  const shifted = sidebarOpen || pinned;        // sidebar affects layout
  const appClass = shifted ? "app shifted" : "app";

  return (
    <div className={appClass}>
      <Navbar onLogoClick={toggleSidebar} />

      <Sidebar
        open={sidebarOpen}
        pinned={pinned}
        onClose={closeSidebar}
        onTogglePin={() => setPinned(p => !p)}
      />

      <main className="main" onClick={sidebarOpen && !pinned ? closeSidebar : undefined}>
        {/* layoutKey forces ChatBox to re-measure after layout shifts */}
        <ChatBox layoutKey={shifted ? "shifted" : "normal"} />
      </main>
    </div>
  );
}
