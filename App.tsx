
import React, { useState, useEffect, useCallback } from 'react';
import DataForm from './components/DataForm';
import PrintPreview from './components/PrintPreview';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { FormData, LeaveHistoryEntry } from './types';
import { LetterType } from './types';
import { FileText, LogOut, RefreshCw, CheckCircle2, AlertTriangle, Cloud } from 'lucide-react';
import { fetchFromCloud, syncToCloud } from './utils/syncService';

// Mengambil Client ID
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID || (import.meta as any).env?.VITE_CLIENT_ID || "";

const initialFormData: FormData = {
  namaPegawai: '',
  nipPegawai: '',
  jenisKelamin: '',
  emailPegawai: '',
  pangkatGolonganPegawai: '',
  jabatanPegawai: '',
  statusPegawai: 'Guru PNS',
  unitKerjaPegawai: '',
  satuanOrganisasi: 'Dinas Pendidikan Kepemudaan dan Olahraga Kota Denpasar',
  tglMulaiKerja: '',
  masaKerjaPegawai: '',
  alamatSelamaCuti: '',
  telpPegawai: '',
  alamatSekolah: '',
  teleponSekolah: '',
  emailSekolah: '',
  websiteSekolah: '',
  namaAtasan: '',
  nipAtasan: '',
  jabatanAtasan: 'Kepala Sekolah',
  pangkatGolonganAtasan: '',
  namaPejabat: 'Drs. Anak Agung Gede Wiratama, M.Ag.',
  nipPejabat: '19680404 199403 1 016',
  jabatanPejabat: 'Kepala Dinas Pendidikan Kepemudaan dan Olahraga Kota Denpasar',
  jenisCuti: LetterType.SURAT_IZIN_DINAS_TAHUNAN,
  alasanCuti: '',
  lamaCuti: '',
  tglMulai: '',
  tglSelesai: '',
  jatahCutiTahunan: '12',
  sisaCutiN: '12',
  sisaCutiN_1: '',
  sisaCutiN_2: '',
  nomorSuratDinas: '',
  nomorSuratSekolah: '',
  tglSurat: new Date().toISOString().split('T')[0],
  tglSuratBali: '',
  tembusan1: '',
  tembusan2: 'Yang Bersangkutan',
  tembusan3: 'Arsip',
  logoDinas: '',
  logoSekolah: '',
};

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

