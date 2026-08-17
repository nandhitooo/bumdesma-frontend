import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";

export default function Pegawai() {
  const { user } = useAuth();
  const { alert } = useModal();
  const isAdmin = user?.role === "admin"; // Pimpinan hanya boleh melihat daftar pegawai
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    nip: "",
    name: "",
    jabatan: "",
    temporaryPassword: "",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadPegawai = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { limit: 100 } });
      setPegawai(res.data.data);
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal memuat data pegawai."), {
        title: "Gagal Memuat Data",
        danger: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPegawai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditData(null);
    setForm({ nip: "", name: "", jabatan: "", temporaryPassword: "" });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setForm({
      nip: p.nip,
      name: p.name,
      jabatan: p.jabatan || "",
      temporaryPassword: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.jabatan) return;
    try {
      if (editData) {
        await api.put(`/users/${editData.id}`, {
          name: form.name,
          jabatan: form.jabatan,
        });
      } else {
        if (!form.nip || !form.temporaryPassword) {
          await alert(
            "NIP dan password sementara wajib diisi untuk pegawai baru.",
            {
              title: "Data Belum Lengkap",
            },
          );
          return;
        }
        await api.post("/users", form);
      }
      setShowModal(false);
      await loadPegawai();
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal menyimpan data pegawai."), {
        title: "Gagal Menyimpan",
        danger: true,
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadPegawai();
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal menghapus pegawai."), {
        title: "Gagal Menghapus",
        danger: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (p) => {
    const nextStatus = p.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`/users/${p.id}/status`, { status: nextStatus });
      await loadPegawai();
    } catch (err) {
      await alert(getErrorMessage(err, "Gagal mengubah status pegawai."), {
        title: "Gagal Mengubah Status",
        danger: true,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Pegawai" />
      <div className="p-4 md:p-6">
        {isAdmin && (
          <button
            onClick={openAdd}
            className="mb-5 w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            style={{ backgroundColor: "#1a7a1a" }}
          >
            <i className="fa-solid fa-plus"></i> Tambah Pegawai
          </button>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-sm font-semibold text-gray-500">
            Memuat data...
          </div>
        ) : pegawai.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <i className="fa-solid fa-users text-3xl text-gray-300 mb-2"></i>
            <p className="text-sm font-semibold text-gray-500">
              Belum ada data pegawai.
            </p>
          </div>
        ) : (
          <>
            {/* Tampilan kartu - mobile & tablet */}
            <div className="flex flex-col gap-3 lg:hidden">
              {pegawai.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-gray-800">
                        {p.name}
                      </div>
                      <div className="text-xs font-bold text-gray-500 mt-0.5">
                        {p.jabatan || "-"}
                      </div>
                    </div>
                    {isAdmin ? (
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                          p.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {p.status === "active" ? "Aktif" : "Non-Aktif"}
                      </button>
                    ) : (
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                          p.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {p.status === "active" ? "Aktif" : "Non-Aktif"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="font-bold text-gray-400">NIP</div>
                      <div className="font-semibold text-gray-700 break-all">
                        {p.nip}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-400">
                        Email Pemulihan
                      </div>
                      {p.email ? (
                        <div className="font-semibold text-gray-700 break-all">
                          {p.email}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-600 font-bold">
                          <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                          Belum diisi
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openEdit(p)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tampilan tabel - desktop */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                        Nama
                      </th>
                      <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                        Jabatan
                      </th>
                      <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                        NIP
                      </th>
                      <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                        Email Pemulihan
                      </th>
                      <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">
                        Status
                      </th>
                      {isAdmin && <th className="px-5 py-4"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pegawai.map((p, i) => (
                      <tr
                        key={p.id}
                        className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-5 py-3 font-extrabold text-gray-800">
                          {p.name}
                        </td>
                        <td className="px-5 py-3 font-bold text-gray-700">
                          {p.jabatan}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold text-gray-500">
                          {p.nip}
                        </td>
                        <td className="px-5 py-3 text-xs font-semibold">
                          {p.email ? (
                            <span className="text-gray-700">{p.email}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-600 font-bold">
                              <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                              Belum diisi
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {isAdmin ? (
                            <button
                              onClick={() => handleToggleStatus(p)}
                              className={`font-bold ${p.status === "active" ? "text-green-600" : "text-gray-400"}`}
                            >
                              {p.status === "active" ? "Aktif" : "Non-Aktif"}
                            </button>
                          ) : (
                            <span
                              className={`font-bold ${p.status === "active" ? "text-green-600" : "text-gray-400"}`}
                            >
                              {p.status === "active" ? "Aktif" : "Non-Aktif"}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(p)}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                              >
                                edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                              >
                                hapus
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah/Edit - hanya bisa dibuka Admin, jadi cukup dijaga oleh tombol di atas */}
      {isAdmin && showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">
              {editData ? "Edit Pegawai" : "Tambah Pegawai"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nama"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Jabatan"
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              />
              {!editData && (
                <>
                  <input
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="NIP"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  />
                  <input
                    type="password"
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Password Sementara"
                    value={form.temporaryPassword}
                    onChange={(e) =>
                      setForm({ ...form, temporaryPassword: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-400 font-semibold -mt-1">
                    Karyawan akan diminta mengisi email pemulihan sendiri saat
                    pertama kali login.
                  </p>
                </>
              )}
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

      {/* Modal Konfirmasi Hapus - hanya relevan untuk Admin */}
      {isAdmin && deleteTarget && (
        <ConfirmDeleteModal
          title="Hapus Pegawai"
          message={`Tindakan ini akan menghapus data pegawai "${deleteTarget.name}" secara permanen. Tindakan ini tidak dapat dibatalkan.`}
          confirmText={deleteTarget.name}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
