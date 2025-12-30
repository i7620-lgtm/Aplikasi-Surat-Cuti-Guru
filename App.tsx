
import React, { useState, useEffect } from 'react';
import DataForm from './components/DataForm';
import PrintPreview from './components/PrintPreview';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { FormData, LeaveHistoryEntry } from './types';
import { LetterType } from './types';
import { FileText, Printer } from 'lucide-react';

const initialFormData: FormData = {
  // Pegawai
  namaPegawai: '',
  nipPegawai: '',
  pangkatGolonganPegawai: '',
  jabatanPegawai: '',
  statusPegawai: 'Guru PNS',
  unitKerjaPegawai: '',
  satuanOrganisasi: 'Dinas Pendidikan Kepemudaan Dan Olahraga Kota Denpasar',
  tglMulaiKerja: '',
  masaKerjaPegawai: '',
  alamatSelamaCuti: '',
  telpPegawai: '',

  // Sekolah Info
  alamatSekolah: 'Jalan Kebo Iwa Banjar Batuparas',
  teleponSekolah: '-',
  emailSekolah: 'sdnpadangsambian2@gmail.com',
  websiteSekolah: '',

  // Atasan Langsung
  namaAtasan: '',
  nipAtasan: '',
  jabatanAtasan: 'Kepala Sekolah',
  pangkatGolonganAtasan: '',

  // Pejabat Berwenang
  namaPejabat: 'Drs. Anak Agung Gede Wiratama, M.Ag.',
  nipPejabat: '19680404 199403 1 016',
  jabatanPejabat: 'Kepala Dinas Pendidikan Kepemudaan dan Olahraga Kota Denpasar',

  // Detail Cuti
  jenisCuti: LetterType.SURAT_IZIN_DINAS_TAHUNAN,
  alasanCuti: '',
  lamaCuti: '',
  tglMulai: '',
  tglSelesai: '',
  jatahCutiTahunan: '12',
  sisaCutiN: '12',
  sisaCutiN_1: '',
  sisaCutiN_2: '',
  
  // Surat
  nomorSuratDinas: '',
  nomorSuratSekolah: '',
  tglSurat: new Date().toISOString().split('T')[0],
  tglSuratBali: '',
  tembusan1: '',
  tembusan2: 'Yang Bersangkutan',
  tembusan3: 'Arsip',

  // Logos (Kini dikosongkan di state awal profil karena disimpan global)
  logoDinas: '',
  logoSekolah: '',
};

const App: React.FC = () => {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  
  // State Logo Global (Hanya satu untuk seluruh aplikasi)
  const [globalLogos, setGlobalLogos] = useLocalStorage<{logoDinas: string, logoSekolah: string}>('globalLogos', {
    logoDinas: '',
    logoSekolah: ''
  });

  const [profiles, setProfiles] = useLocalStorage<Record<string, FormData>>('profilesData', {});
  const [activeProfileKey, setActiveProfileKey] = useLocalStorage<string | null>('activeProfileKey', null);
  const [leaveHistory, setLeaveHistory] = useLocalStorage<Record<string, LeaveHistoryEntry[]>>('leaveHistory', {});

  // State form aktif yang menggabungkan data profil + logo global
  const [formData, setFormData] = useState<FormData>(() => {
    let base = initialFormData;
    if (activeProfileKey && profiles[activeProfileKey]) {
      base = profiles[activeProfileKey];
    }
    return { ...base, ...globalLogos };
  });

  // Sinkronisasi logo ke state global ketika berubah di form
  useEffect(() => {
    if (formData.logoDinas !== globalLogos.logoDinas || formData.logoSekolah !== globalLogos.logoSekolah) {
        setGlobalLogos({
            logoDinas: formData.logoDinas,
            logoSekolah: formData.logoSekolah
        });
    }
  }, [formData.logoDinas, formData.logoSekolah]);

  const handleProfileChange = (key: string | null) => {
    setActiveProfileKey(key);
    if (key && profiles[key]) {
      setFormData({ ...profiles[key], ...globalLogos });
    } else {
      setFormData({ ...initialFormData, ...globalLogos });
    }
  };

  const handleSaveProfile = () => {
    const key = formData.namaPegawai.trim();
    if (!key) {
      alert('Nama Pegawai tidak boleh kosong untuk menyimpan profil.');
      return;
    }

    // Pisahkan logo dari data profil sebelum disimpan ke localStorage profil
    const { logoDinas, logoSekolah, ...profileDataWithoutLogos } = formData;
    
    const newProfiles = { ...profiles, [key]: profileDataWithoutLogos as FormData };
    setProfiles(newProfiles);
    setActiveProfileKey(key);
    alert(`Profil untuk "${key}" berhasil disimpan! (Logo disimpan secara global untuk seluruh profil)`);
  };

  const handleDeleteProfile = () => {
    if (!activeProfileKey) {
      alert('Tidak ada profil yang dipilih untuk dihapus.');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus profil "${activeProfileKey}"?`)) {
      const newProfiles = { ...profiles };
      delete newProfiles[activeProfileKey];
      setProfiles(newProfiles);
      setActiveProfileKey(null);
      setFormData({ ...initialFormData, ...globalLogos });
      alert(`Profil "${activeProfileKey}" telah dihapus.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 print:bg-white">
      <header className="bg-white shadow-md print:hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Aplikasi Surat Cuti Guru
            </h1>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setStep('form')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  step === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Isi Data</span>
              </button>
              <button
                onClick={() => setStep('preview')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  step === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Printer className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cetak Surat</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none">
        {step === 'form' ? (
          <DataForm 
            formData={formData} 
            setFormData={setFormData}
            profiles={profiles}
            setProfiles={setProfiles}
            activeProfileKey={activeProfileKey}
            onProfileChange={handleProfileChange}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
            leaveHistory={leaveHistory}
            setLeaveHistory={setLeaveHistory}
          />
        ) : (
          <PrintPreview formData={formData} />
        )}
      </main>
    </div>
  );
};

export default App;
