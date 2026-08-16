import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";

function formatJam(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toTimeString().slice(0, 5);
}

const STATUS_LABEL = {
  tepat_waktu: "Tepat Waktu",
  terlambat: "Terlambat",
  alpa: "Alpa",
  izin_cuti: "Izin/Cuti",
  lembur: "Lembur",
};

export default function Absensi() {
  const { user } = useAuth();
  const { alert } = useModal();
  const canEdit = user?.role === "admin"; // Pimpinan hanya boleh melihat, backend juga menolak PUT-nya
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [pegawai, setPegawai] = useState([]);
  const [absensi, setAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    jam_masuk: "",
    jam_pulang: "",
    status: "alpa",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pegawaiRes, absensiRes] = await Promise.all([
        api.get("/users", { params: { role: "karyawan", limit: 100 } }),
        api.get("/attendance", { params: { tanggal } }),
      ]);
      setPegawai(pegawaiRes.data.data);
      setAbsensi(absensiRes.data.data);
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal memuat data absensi."), {
        title: "Gagal Memuat Data",
        danger: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggal]);

  // Gabungkan seluruh pegawai dengan data absensinya pada tanggal terpilih.
  // Pegawai yang belum memiliki catatan absensi tetap ditampilkan sebagai
  // "Belum Absen" agar Admin bisa memantau dan mengoreksi siapa saja yang
  // belum tercatat kehadirannya.
  const rows = pegawai.map((p) => {
    const rec = absensi.find((a) => (a.user?.id ?? a.userId) === p.id);
    return {
      userId: p.id,
      attendanceId: rec?.id ?? null,
      nama: p.name,
      jabatan: p.jabatan,
      jam_masuk: rec?.jam_masuk ?? null,
      jam_pulang: rec?.jam_pulang ?? null,
      status: rec?.status ?? null,
    };
  });

  const belumAbsenCount = rows.filter((r) => !r.attendanceId).length;

  const openEdit = (row) => {
    setEditData(row);
    setForm({
      jam_masuk: row.jam_masuk
        ? new Date(row.jam_masuk).toTimeString().slice(0, 5)
        : "",
      jam_pulang: row.jam_pulang
        ? new Date(row.jam_pulang).toTimeString().slice(0, 5)
        : "",
      status: row.status || "alpa",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      jam_masuk: form.jam_masuk
        ? `${tanggal}T${form.jam_masuk}:00+07:00`
        : null,
      jam_pulang: form.jam_pulang
        ? `${tanggal}T${form.jam_pulang}:00+07:00`
        : null,
      status: form.status,
    };
    try {
      if (editData.attendanceId) {
        await api.put(`/attendance/${editData.attendanceId}`, payload);
      } else {
        await api.post("/attendance", {
          userId: editData.userId,
          tanggal,
          ...payload,
        });
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal menyimpan koreksi absensi."), {
        title: "Gagal Menyimpan",
        danger: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s) => {
    if (s === "tepat_waktu" || s === "lembur") return "text-green-600";
    if (s === "terlambat") return "text-orange-500";
    if (s === "izin_cuti") return "text-blue-500";
    if (s === "alpa") return "text-red-500";
    return "text-gray-400"; // belum absen
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Absensi" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <i className="fa-solid fa-calendar-days text-gray-500"></i>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="outline-none text-sm font-semibold text-gray-700 bg-transparent"
            />
          </div>

          {!loading && rows.length > 0 && (
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
              {rows.length - belumAbsenCount} / {rows.length} karyawan sudah
              absen
              {belumAbsenCount > 0 && (
                <span className="ml-2 text-red-500">
                  ({belumAbsenCount} belum absen)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              Memuat data...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              Belum ada data pegawai.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Nama
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Jabatan
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Masuk
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Pulang
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Status
                  </th>
                  {canEdit && <th className="px-5 py-4"></th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.userId}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-5 py-3 font-extrabold text-gray-800">
                      {r.nama}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-600 text-sm">
                      {r.jabatan || "-"}
                    </td>
                    <td className="px-5 py-3 font-extrabold text-gray-800">
                      {formatJam(r.jam_masuk)}
                    </td>
                    <td className="px-5 py-3 font-extrabold text-gray-800">
                      {formatJam(r.jam_pulang)}
                    </td>
                    <td
                      className={`px-5 py-3 font-bold ${statusColor(r.status)}`}
                    >
                      {r.status
                        ? STATUS_LABEL[r.status] || r.status
                        : "Belum Absen"}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openEdit(r)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                        >
                          edit
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-800 mb-1">
              Edit Absensi - {editData?.nama}
            </h2>
            {!editData?.attendanceId && (
              <p className="text-xs font-semibold text-gray-400 mb-3">
                Karyawan ini belum memiliki catatan absensi pada tanggal ini.
                Menyimpan akan membuat data absensi baru.
              </p>
            )}
            <div className="flex flex-col gap-3 mt-3">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={form.jam_masuk}
                  onChange={(e) =>
                    setForm({ ...form, jam_masuk: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Jam Pulang
                </label>
                <input
                  type="time"
                  value={form.jam_pulang}
                  onChange={(e) =>
                    setForm({ ...form, jam_pulang: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="tepat_waktu">Tepat Waktu</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="alpa">Alpa</option>
                  <option value="izin_cuti">Izin/Cuti</option>
                  <option value="lembur">Lembur</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#1a7a1a" }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
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
