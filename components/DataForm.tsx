import React, { useState, useEffect, useCallback } from 'react';
import type { FormData, LeaveHistoryEntry } from '../types';
import { LetterType } from '../types';
import { calculateBalineseDate } from '../utils/balineseCalendar';
import { calculateWorkingDays, calculateWorkDuration, isEligibleForLeave } from '../utils/dateCalculator';
import { Save, Trash2, Info, AlertTriangle, CloudLightning, RefreshCw, CheckCircle2, Mail, User, ShieldCheck, CalendarDays } from 'lucide-react';
import Riwayat from './Riwayat';
import { syncToCloud } from '../utils/syncService';

interface DataFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  profiles: Record<string, FormData>;
  setProfiles: React.Dispatch<React.SetStateAction<Record<string, FormData>>>;
  activeProfileKey: string | null;
  onProfileChange: (key: string | null) => void;
  onSaveProfile: () => void;
  onDeleteProfile: () => void;
  leaveHistory: Record<string, LeaveHistoryEntry[]>;
  setLeaveHistory: React.Dispatch<React.SetStateAction<Record<string, LeaveHistoryEntry[]>>>;
  currentUserEmail?: string;
}

const InputField: React.FC<{ label: string; id: keyof FormData | string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; placeholder?: string, rows?: number, readOnly?: boolean, helperText?: string, icon?: React.ReactNode }> = ({ label, id, value, onChange, type = 'text', required = true, placeholder, rows, readOnly=false, helperText, icon }) => (
  <div className="group">
    <label htmlFor={id} className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
      {type === 'textarea' ? (
         <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
          rows={rows || 3}
          className={`w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${icon ? 'pl-10' : ''}`}
        />
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
          readOnly={readOnly}
          className={`w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${readOnly ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''} ${icon ? 'pl-10' : ''}`}
        />
      )}
    </div>
    {helperText && <p className="mt-1 text-[10px] text-gray-400 italic ml-1">{helperText}</p>}
  </div>
);

