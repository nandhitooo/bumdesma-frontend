import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import api, { getErrorMessage } from '../lib/api';

export default function Pegawai() {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ nip: '', name: '', jabatan: '', temporaryPassword: '' });

  const loadPegawai = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { limit: 100 } });
      setPegawai(res.data.data);
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal memuat data pegawai.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPegawai(); }, []);

  const openAdd = () => {
    setEditData(null);
    setForm({ nip: '', name: '', jabatan: '', temporaryPassword: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setForm({ nip: p.nip, name: p.name, jabatan: p.jabatan || '', temporaryPassword: '' });
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
          alert('NIP dan password sementara wajib diisi untuk pegawai baru.');
          return;
        }
        await api.post('/users', form);
      }
      setShowModal(false);
      await loadPegawai();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal menyimpan data pegawai.'));
    }
  };

  const handleHapus = async (id) => {
    if (!window.confirm('Hapus pegawai ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      await loadPegawai();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal menghapus pegawai.'));
    }
  };

  const handleToggleStatus = async (p) => {
    const nextStatus = p.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${p.id}/status`, { status: nextStatus });
      await loadPegawai();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal mengubah status pegawai.'));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Pegawai" />
      <div className="p-6">
        <button
          onClick={openAdd}
          className="mb-5 px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ backgroundColor: '#1a7a1a' }}
        >
          <i className="fa-solid fa-plus"></i> Tambah Pegawai
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">Memuat data...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Nama</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Jabatan</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">NIP</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Status</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {pegawai.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-5 py-3 font-extrabold text-gray-800">{p.name}</td>
                    <td className="px-5 py-3 font-bold text-gray-700">{p.jabatan}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-gray-500">({p.nip})</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`font-bold ${p.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {p.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                        >edit</button>
                        <button
                          onClick={() => handleHapus(p.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                        >hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">
              {editData ? 'Edit Pegawai' : 'Tambah Pegawai'}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nama"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Jabatan"
                value={form.jabatan}
                onChange={e => setForm({ ...form, jabatan: e.target.value })}
              />
              {!editData && (
                <>
                  <input
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="NIP"
                    value={form.nip}
                    onChange={e => setForm({ ...form, nip: e.target.value })}
                  />
                  <input
                    type="password"
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Password Sementara"
                    value={form.temporaryPassword}
                    onChange={e => setForm({ ...form, temporaryPassword: e.target.value })}
                  />
                </>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90"
                style={{ backgroundColor: '#1a7a1a' }}
              >Simpan</button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200"
              >Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
