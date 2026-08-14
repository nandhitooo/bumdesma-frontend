import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import api, { getErrorMessage, FILE_BASE_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function ModalWrapper({
  title,
  children,
  onClose,
  onSave,
  saving,
  saveLabel = "Simpan",
  savingLabel = "Menyimpan...",
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-extrabold text-gray-800 mb-4">{title}</h2>
        {children}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#1a7a1a" }}
          >
            {saving ? savingLabel : saveLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// Jadwal kerja reguler (Senin-Jumat) dan piket (Sabtu) sekarang diedit
// terpisah lewat tombol "edit" di masing-masing baris tabel, bukan lewat
// satu form gabungan seperti sebelumnya.
function JadwalKerjaModal({ schedule, dayLabel, onClose, onSaved }) {
  const [masuk, setMasuk] = useState(schedule?.start_time?.slice(0, 5) || "");
  const [pulang, setPulang] = useState(schedule?.end_time?.slice(0, 5) || "");
  const [toleransi, setToleransi] = useState(
    schedule?.late_tolerance_minutes ?? 15,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/settings/work-schedule/${schedule.day_type}`, {
        start_time: `${masuk}:00`,
        end_time: `${pulang}:00`,
        late_tolerance_minutes: Number(toleransi),
      });
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyimpan jadwal kerja."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      title={`Jam Kerja - ${dayLabel}`}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            Jam Masuk
          </label>
          <input
            type="time"
            value={masuk}
            onChange={(e) => setMasuk(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            Jam Pulang
          </label>
          <input
            type="time"
            value={pulang}
            onChange={(e) => setPulang(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            Toleransi Keterlambatan (menit)
          </label>
          <input
            type="number"
            min="0"
            value={toleransi}
            onChange={(e) => setToleransi(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
    </ModalWrapper>
  );
}

// Koordinat kantor. Dipisah dari radius geofencing supaya masing-masing
// parameter bisa diubah tanpa perlu mengetik ulang parameter yang lain.
function LokasiModal({ settings, onClose, onSaved }) {
  const [lat, setLat] = useState(settings?.office_latitude ?? "");
  const [lng, setLng] = useState(settings?.office_longitude ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings", {
        office_latitude: lat,
        office_longitude: lng,
      });
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyimpan lokasi kantor."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      title="Lokasi Kantor"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            Latitude
          </label>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">
            Longitude
          </label>
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>
    </ModalWrapper>
  );
}

// Radius geofencing, terpisah dari koordinat kantor.
function RadiusModal({ settings, onClose, onSaved }) {
  const [radius, setRadius] = useState(settings?.geofence_radius_meters ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings", { geofence_radius_meters: radius });
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menyimpan radius geofencing."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      title="Radius Geofencing"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 block">
          Radius (meter)
        </label>
        <input
          type="number"
          min="1"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
        />
        <p className="text-xs text-gray-400 font-semibold mt-2">
          Pegawai hanya bisa absen jika berada dalam radius ini dari titik
          koordinat kantor.
        </p>
      </div>
    </ModalWrapper>
  );
}

function PasswordModal({ onClose }) {
  const [form, setForm] = useState({ old: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.new !== form.confirm) {
      alert("Konfirmasi password baru tidak cocok.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword: form.old,
        newPassword: form.new,
      });
      alert("Password berhasil diganti.");
      onClose();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal mengganti password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      title="Ganti Password"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div className="flex flex-col gap-3">
        <input
          type="password"
          placeholder="Password Lama"
          value={form.old}
          onChange={(e) => setForm({ ...form, old: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="password"
          placeholder="Password Baru"
          value={form.new}
          onChange={(e) => setForm({ ...form, new: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
    </ModalWrapper>
  );
}

// Generate/regenerasi QR Code statis. Sesuai alur di laporan: Admin
// men-generate satu kali lewat halaman Pengaturan, QR Code lama otomatis
// dinonaktifkan setiap kali regenerasi dilakukan.
function GenerateQrModal({ hasExisting, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    setSaving(true);
    try {
      await api.post("/settings/qr-code/generate");
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal men-generate QR Code."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      title={hasExisting ? "Regenerasi QR Code" : "Generate QR Code"}
      onClose={onClose}
      onSave={handleGenerate}
      saving={saving}
      saveLabel={hasExisting ? "Regenerasi Sekarang" : "Generate Sekarang"}
      savingLabel="Memproses..."
    >
      <p className="text-sm text-gray-600 font-semibold leading-relaxed">
        {hasExisting
          ? "QR Code yang lama akan otomatis dinonaktifkan dan diganti dengan yang baru. Pastikan gambar QR yang tercetak di kantor segera diganti setelah ini, karena QR Code lama tidak lagi bisa dipakai untuk absen."
          : "Sistem akan membuat QR Code statis untuk titik absensi kantor. QR Code ini berlaku selamanya dan dapat dicetak untuk dipasang di kantor."}
      </p>
    </ModalWrapper>
  );
}

// Menambahkan tanggal hari libur nasional / cuti bersama. Tanggal yang
// masuk daftar ini akan otomatis menutup akses scanning karyawan pada
// tanggal tersebut.
function HariLiburModal({ existing, onClose, onSaved }) {
  const [tanggal, setTanggal] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tanggal) return;
    if (existing.includes(tanggal)) {
      alert("Tanggal ini sudah ada di daftar hari libur.");
      return;
    }
    setSaving(true);
    try {
      const next = [...existing, tanggal].sort();
      await api.put("/settings", { national_holidays: next });
      onSaved();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menambahkan hari libur."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      title="Tambah Hari Libur Nasional"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      <div>
        <label className="text-xs font-bold text-gray-500 mb-1 block">
          Tanggal
        </label>
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
        />
        <p className="text-xs text-gray-400 font-semibold mt-2">
          Karyawan tidak akan bisa melakukan absensi pada tanggal yang ditandai
          sebagai hari libur.
        </p>
      </div>
    </ModalWrapper>
  );
}

export default function Pengaturan() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin"; // Pimpinan: hanya lihat, tidak bisa ubah konfigurasi
  const [activeModal, setActiveModal] = useState(null);
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      setSettingsData(res.data.data);
    } catch (err) {
      alert(getErrorMessage(err, "Gagal memuat info sistem."));
    } finally {
      setLoading(false);
    }
  };

  const loadQr = async () => {
    setQrLoading(true);
    try {
      const res = await api.get("/settings/qr-code");
      setQr(res.data.data);
    } catch (err) {
      // Belum pernah generate -> backend membalas 404, itu kondisi normal di sini.
      setQr(null);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadQr();
  }, []);

  const getHolidays = () => {
    const raw = settingsData?.settings?.national_holidays;
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw || [];
    } catch {
      return [];
    }
  };

  const close = () => setActiveModal(null);
  const saved = () => {
    close();
    loadSettings();
    loadQr();
  };

  const handleDeleteHoliday = async (tanggal) => {
    if (!window.confirm(`Hapus tanggal ${tanggal} dari daftar hari libur?`))
      return;
    try {
      const next = getHolidays().filter((h) => h !== tanggal);
      await api.put("/settings", { national_holidays: next });
      await loadSettings();
    } catch (err) {
      alert(getErrorMessage(err, "Gagal menghapus hari libur."));
    }
  };

  const handlePrintQr = () => {
    if (!qr?.image_path) return;
    const url = `${FILE_BASE_URL}${qr.image_path}`;
    const win = window.open("", "_blank", "width=480,height=640");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>Cetak QR Code Absensi</title></head>
        <body style="text-align:center;font-family:sans-serif;padding:40px;">
          <h2 style="margin-bottom:4px;">QR Code Absensi</h2>
          <p style="margin-top:0;color:#555;">BUMDESMA Podo Rukun LKD</p>
          <img src="${url}" style="width:320px;height:320px;margin-top:20px;" />
        </body>
      </html>
    `);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  };

  const jadwalReguler = settingsData?.workSchedules?.find(
    (ws) => ws.day_type === "reguler",
  );
  const jadwalSabtu = settingsData?.workSchedules?.find(
    (ws) => ws.day_type === "sabtu",
  );
  const holidays = getHolidays();
  const settings = settingsData?.settings || {};
  const lat = settings.office_latitude;
  const lng = settings.office_longitude;
  const hasCoords =
    lat !== undefined &&
    lat !== null &&
    lat !== "" &&
    lng !== undefined &&
    lng !== null &&
    lng !== "";
  const mapsSrc = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`
    : null;

  const allCards = [
    {
      id: "lokasi",
      icon: "fa-location-dot",
      label: "Lokasi Kantor",
      adminOnly: true,
    },
    {
      id: "radius",
      icon: "fa-satellite-dish",
      label: "Radius Geofencing",
      adminOnly: true,
    },
    {
      id: "qr",
      icon: "fa-qrcode",
      label: qr ? "Regenerasi QR Code" : "Generate QR Code",
      adminOnly: true,
    },
    {
      id: "password",
      icon: "fa-lock",
      label: "Ganti Password",
      adminOnly: false,
    },
  ];
  const cards = allCards.filter((c) => isAdmin || !c.adminOnly);

  return (
    <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
      <Topbar title="Pengaturan" />
      <div className="p-6">
        {loading ? (
          <div className="mb-8 text-center text-sm font-semibold text-gray-500">
            Memuat info sistem...
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-4">
            <h2 className="text-lg font-extrabold text-gray-800">
              Info Sistem
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
                  <i className="fa-solid fa-satellite-dish text-green-700"></i>{" "}
                  Radius Geofencing
                </div>
                <div className="text-3xl font-extrabold text-gray-800">
                  {settings.geofence_radius_meters ?? "-"}{" "}
                  <span className="text-base font-bold text-gray-400">
                    meter
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-semibold mt-2">
                  Karyawan hanya bisa melakukan absensi jika berada dalam radius
                  ini dari titik kantor.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
                  <i className="fa-solid fa-location-dot text-green-700"></i>{" "}
                  Koordinat Kantor
                </div>
                <div className="text-sm font-bold text-gray-800">
                  Latitude: {lat ?? "-"}
                </div>
                <div className="text-sm font-bold text-gray-800">
                  Longitude: {lng ?? "-"}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
                <i className="fa-solid fa-map-location-dot text-green-700"></i>{" "}
                Lokasi Kantor
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
                <p className="text-sm text-gray-500 font-semibold">
                  Koordinat kantor belum diatur.
                </p>
              )}
            </div>

            {/* Jam Kerja - setiap baris punya tombol edit sendiri-sendiri */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3 text-gray-700 font-extrabold">
                <i className="fa-solid fa-business-time text-green-700"></i> Jam
                Kerja
              </div>
              {!settingsData?.workSchedules?.length ? (
                <p className="text-sm text-gray-500 font-semibold">
                  Belum ada jadwal kerja.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500 font-bold">
                      <th className="py-2 pr-3">Jadwal</th>
                      <th className="py-2 pr-3">Masuk</th>
                      <th className="py-2 pr-3">Pulang</th>
                      <th className="py-2 pr-3">Toleransi</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {settingsData.workSchedules.map((ws) => (
                      <tr
                        key={ws.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-2 pr-3 font-extrabold text-gray-800">
                          {ws.label}
                        </td>
                        <td className="py-2 pr-3 font-semibold text-gray-700">
                          {ws.start_time?.slice(0, 5)}
                        </td>
                        <td className="py-2 pr-3 font-semibold text-gray-700">
                          {ws.end_time?.slice(0, 5)}
                        </td>
                        <td className="py-2 pr-3 font-semibold text-gray-700">
                          {ws.late_tolerance_minutes} menit
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ws.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
                          >
                            {ws.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-2">
                          {isAdmin && (
                            <button
                              onClick={() =>
                                setActiveModal(`jadwal-${ws.day_type}`)
                              }
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 transition-all"
                            >
                              edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* QR Code Absensi */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-700 font-extrabold">
                  <i className="fa-solid fa-qrcode text-green-700"></i> QR Code
                  Absensi
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setActiveModal("qr")}
                    className="px-4 py-2 rounded-xl text-white font-bold text-xs hover:opacity-90"
                    style={{ backgroundColor: "#1a7a1a" }}
                  >
                    {qr ? "Regenerasi QR Code" : "Generate QR Code"}
                  </button>
                )}
              </div>

              {qrLoading ? (
                <p className="text-sm text-gray-500 font-semibold">
                  Memuat QR Code...
                </p>
              ) : qr ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <img
                      src={`${FILE_BASE_URL}${qr.image_path}`}
                      alt="QR Code Absensi"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-400 font-semibold">
                    Dibuat {new Date(qr.generated_at).toLocaleString("id-ID")}
                  </p>
                  <button
                    onClick={handlePrintQr}
                    className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 bg-blue-600"
                  >
                    <i className="fa-solid fa-print"></i> Cetak QR Code
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-semibold">
                  Belum ada QR Code yang di-generate. Klik "Generate QR Code"
                  untuk membuatnya, lalu cetak dan pasang di kantor.
                </p>
              )}
            </div>

            {/* Hari Libur Nasional */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700 font-extrabold">
                  <i className="fa-solid fa-calendar-day text-green-700"></i>{" "}
                  Hari Libur Nasional
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setActiveModal("hari-libur")}
                    className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-90"
                    style={{ backgroundColor: "#1a7a1a" }}
                  >
                    <i className="fa-solid fa-plus"></i> Tambah Hari Libur
                  </button>
                )}
              </div>
              {holidays.length === 0 ? (
                <p className="text-sm text-gray-500 font-semibold">
                  Belum ada hari libur yang ditetapkan.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {holidays.map((h) => (
                    <span
                      key={h}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700"
                    >
                      {h}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteHoliday(h)}
                          className="text-gray-400 hover:text-red-500"
                          title="Hapus"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 font-semibold mt-3">
                Pegawai tidak dapat melakukan absensi pada tanggal yang ditandai
                sebagai hari libur.
              </p>
            </div>
          </div>
        )}

        <h2 className="text-lg font-extrabold text-gray-800 mb-4">
          Ubah Pengaturan
        </h2>
        <div className="flex gap-4 flex-wrap">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveModal(c.id)}
              className="w-36 h-36 rounded-2xl text-white flex flex-col items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              style={{ backgroundColor: "#1a7a1a" }}
            >
              <i className={`fa-solid ${c.icon} text-3xl`}></i>
              <span className="font-extrabold text-sm text-center leading-tight">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeModal === "lokasi" && (
        <LokasiModal settings={settings} onClose={close} onSaved={saved} />
      )}
      {activeModal === "radius" && (
        <RadiusModal settings={settings} onClose={close} onSaved={saved} />
      )}
      {activeModal === "password" && <PasswordModal onClose={close} />}
      {activeModal === "qr" && (
        <GenerateQrModal hasExisting={!!qr} onClose={close} onSaved={saved} />
      )}
      {activeModal === "hari-libur" && (
        <HariLiburModal existing={holidays} onClose={close} onSaved={saved} />
      )}
      {activeModal === "jadwal-reguler" && jadwalReguler && (
        <JadwalKerjaModal
          schedule={jadwalReguler}
          dayLabel="Senin - Jumat"
          onClose={close}
          onSaved={saved}
        />
      )}
      {activeModal === "jadwal-sabtu" && jadwalSabtu && (
        <JadwalKerjaModal
          schedule={jadwalSabtu}
          dayLabel="Sabtu (Piket)"
          onClose={close}
          onSaved={saved}
        />
      )}
    </div>
  );
}
