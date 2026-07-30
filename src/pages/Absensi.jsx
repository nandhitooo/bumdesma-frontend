import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api, { getErrorMessage } from "../lib/api";

function formatJam(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toTimeString().slice(0, 5);
}

const STATUS_LABEL = {
  tepat_waktu: "Tepat Waktu",
  terlambat: "Terlambat",
  alpa: "Alpa",
  izin_cuti: "Izin/Cuti",
};

export default function Absensi() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ jam_masuk: "", jam_pulang: "", status: "tepat_waktu" });

  const loadAbsensi = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance", { params: { tanggal } });
      setAbsensi(res.data.data);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat data absensi."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAbsensi(); }, [tanggal]);

  const openEdit = (a) => {
    setEditData(a);
    setForm({
      jam_masuk: a.jam_masuk ? a.jam_masuk.slice(11, 16) : "",
      jam_pulang: a.jam_pulang ? a.jam_pulang.slice(11, 16) : "",
      status: a.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/attendance/${editData.id}`, {
        jam_masuk: form.jam_masuk ? `${tanggal}T${form.jam_masuk}:00` : null,
        jam_pulang: form.jam_pulang ? `${tanggal}T${form.jam_pulang}:00` : null,
        status: form.status,
      });
      setShowModal(false);
      await loadAbsensi();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyimpan koreksi absensi."));
    }
  };

  const statusColor = (s) => {
    if (s === "tepat_waktu") return "text-green-600";
    if (s === "terlambat") return "text-orange-500";
    if (s === "izin_cuti") return "text-blue-500";
    return "text-red-500";
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Absensi" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <i className="fa-solid fa-calendar-days text-gray-500"></i>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="outline-none text-sm font-semibold text-gray-700 bg-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">Memuat data...</div>
          ) : absensi.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">Belum ada data absensi pada tanggal ini.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Nama</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Masuk</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Pulang</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Status</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {absensi.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-5 py-3 font-extrabold text-gray-800">{a.user?.name}</td>
                    <td className="px-5 py-3 font-extrabold text-gray-800">{formatJam(a.jam_masuk)}</td>
                    <td className="px-5 py-3 font-extrabold text-gray-800">{formatJam(a.jam_pulang)}</td>
                    <td className={`px-5 py-3 font-bold ${statusColor(a.status)}`}>
                      {STATUS_LABEL[a.status] || a.status}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openEdit(a)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                      >
                        edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">
              Edit Absensi - {editData?.user?.name}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Jam Masuk</label>
                <input
                  type="time"
                  value={form.jam_masuk}
                  onChange={(e) => setForm({ ...form, jam_masuk: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Jam Pulang</label>
                <input
                  type="time"
                  value={form.jam_pulang}
                  onChange={(e) => setForm({ ...form, jam_pulang: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="tepat_waktu">Tepat Waktu</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="alpa">Alpa</option>
                  <option value="izin_cuti">Izin/Cuti</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90"
                style={{ backgroundColor: "#1a7a1a" }}
              >
                Simpan
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
