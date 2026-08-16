import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api, { getErrorMessage, FILE_BASE_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";

const STATUS_LABEL = {
  pending: "Menunggu Tinjauan Admin",
  diteruskan: "Menunggu Keputusan Pimpinan",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default function Cuti() {
  const { user } = useAuth();
  const { alert } = useModal();
  const [cuti, setCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCuti = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leaves");
      setCuti(res.data.data);
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal memuat data izin/cuti."), {
        title: "Gagal Memuat Data",
        danger: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCuti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin: meneruskan pengajuan ke Pimpinan
  const handleReview = async (id) => {
    try {
      await api.put(`/leaves/${id}/review`);
      await loadCuti();
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal meneruskan pengajuan."), {
        title: "Gagal Meneruskan",
        danger: true,
      });
    }
  };

  // Pimpinan: keputusan akhir
  const handleDecision = async (id, decision) => {
    try {
      await api.put(`/leaves/${id}/decision`, { decision });
      await loadCuti();
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal memberikan keputusan."), {
        title: "Gagal Menyimpan Keputusan",
        danger: true,
      });
    }
  };

  const statusStyle = (s) => {
    if (s === "approved") return "bg-green-100 text-green-700";
    if (s === "rejected") return "bg-red-100 text-red-600";
    return "bg-yellow-100 text-yellow-600";
  };

  const pendingCount = cuti.filter((c) => c.status === "pending").length;

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Izin/Cuti" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="relative">
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold z-10">
                {pendingCount}
              </span>
            )}
            <div className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
              {user?.role === "admin"
                ? "Pengajuan Menunggu Tinjauan"
                : "Pengajuan Menunggu Keputusan"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              Memuat data...
            </div>
          ) : cuti.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">
              Belum ada pengajuan izin/cuti.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Nama
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Jenis
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Tanggal
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Alasan
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Lampiran
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                    Status
                  </th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {cuti.map((c, i) => (
                  <tr
                    key={c.id}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-5 py-3 font-extrabold text-gray-800">
                      {c.user?.name}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-700 capitalize">
                      {c.jenis}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-500">
                      {c.tanggal_mulai} s/d {c.tanggal_selesai}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-500">
                      {c.alasan}
                    </td>
                    <td className="px-5 py-3">
                      {c.file_lampiran ? (
                        <a
                          href={`${FILE_BASE_URL}${c.file_lampiran}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                        >
                          <i className="fa-solid fa-paperclip"></i> Lihat File
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${statusStyle(c.status)}`}
                      >
                        {STATUS_LABEL[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user?.role === "admin" && c.status === "pending" && (
                        <button
                          onClick={() => handleReview(c.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600"
                        >
                          Teruskan
                        </button>
                      )}
                      {user?.role === "pimpinan" &&
                        c.status === "diteruskan" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecision(c.id, "approved")}
                              className="px-2 py-1 rounded text-xs font-bold text-white bg-green-600 hover:bg-green-700"
                            >
                              ✓ Setuju
                            </button>
                            <button
                              onClick={() => handleDecision(c.id, "rejected")}
                              className="px-2 py-1 rounded text-xs font-bold text-white bg-red-500 hover:bg-red-600"
                            >
                              ✕ Tolak
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
