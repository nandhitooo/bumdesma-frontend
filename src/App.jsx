import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pegawai from "./pages/Pegawai";
import Absensi from "./pages/Absensi";
import Piket from "./pages/Piket";
import Cuti from "./pages/Cuti";
import Laporan from "./pages/Laporan";
import Pengaturan from "./pages/Pengaturan";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Belum login (atau token kedaluwarsa) -> tampilkan halaman Login
  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "pegawai":
        return <Pegawai />;
      case "absensi":
        return <Absensi />;
      case "piket":
        return <Piket />;
      case "cuti":
        return <Cuti />;
      case "laporan":
        return <Laporan />;
      case "pengaturan":
        return <Pengaturan />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-200 md:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <Sidebar
        activePage={page}
        setPage={setPage}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 shadow-sm"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <span className="text-lg font-bold text-green-700">BUMDESMA</span>
          </div>
        </div>
        {renderPage()}
      </div>
    </div>
  );
}
