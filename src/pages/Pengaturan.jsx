import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import api, { getErrorMessage } from '../lib/api';

function ModalWrapper({ title, children, onClose, onSave, saving }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-extrabold text-gray-800 mb-4">{title}</h2>
        {children}
        <div className="flex gap-3 mt-5">
          <button onClick={onSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: '#1a7a1a' }}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200">Batal</button>
        </div>
      </div>
    </div>
  );
}

function JamKerjaModal({ onClose, onSaved }) {
  const [masuk, setMasuk] = useState('08:30');
  const [pulang, setPulang] = useState('15:00');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/work-schedule/reguler', { start_time: `${masuk}:00`, end_time: `${pulang}:00` });
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal menyimpan jam kerja.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Jam Kerja (Senin - Jumat)" onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Jam Masuk</label>
          <input type="time" value={masuk} onChange={e => setMasuk(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Jam Pulang</label>
          <input type="time" value={pulang} onChange={e => setPulang(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
        </div>
      </div>
    </ModalWrapper>
  );
}

function LokasiModal({ onClose, onSaved }) {
  const [lat, setLat] = useState('-7.8000');
  const [lng, setLng] = useState('111.9500');
  const [radius, setRadius] = useState('100');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        office_latitude: lat,
        office_longitude: lng,
        geofence_radius_meters: radius,
      });
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal menyimpan lokasi kantor.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Lokasi Kantor" onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="flex flex-col gap-3">
        <input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
        <input placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
        <input placeholder="Radius (meter)" value={radius} onChange={e => setRadius(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
      </div>
    </ModalWrapper>
  );
}

function PasswordModal({ onClose }) {
  const [form, setForm] = useState({ old: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.new !== form.confirm) {
      alert('Konfirmasi password baru tidak cocok.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { oldPassword: form.old, newPassword: form.new });
      alert('Password berhasil diganti.');
      onClose();
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal mengganti password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Ganti Password" onClose={onClose} onSave={handleSave} saving={saving}>
      <div className="flex flex-col gap-3">
        <input type="password" placeholder="Password Lama" value={form.old} onChange={e => setForm({ ...form, old: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
        <input type="password" placeholder="Password Baru" value={form.new} onChange={e => setForm({ ...form, new: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
        <input type="password" placeholder="Konfirmasi Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400" />
      </div>
    </ModalWrapper>
  );
}

// Menampilkan seluruh parameter sistem yang sedang aktif (kecuali password,
// yang tidak pernah ditampilkan/di-fetch dari mana pun): radius geofencing,
// lokasi kantor (embed Google Maps), jam kerja per hari, dan hari libur.
function InfoSistem({ data }) {
  if (!data) return null;
  const { settings = {}, workSchedules = [] } = data;

  const lat = settings.office_latitude;
  const lng = settings.office_longitude;
  const radius = settings.geofence_radius_meters;

  let holidays = [];
  try {
    const raw = settings.national_holidays;
    holidays = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  } catch {
    holidays = [];
  }

  const hasCoords = lat !== undefined && lat !== null && lat !== '' &&
    lng !== undefined && lng !== null && lng !== '';
  const mapsSrc = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`
    : null;

  return (
    <div className="mb-8 flex flex-col gap-4">
      <h2 className="text-lg font-extrabold text-gray-800">Info Sistem</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
            <i className="fa-solid fa-satellite-dish text-green-700"></i> Radius Geofencing
          </div>
          <div className="text-3xl font-extrabold text-gray-800">
            {radius ?? '-'} <span className="text-base font-bold text-gray-400">meter</span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-2">
            Karyawan hanya bisa melakukan absensi jika berada dalam radius ini dari titik kantor.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
            <i className="fa-solid fa-location-dot text-green-700"></i> Koordinat Kantor
          </div>
          <div className="text-sm font-bold text-gray-800">Latitude: {lat ?? '-'}</div>
          <div className="text-sm font-bold text-gray-800">Longitude: {lng ?? '-'}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
          <i className="fa-solid fa-map-location-dot text-green-700"></i> Lokasi Kantor
        </div>
        {mapsSrc ? (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <iframe
              title="Lokasi Kantor"
              src={mapsSrc}
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        ) : (
          <p className="text-sm text-gray-500 font-semibold">Koordinat kantor belum diatur.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
          <i className="fa-solid fa-business-time text-green-700"></i> Jam Kerja
        </div>
        {workSchedules.length === 0 ? (
          <p className="text-sm text-gray-500 font-semibold">Belum ada jadwal kerja.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 font-bold">
                <th className="py-2 pr-3">Jadwal</th>
                <th className="py-2 pr-3">Masuk</th>
                <th className="py-2 pr-3">Pulang</th>
                <th className="py-2 pr-3">Toleransi</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {workSchedules.map((ws) => (
                <tr key={ws.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 font-extrabold text-gray-800">{ws.label}</td>
                  <td className="py-2 pr-3 font-semibold text-gray-700">{ws.start_time?.slice(0, 5)}</td>
                  <td className="py-2 pr-3 font-semibold text-gray-700">{ws.end_time?.slice(0, 5)}</td>
                  <td className="py-2 pr-3 font-semibold text-gray-700">{ws.late_tolerance_minutes} menit</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ws.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {ws.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
          <i className="fa-solid fa-calendar-day text-green-700"></i> Hari Libur Nasional
        </div>
        {holidays.length === 0 ? (
          <p className="text-sm text-gray-500 font-semibold">Belum ada hari libur yang ditetapkan.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {holidays.map((h) => (
              <span key={h} className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">{h}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pengaturan() {
  const [activeModal, setActiveModal] = useState(null);
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      setSettingsData(res.data.data);
    } catch (err) {
      alert(getErrorMessage(err, 'Gagal memuat info sistem.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const cards = [
    { id: 'jam', icon: 'fa-clock', label: 'Jam Kerja' },
    { id: 'lokasi', icon: 'fa-location-dot', label: 'Lokasi Kantor' },
    { id: 'password', icon: 'fa-lock', label: 'Ganti Password' },
  ];

  const close = () => setActiveModal(null);
  const saved = () => { close(); loadSettings(); };

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Pengaturan" />
      <div className="p-6">
        {loading ? (
          <div className="mb-8 text-center text-sm font-semibold text-gray-500">Memuat info sistem...</div>
        ) : (
          <InfoSistem data={settingsData} />
        )}

        <h2 className="text-lg font-extrabold text-gray-800 mb-4">Ubah Pengaturan</h2>
        <div className="flex gap-4 flex-wrap">
          {cards.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveModal(c.id)}
              className="w-36 h-36 rounded-2xl text-white flex flex-col items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              style={{ backgroundColor: '#1a7a1a' }}
            >
              <i className={`fa-solid ${c.icon} text-3xl`}></i>
              <span className="font-extrabold text-sm text-center leading-tight">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeModal === 'jam' && <JamKerjaModal onClose={close} onSaved={saved} />}
      {activeModal === 'lokasi' && <LokasiModal onClose={close} onSaved={saved} />}
      {activeModal === 'password' && <PasswordModal onClose={close} />}
    </div>
  );
}
