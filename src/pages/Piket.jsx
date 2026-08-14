import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import SaturdayPicker from "../components/SaturdayPicker";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Mencari Sabtu terdekat (hari ini kalau kebetulan Sabtu, atau Sabtu berikutnya)
// sebagai tanggal default saat halaman pertama kali dibuka.
function defaultSaturday() {
  const d = new Date();
  const diff = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function Piket() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tanggal, setTanggal] = useState(defaultSaturday());
  const [piket, setPiket] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const requests = [
        api.get("/piket", { params: { start: tanggal, end: tanggal } }),
      ];
      if (isAdmin) {
        requests.push(
          api.get("/users", { params: { role: "karyawan", limit: 100 } }),
        );
      }
      const [piketRes, pegawaiRes] = await Promise.all(requests);
      setPiket(piketRes.data.data);
      if (pegawaiRes) setPegawaiList(pegawaiRes.data.data);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat data piket."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tanggal]);

  const openAssign = () => {
    setForm({ userId: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.userId) return;
    const dayOfWeek = new Date(`${tanggal}T00:00:00`).getDay();
    if (dayOfWeek !== 6) {
      alert("Jadwal piket hanya berlaku untuk hari Sabtu.");
      return;
    }
    try {
      await api.post("/piket", { tanggal, userIds: [form.userId] });
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyimpan jadwal piket."));
    }
  };

  const handleHapus = async (id) => {
    if (!window.confirm("Hapus jadwal piket ini?")) return;
    try {
      await api.delete(`/piket/${id}`);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus jadwal piket."));
    }
  };

  const [notifyingId, setNotifyingId] = useState(null);

  const handleNotify = async (p) => {
    if (!window.confirm(`Kirim notifikasi piket ke ${p.user?.name}?`)) return;
    setNotifyingId(p.id);
    try {
      await api.post(`/piket/${p.id}/notify`);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengirim notifikasi."));
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Piket" />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <div className="text-sm font-bold text-gray-600 mb-1.5">
              Jadwal Piket (Sabtu)
            </div>
            <SaturdayPicker value={tanggal} onChange={setTanggal} />
          </div>
          {isAdmin && (
            <button
              onClick={openAssign}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all w-fit"
              style={{ backgroundColor: "#1a7a1a" }}
            >
              <i className="fa-solid fa-user-plus"></i> Assign Piket
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              Memuat data...
            </div>
          ) : piket.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              Belum ada jadwal piket pada tanggal ini.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Nama
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Tanggal
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Notifikasi
                  </th>
                  {isAdmin && <th className="px-5 py-4"></th>}
                </tr>
              </thead>
              <tbody>
                {piket.map((p, i) => (
                  <tr
                    key={p.id}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-5 py-3 font-extrabold text-gray-800">
                      {p.user?.name}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-600 text-sm">
                      {p.tanggal}
                    </td>
                    <td className="px-5 py-3">
                      {p.notification_sent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-green-700 bg-green-100">
                          <i className="fa-solid fa-circle-check"></i> Terkirim
                        </span>
                      ) : isAdmin ? (
                        <button
                          onClick={() => handleNotify(p)}
                          disabled={notifyingId === p.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all inline-flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-bell"></i>
                          {notifyingId === p.id
                            ? "Mengirim..."
                            : "Kirim Notifikasi"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-400 bg-gray-100">
                          Belum Terkirim
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleHapus(p.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                        >
                          hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAdmin && showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">
              Assign Piket ({tanggal})
            </h2>
            <div className="flex flex-col gap-3">
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Pilih Pegawai</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
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
