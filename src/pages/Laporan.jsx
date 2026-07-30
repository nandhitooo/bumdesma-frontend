import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api, { getErrorMessage } from "../lib/api";

function getPeriodeRange(periode) {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start;
  if (periode === "Bulan Lalu") {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    start = d.toISOString().slice(0, 10);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end: endLastMonth.toISOString().slice(0, 10) };
  }
  if (periode === "3 Bulan Terakhir") {
    const d = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    start = d.toISOString().slice(0, 10);
  } else if (periode === "Tahun Ini") {
    start = `${now.getFullYear()}-01-01`;
  } else {
    start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }
  return { start, end };
}

export default function Laporan() {
  const [periode, setPeriode] = useState("Bulan Ini");
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { start, end } = getPeriodeRange(periode);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/summary", { params: { start, end } });
      setRecap(res.data.data.recap);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat rekap laporan."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, [periode]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await api.get("/reports/attendance/export", {
        params: { start, end, format },
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-absensi-${start}_${end}.${format === "xlsx" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengekspor laporan."));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Laporan Absensi" />
      <div className="p-6">
        {/* Filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-fit mb-6">
          <i className="fa-solid fa-calendar-days text-gray-500"></i>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="outline-none text-sm font-semibold text-gray-700 bg-transparent"
          >
            <option>Bulan Ini</option>
            <option>Bulan Lalu</option>
            <option>3 Bulan Terakhir</option>
            <option>Tahun Ini</option>
          </select>
        </div>

        {loading || !recap ? (
          <div className="p-6 text-center text-sm font-semibold text-gray-500">Memuat data...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "#a8d5a2" }}>
                <div className="font-extrabold text-gray-800 text-base mb-3">Total Kehadiran</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-user-check text-3xl text-gray-700"></i>
                    <span className="text-4xl font-extrabold text-gray-800">
                      {recap.tepatWaktu + recap.terlambat}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <i className="fa-solid fa-clock text-gray-600 text-xs"></i>
                      <span>on-time <span className="font-extrabold">{recap.tepatWaktu}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <i className="fa-solid fa-clock text-orange-600 text-xs"></i>
                      <span>terlambat <span className="font-extrabold">{recap.terlambat}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "#f5e642" }}>
                <div className="font-extrabold text-gray-800 text-base mb-3">Total Izin/Cuti</div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-lines text-3xl text-gray-700"></i>
                  <span className="text-4xl font-extrabold text-gray-800">{recap.izinCuti}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="rounded-2xl p-5 shadow-sm w-full max-w-lg" style={{ backgroundColor: "#f5a8a8" }}>
                <div className="font-extrabold text-gray-800 text-base mb-3">Total Alpa</div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-user-xmark text-3xl text-gray-700"></i>
                  <span className="text-4xl font-extrabold text-gray-800">{recap.alpa}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exporting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all bg-red-500 disabled:opacity-60"
                >
                  <i className="fa-solid fa-file-pdf"></i> Export PDF
                </button>
                <button
                  onClick={() => handleExport("xlsx")}
                  disabled={exporting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ backgroundColor: "#1a7a1a" }}
                >
                  <i className="fa-solid fa-table"></i> Spreadsheet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