const App: React.FC = () => {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // State untuk status sinkronisasi terpusat
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  const [globalLogos, setGlobalLogos] = useLocalStorage<{logoDinas: string, logoSekolah: string}>('globalLogos', {
    logoDinas: '',
    logoSekolah: ''
  });

  const [profiles, setProfiles] = useLocalStorage<Record<string, FormData>>('profilesData', {});
  const [activeProfileKey, setActiveProfileKey] = useLocalStorage<string | null>('activeProfileKey', null);
  const [leaveHistory, setLeaveHistory] = useLocalStorage<Record<string, LeaveHistoryEntry[]>>('leaveHistory', {});

  const [formData, setFormData] = useState<FormData>(() => {
    let base = initialFormData;
    if (activeProfileKey && profiles[activeProfileKey]) {
      base = profiles[activeProfileKey];
    }
    return { ...base, ...globalLogos };
  });

  // Helper untuk mendapatkan URL/Token dari Environment Variable (VITE_ prefix)
  const getCloudConfig = () => {
      // Prioritas: import.meta.env (Vite native) > process.env (mapped in vite.config)
      const envUrl = (import.meta as any).env?.VITE_GAS_WEB_APP_URL || process.env.VITE_GAS_WEB_APP_URL;
      const envToken = (import.meta as any).env?.VITE_SECURITY_TOKEN || process.env.VITE_SECURITY_TOKEN;
      return {
          url: envUrl || '',
          token: envToken || ''
      };
  };

  // Efek Terpusat untuk Sinkronisasi Otomatis saat profiles atau leaveHistory berubah
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const { url, token } = getCloudConfig();

    if (!url || !token) return;

    const syncTimeout = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const result = await syncToCloud(url, token, profiles, leaveHistory, currentUser.email);
        if (result.status === 'success') {
          setSyncStatus('success');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
          console.warn("Sync warning:", result.message);
          setSyncStatus('idle'); 
        }
      } catch (e) {
        console.error("Sync failed:", e);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }, 3000);

    return () => clearTimeout(syncTimeout);
  }, [profiles, leaveHistory, currentUser]);

  useEffect(() => {
    /* global google */
    if (typeof window !== 'undefined' && (window as any).google) {
      if (!GOOGLE_CLIENT_ID) return;

      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        });
        const btn = document.getElementById("googleBtn");
        if (btn) {
            (window as any).google.accounts.id.renderButton(btn, { theme: "outline", size: "large" });
        }
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
      }
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userData = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    setCurrentUser(userData);
    
    // FETCH ALL DATA SAAT LOGIN
    const { url, token } = getCloudConfig();

    if (url && token) {
        setSyncStatus('syncing');
        try {
            const result = await fetchFromCloud(url, token, ''); 
            
            if (result.status === 'success' && result.profiles) {
                const cloudProfiles: Record<string, FormData> = {};
                if (Array.isArray(result.profiles)) {
                   result.profiles.forEach((p: any) => {
                       if (p.namaPegawai) cloudProfiles[p.namaPegawai] = p;
                   });
                }
                
                setProfiles(prev => ({ ...prev, ...cloudProfiles }));

                const cloudHistory: Record<string, LeaveHistoryEntry[]> = {};
                if (result.history && Array.isArray(result.history)) {
                    result.history.forEach((h: any) => {
                        const nip = h.nip_owner;
                        if (!cloudHistory[nip]) cloudHistory[nip] = [];
                        const { nip_owner, ...entry } = h;
                        cloudHistory[nip].push(entry);
                    });
                }
                
                setLeaveHistory(prev => {
                    const merged = { ...prev };
                    Object.keys(cloudHistory).forEach(nip => {
                        merged[nip] = cloudHistory[nip];
                    });
                    return merged;
                });
                
                setSyncStatus('success');
                setTimeout(() => setSyncStatus('idle'), 2000);
            }
        } catch (e) {
            console.error("Gagal menarik data cloud:", e);
            setSyncStatus('error');
        }
    } else {
        console.warn("Cloud Sync URL or Token not configured in environment variables.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSyncStatus('idle');
  };

  useEffect(() => {
    if (formData.logoDinas !== globalLogos.logoDinas || formData.logoSekolah !== globalLogos.logoSekolah) {
        setGlobalLogos({
            logoDinas: formData.logoDinas,
            logoSekolah: formData.logoSekolah
        });
    }
  }, [formData.logoDinas, formData.logoSekolah, globalLogos.logoDinas, globalLogos.logoSekolah, setGlobalLogos]);

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
      alert('Nama Pegawai diperlukan untuk menyimpan profil.');
      return;
    }
    const { logoDinas, logoSekolah, ...profileDataWithoutLogos } = formData;
    const newProfiles = { ...profiles, [key]: profileDataWithoutLogos as FormData };
    
    setProfiles(newProfiles);
    setActiveProfileKey(key);
    
    if(currentUser) {
      setSyncStatus('syncing'); 
    }
  };

  const handleDeleteProfile = () => {
    if (!activeProfileKey) return;
    if (window.confirm(`Hapus profil "${activeProfileKey}"?`)) {
      const newProfiles = { ...profiles };
      delete newProfiles[activeProfileKey];
      
      setProfiles(newProfiles);
      setActiveProfileKey(null);
      setFormData({ ...initialFormData, ...globalLogos });
    }
  };

  // Fungsi manual refresh untuk user
  const handleManualRefresh = async () => {
    const { url, token } = getCloudConfig();
    
    if(!url || !currentUser) {
        if(!url) alert("URL Cloud belum dikonfigurasi (VITE_GAS_WEB_APP_URL).");
        return;
    }

    setSyncStatus('syncing');
    try {
        const result = await fetchFromCloud(url, token || '', '');
        if (result.status === 'success' && result.profiles) {
            const cloudProfiles: Record<string, FormData> = {};
            if (Array.isArray(result.profiles)) {
                result.profiles.forEach((p: any) => {
                    if (p.namaPegawai) cloudProfiles[p.namaPegawai] = p;
                });
            }
            setProfiles(prev => ({ ...prev, ...cloudProfiles }));
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } else {
            alert("Gagal mengambil data: " + (result.message || 'Unknown Error'));
            setSyncStatus('error');
        }
    } catch(e) {
        setSyncStatus('error');
        alert("Gagal koneksi ke server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 print:bg-white">
      <header className="bg-white shadow-md print:hidden sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
                <FileText className="text-blue-600 w-6 h-6" />
                <h1 className="text-lg font-black text-gray-800 hidden md:block uppercase tracking-tighter">
                  Cuti Guru Online
                </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => setStep('form')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  step === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-gray-100'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setStep('preview')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  step === 'preview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-gray-100'
                }`}
              >
                Cetak
              </button>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              {currentUser ? (
                <div className="flex items-center gap-2 bg-gray-50 p-1 pr-3 rounded-full border border-gray-100">
                   <img src={currentUser.picture} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="profile" />
                   <div className="hidden lg:block text-left overflow-hidden max-w-[120px]">
                       <p className="text-[10px] font-bold leading-none truncate">{currentUser.name}</p>
                       <p className="text-[9px] text-gray-400 truncate">Online</p>
                   </div>
                   <button onClick={handleManualRefresh} title="Ambil Data Terbaru" className="p-1.5 hover:bg-blue-50 text-blue-400 hover:text-blue-600 rounded-full transition-colors ml-1">
                       <Cloud className="w-4 h-4" />
                   </button>
                   <button onClick={handleLogout} title="Logout" className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full transition-colors">
                       <LogOut className="w-4 h-4" />
                   </button>
                </div>
              ) : (
                <div id="googleBtn"></div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {syncStatus !== 'idle' && currentUser && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border text-[10px] font-black uppercase tracking-tight transition-all transform ${
          syncStatus === 'syncing' ? 'bg-blue-600 text-white border-blue-400' :
          syncStatus === 'success' ? 'bg-green-600 text-white border-green-400' :
          'bg-red-600 text-white border-red-400'
        }`}>
          {syncStatus === 'syncing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : 
           syncStatus === 'success' ? <CheckCircle2 className="w-3 h-3" /> : 
           <AlertTriangle className="w-3 h-3" />}
          {syncStatus === 'syncing' ? 'Sync Cloud...' : 
           syncStatus === 'success' ? 'Data Cloud Terupdate' : 'Gagal Koneksi Cloud'}
        </div>
      )}

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
            currentUserEmail={currentUser?.email}
            syncStatus={syncStatus}
          />
        ) : (
          <PrintPreview formData={formData} />
        )}
      </main>
    </div>
  );
};

export default App;