const DataForm: React.FC<DataFormProps> = ({ 
  formData, 
  setFormData, 
  profiles, 
  setProfiles, 
  activeProfileKey, 
  onProfileChange, 
  onSaveProfile, 
  onDeleteProfile,
  leaveHistory,
  setLeaveHistory,
  currentUserEmail
}) => {
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // URL dan Token diambil dari Environment Variable Vercel
  const cloudUrl = process.env.GAS_WEB_APP_URL || '';
  const cloudToken = process.env.SECURITY_TOKEN || '';
  
  // LOGIKA AUTO-SYNC (DEBOUNCE) - Latar Belakang
  useEffect(() => {
    if (!currentUserEmail || !cloudUrl || !cloudToken) return;

    const syncTimeout = setTimeout(async () => {
      setLastSyncStatus('syncing');
      try {
        await syncToCloud(cloudUrl, cloudToken, profiles, leaveHistory, currentUserEmail);
        setLastSyncStatus('success');
        setTimeout(() => setLastSyncStatus('idle'), 3000);
      } catch (e) {
        setLastSyncStatus('error');
      }
    }, 2000);

    return () => clearTimeout(syncTimeout);
  }, [profiles, currentUserEmail, cloudUrl, cloudToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFormData(prev => {
      let updates: Partial<FormData> = {};
      const workingDays = calculateWorkingDays(prev.tglMulai, prev.tglSelesai);
      const jatah = parseInt(prev.jatahCutiTahunan, 10) || 0;
      const nip = prev.nipPegawai?.trim();
      const myHistory = nip && leaveHistory[nip] ? leaveHistory[nip] : [];
      const currentYear = new Date().getFullYear();
      const usedInHistory = myHistory
        .filter(entry => {
          const entryYear = new Date(entry.tglMulai).getFullYear();
          return entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN && entryYear === currentYear;
        })
        .reduce((sum, entry) => sum + entry.lamaCuti, 0);
      
      const sisa = Math.max(0, jatah - usedInHistory); 
      const newLamaCuti = workingDays > 0 ? `${workingDays} hari kerja` : '';
      const newSisaCutiN = String(sisa);
      
      if (prev.lamaCuti !== newLamaCuti) updates.lamaCuti = newLamaCuti;
      if (prev.sisaCutiN !== newSisaCutiN) updates.sisaCutiN = newSisaCutiN;
      
      let balineseDate = '';
      if (prev.tglSurat && prev.tglSurat.includes('-')) {
        const parts = prev.tglSurat.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const testDate = new Date(parts[0], parts[1] - 1, parts[2]);
          if (!isNaN(testDate.getTime())) balineseDate = calculateBalineseDate(testDate);
        }
      }
      if (prev.tglSuratBali !== balineseDate) updates.tglSuratBali = balineseDate;
      
      const unitKerja = prev.unitKerjaPegawai || '';
      const newJabatanAtasan = unitKerja ? `Kepala ${unitKerja}` : 'Kepala Sekolah';
      const newTembusan1 = unitKerja ? `Kepala ${unitKerja}` : '';
      
      if (prev.jabatanAtasan !== newJabatanAtasan) updates.jabatanAtasan = newJabatanAtasan;
      if (prev.tembusan1 !== newTembusan1) updates.tembusan1 = newTembusan1;
      
      return { ...prev, ...updates };
    });
  }, [formData.tglMulai, formData.tglSelesai, formData.jatahCutiTahunan, formData.tglSurat, formData.unitKerjaPegawai, formData.nipPegawai, leaveHistory]); 

  const isEligible = isEligibleForLeave(formData.tglMulaiKerja);
  const totalSisaCuti = isEligible 
    ? (parseInt(formData.sisaCutiN, 10) || 0) + 
      (parseInt(formData.sisaCutiN_1, 10) || 0) + 
      (parseInt(formData.sisaCutiN_2, 10) || 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* STATUS SYNC FLOATING */}
      {lastSyncStatus !== 'idle' && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border text-[10px] font-black uppercase transition-all transform ${
          lastSyncStatus === 'syncing' ? 'bg-blue-600 text-white border-blue-400' :
          lastSyncStatus === 'success' ? 'bg-green-600 text-white border-green-400' :
          'bg-red-600 text-white border-red-400'
        }`}>
          {lastSyncStatus === 'syncing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          {lastSyncStatus === 'syncing' ? 'Cloud Sync...' : 
           lastSyncStatus === 'success' ? 'Tersinkron' : 'Gagal Sync'}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                <User className="w-5 h-5 text-blue-600" />
                Profil Pegawai
            </h2>
            <div className="flex items-center gap-2">
                 <button onClick={onSaveProfile} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Simpan Profil">
                    <Save className="w-5 h-5" />
                 </button>
                 <button onClick={onDeleteProfile} disabled={!activeProfileKey} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 disabled:opacity-30 transition-colors" title="Hapus Profil">
                    <Trash2 className="w-5 h-5" />
                 </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Pilih atau Buat Profil</label>
              <select
                value={activeProfileKey ?? ''}
                onChange={(e) => onProfileChange(e.target.value || null)}
                className="w-full border-none bg-white rounded-xl shadow-sm p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">+ Buat Profil Baru</option>
                {Object.keys(profiles).sort().map(key => <option key={key} value={key}>{key}</option>)}
              </select>
          </div>

          <InputField label="Nama Lengkap" id="namaPegawai" value={formData.namaPegawai} onChange={handleChange} placeholder="Gelar depan & belakang..." />
          <InputField label="NIP" id="nipPegawai" value={formData.nipPegawai} onChange={handleChange} placeholder="19XXXXXXXX XXXXXX X XXX" />
          
          <div className="group">
            <label htmlFor="jenisKelamin" className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Jenis Kelamin</label>
            <select
              id="jenisKelamin"
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
            >
              <option value="">-- Pilih --</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <InputField 
            label="Email Pegawai" 
            id="emailPegawai" 
            value={formData.emailPegawai} 
            onChange={handleChange} 
            icon={<Mail className="w-4 h-4" />}
            readOnly={!!currentUserEmail}
            helperText={currentUserEmail ? "Sinkronisasi Cloud Aktif" : "Login untuk menyimpan ke cloud"}
          />
          <InputField label="Pangkat / Golongan ruang" id="pangkatGolonganPegawai" value={formData.pangkatGolonganPegawai} onChange={handleChange} placeholder="Pembina, IV/a..." />
          <InputField label="Jabatan" id="jabatanPegawai" value={formData.jabatanPegawai} onChange={handleChange} />
          <InputField label="Unit Kerja" id="unitKerjaPegawai" value={formData.unitKerjaPegawai} onChange={handleChange} placeholder="Nama Sekolah..." />
          <InputField label="Satuan Organisasi" id="satuanOrganisasi" value={formData.satuanOrganisasi} onChange={handleChange} />
          <InputField label="Status Pegawai" id="statusPegawai" value={formData.statusPegawai} onChange={handleChange} />
          <InputField label="Tanggal Mulai Kerja" id="tglMulaiKerja" value={formData.tglMulaiKerja} onChange={handleChange} type="date" required={false} />
          <InputField label="Masa Kerja" id="masaKerjaPegawai" value={formData.masaKerjaPegawai} onChange={handleChange} required={false} readOnly helperText="Dihitung otomatis" />
          <InputField label="Nomor Telepon" id="telpPegawai" value={formData.telpPegawai} onChange={handleChange} placeholder="08XXXXXXXXXX" />
          <div className="md:col-span-2">
             <InputField label="Alamat Selama Cuti" id="alamatSelamaCuti" value={formData.alamatSelamaCuti} onChange={handleChange} type="textarea" placeholder="Alamat lengkap tujuan cuti..." />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-black text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Pejabat Penandatangan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Nama Kepala Sekolah" id="namaAtasan" value={formData.namaAtasan} onChange={handleChange} placeholder="Dikosongkan untuk diisi manual..." />
          <InputField label="NIP Kepala Sekolah" id="nipAtasan" value={formData.nipAtasan} onChange={handleChange} placeholder="NIP Atasan..." />
          <InputField label="Pangkat / Golongan Atasan" id="pangkatGolonganAtasan" value={formData.pangkatGolonganAtasan} onChange={handleChange} />
          <InputField label="Jabatan Atasan" id="jabatanAtasan" value={formData.jabatanAtasan} onChange={handleChange} readOnly helperText="Kepala [Unit Kerja]" />
          
          <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-4 tracking-widest">Pejabat Berwenang Dinas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nama Pejabat Berwenang" id="namaPejabat" value={formData.namaPejabat} onChange={handleChange} />
                <InputField label="NIP Pejabat Berwenang" id="nipPejabat" value={formData.nipPejabat} onChange={handleChange} />
                <div className="md:col-span-2">
                    <InputField label="Jabatan Pejabat Berwenang" id="jabatanPejabat" value={formData.jabatanPejabat} onChange={handleChange} />
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-black text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2 uppercase tracking-tight">
            <CalendarDays className="w-5 h-5 text-purple-600" />
            Detail Permohonan Cuti
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label htmlFor="jenisCuti" className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider ml-1">Jenis Cuti</label>
            <select id="jenisCuti" name="jenisCuti" value={formData.jenisCuti} onChange={(e) => setFormData(prev => ({ ...prev, jenisCuti: e.target.value as LetterType }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold">
              <option value={LetterType.SURAT_IZIN_DINAS_TAHUNAN}>Cuti Tahunan</option>
              <option value={LetterType.SURAT_IZIN_DINAS_SAKIT}>Cuti Sakit</option>
              <option value={LetterType.SURAT_IZIN_DINAS_MELAHIRKAN}>Cuti Melahirkan</option>
            </select>
          </div>
          <InputField label="Tanggal Mulai" id="tglMulai" value={formData.tglMulai} onChange={handleChange} type="date" />
          <InputField label="Tanggal Selesai" id="tglSelesai" value={formData.tglSelesai} onChange={handleChange} type="date" />
          <div className="md:col-span-2">
            <InputField label="Alasan Cuti" id="alasanCuti" value={formData.alasanCuti} onChange={handleChange} type="textarea" placeholder="Misal: Kepentingan keluarga / Sakit flu..." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Jatah Cuti N" id="jatahCutiTahunan" value={formData.jatahCutiTahunan} onChange={handleChange} type="number" />
          <InputField label="Durasi (Hari Kerja)" id="lamaCuti" value={formData.lamaCuti} onChange={handleChange} readOnly />
          <InputField label="Sisa Cuti N" id="sisaCutiN" value={formData.sisaCutiN} onChange={handleChange} readOnly />
          <InputField label="Sisa Cuti N-1" id="sisaCutiN_1" value={formData.sisaCutiN_1} onChange={handleChange} type="number" required={false} placeholder="0" />
          <InputField label="Sisa Cuti N-2" id="sisaCutiN_2" value={formData.sisaCutiN_2} onChange={handleChange} type="number" required={false} placeholder="0" />
          
          <div className={`${isEligible ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'} p-4 rounded-2xl border flex items-center shadow-sm`}>
             <div className="flex-grow">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isEligible ? 'text-blue-800' : 'text-red-800'}`}>Hak Cuti Tersedia</p>
                <p className={`text-2xl font-black ${isEligible ? 'text-blue-900' : 'text-red-900'}`}>{totalSisaCuti} Hari</p>
             </div>
             {isEligible ? <Info className="w-5 h-5 text-blue-500 ml-2" /> : <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />}
          </div>
        </div>
      </div>
      
      <Riwayat formData={formData} leaveHistory={leaveHistory} setLeaveHistory={setLeaveHistory} currentUserEmail={currentUserEmail} cloudUrl={cloudUrl} cloudToken={cloudToken} profiles={profiles} />
    </div>
  );
};

export default DataForm;
