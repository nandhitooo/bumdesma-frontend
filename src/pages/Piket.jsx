import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import api, { getErrorMessage } from '../lib/api';

export default function Piket() {
  const [tanggal, setTanggal] = useState('2026-08-01');
  const [piket, setPiket] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ userId: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [piketRes, pegawaiRes] = await Promise.all([
        api.get('/piket', { params: { start: tanggal, end: tanggal } }),
        api.get('/users', { params: { role: 'karyawan', limit: 100 } }),
      ]);
      setPiket(piketRes.data.data);
      setPegawaiList(pegawaiRes.data.data);
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal memuat data piket.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [tanggal]);

  const openAssign = () => {
    setForm({ userId: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.userId) return;
    const dayOfWeek = new Date(`${tanggal}T00:00:00`).getDay();
    if (dayOfWeek !== 6) {
      alert('Jadwal piket hanya berlaku untuk hari Sabtu.');
      return;
    }
    try {
      await api.post('/piket', { tanggal, userIds: [form.userId] });
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal menyimpan jadwal piket.'));
    }
  };

  const handleHapus = async (id) => {
    if (!window.confirm('Hapus jadwal piket ini?')) return;
    try {
      await api.delete(`/piket/${id}`);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal menghapus jadwal piket.'));
    }
  };

  const dateObj = new Date(`${tanggal}T00:00:00`);
  const hariIni = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Piket" />
      <div className="p-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-sm font-bold text-gray-600 mb-1.5">Piket Hari {hariIni}</div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-fit">
              <i className="fa-solid fa-calendar-days text-gray-500"></i>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                className="outline-none text-sm font-semibold text-gray-700 bg-transparent" />
            </div>
          </div>
          <button
            onClick={openAssign}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
            style={{ backgroundColor: '#1a7a1a' }}
          >
            <i className="fa-solid fa-user-plus"></i> Assign Piket
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">Memuat data...</div>
          ) : piket.length === 0 ? (
            <div className="p-6 text-center text-sm font-semibold text-gray-500">Belum ada jadwal piket pada tanggal ini.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Nama</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Departemen</th>
                  <th className="text-left px-5 py-4 text-sm font-extrabold text-gray-700">Tanggal</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {piket.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-5 py-3 font-extrabold text-gray-800">{p.user?.name}</td>
                    <td className="px-5 py-3 font-semibold text-gray-600 text-sm">{p.user?.departemen || '-'}</td>
                    <td className="px-5 py-3 font-semibold text-gray-600 text-sm">{p.tanggal}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleHapus(p.id)} className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all">hapus</button>
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
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Assign Piket ({tanggal})</h2>
            <div className="flex flex-col gap-3">
              <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400">
                <option value="">Pilih Pegawai</option>
                {pegawaiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90" style={{ backgroundColor: '#1a7a1a' }}>Simpan</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
