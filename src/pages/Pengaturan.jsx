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

export default function Pengaturan() {
  const [activeModal, setActiveModal] = useState(null);
  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data.data);
    } catch (err) {
      // Diam-diam gagal; halaman tetap bisa dipakai untuk mengubah setting
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
        {settings?.settings && (
          <div className="mb-5 bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600 font-semibold">
            Radius geofencing saat ini: <span className="font-extrabold text-gray-800">{settings.settings.geofence_radius_meters || '-'} meter</span>
          </div>
        )}
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
