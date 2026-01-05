
import React, { useCallback } from 'react';
import type { FormData, LeaveHistoryEntry } from '../types';
import { LetterType } from '../types';
import { calculateWorkingDays, isEligibleForLeave } from '../utils/dateCalculator';
import { formatIndonesianDate } from '../utils/dateFormatter';
import { History, PlusCircle, Trash2, CheckCircle2, CalendarDays, AlertTriangle, Cloud, User } from 'lucide-react';

export interface RiwayatProps {
  formData: FormData;
  leaveHistory: Record<string, LeaveHistoryEntry[]>;
  setLeaveHistory: React.Dispatch<React.SetStateAction<Record<string, LeaveHistoryEntry[]>>>;
  currentUserEmail?: string;
}

const Riwayat: React.FC<RiwayatProps> = ({ 
  formData, 
  leaveHistory, 
  setLeaveHistory, 
  currentUserEmail
}) => {
  
  const getMyHistory = useCallback(() => {
    const nip = formData.nipPegawai?.trim();
    if (!nip) return [];
    return leaveHistory[nip] || [];
  }, [formData.nipPegawai, leaveHistory]);

  const calculateUsedLeaveCurrentYear = useCallback(() => {
    const history = getMyHistory();
    const currentYear = new Date().getFullYear();
    
    return history
      .filter(entry => {
        const entryYear = new Date(entry.tglMulai).getFullYear();
        return entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN && entryYear === currentYear;
      })
      .reduce((sum, entry) => sum + entry.lamaCuti, 0);
  }, [getMyHistory]);

  const handleSaveToHistory = async () => {
    if (!formData.nipPegawai) {
      alert("NIP Pegawai diperlukan untuk menyimpan riwayat.");
      return;
    }
    if (!formData.tglMulai || !formData.tglSelesai) {
      alert("Pilih rentang tanggal terlebih dahulu.");
      return;
    }

    const workingDays = calculateWorkingDays(formData.tglMulai, formData.tglSelesai);
    if (workingDays <= 0) {
      alert("Durasi cuti tidak valid.");
      return;
    }

    const nip = formData.nipPegawai.trim();
    const newEntry: LeaveHistoryEntry = {
      id: Date.now().toString(),
      tglMulai: formData.tglMulai,
      tglSelesai: formData.tglSelesai,
      lamaCuti: workingDays,
      jenisCuti: formData.jenisCuti,
      alasanCuti: formData.alasanCuti,
      timestamp: Date.now()
    };

    // Update state. App.tsx akan mendeteksi perubahan ini dan melakukan sinkronisasi otomatis.
    const newHistory = { ...leaveHistory, [nip]: [newEntry, ...(leaveHistory[nip] || [])] };
    setLeaveHistory(newHistory);
    
    // Feedback instan
    alert("✓ Riwayat berhasil dicatat! Sinkronisasi cloud akan berjalan otomatis.");
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm("Hapus riwayat ini?")) return;
    const nip = formData.nipPegawai.trim();
    // Update state. App.tsx akan mendeteksi perubahan ini dan melakukan sinkronisasi otomatis.
    const updatedHistory = { ...leaveHistory, [nip]: (leaveHistory[nip] || []).filter(e => e.id !== id) };
    setLeaveHistory(updatedHistory);
  };

  const isEligible = isEligibleForLeave(formData.tglMulaiKerja);
  const totalTersedia = isEligible 
    ? (parseInt(formData.sisaCutiN, 10) || 0) + 
      (parseInt(formData.sisaCutiN_1, 10) || 0) + 
      (parseInt(formData.sisaCutiN_2, 10) || 0)
    : 0;
  
  const totalTerpakai = calculateUsedLeaveCurrentYear();

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
         <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-xl text-white">
                <History className="w-5 h-5"/>
             </div>
             <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Manajemen Riwayat Cuti</h2>
         </div>
         <button 
           onClick={handleSaveToHistory}
           className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
         >
           <PlusCircle className="w-5 h-5"/>
           Catat Permohonan Saat Ini
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className={`${isEligible ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'} border rounded-2xl p-6 flex items-center shadow-sm`}>
            <div className={`${isEligible ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} p-4 rounded-full mr-4`}>
                {isEligible ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>
            <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isEligible ? 'text-blue-800' : 'text-red-800'}`}>
                  Sisa Hak Cuti (Tersedia)
                </p>
                <p className={`text-4xl font-black leading-none mt-1 ${isEligible ? 'text-blue-900' : 'text-red-900'}`}>
                  {totalTersedia} <span className="text-sm font-medium">Hari</span>
                </p>
                {!isEligible && (
                  <p className="text-[10px] text-red-600 mt-2 font-bold italic">Belum berhak cuti (Masa kerja &lt; 1 thn)</p>
                )}
            </div>
         </div>

         <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-center shadow-sm">
            <div className="bg-orange-100 p-4 rounded-full mr-4">
                <CalendarDays className="w-10 h-10 text-orange-600" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">Cuti Terpakai Th. Berjalan</p>
                <p className="text-4xl font-black text-orange-900 leading-none mt-1">{totalTerpakai} <span className="text-sm font-medium">Hari</span></p>
            </div>
         </div>
      </div>
      
      <div>
        {!formData.nipPegawai ? (
           <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-bold">Masukkan NIP Pegawai untuk melihat riwayat</p>
           </div>
        ) : getMyHistory().length === 0 ? (
           <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-bold">Belum ada riwayat tercatat</p>
              <p className="text-slate-400 text-xs mt-1">Gunakan tombol biru di atas untuk mencatat data baru.</p>
           </div>
        ) : (
          <div className="overflow-hidden border border-gray-100 rounded-3xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal Mulai</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Jenis</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Durasi</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Keterangan</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {getMyHistory().map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                      {formatIndonesianDate(entry.tglMulai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN ? 'bg-green-100 text-green-700' :
                        entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_SAKIT ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {entry.jenisCuti.split(' ')[3] || 'Cuti'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                      {entry.lamaCuti} Hari
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">
                      {entry.alasanCuti || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleDeleteHistory(entry.id)} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {currentUserEmail && (
        <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 border border-green-100">
            <Cloud className="w-5 h-5 text-green-600" />
            <p className="text-xs text-green-700 font-medium">
                Sistem **Cloud Sync Aktif**: Setiap perubahan riwayat akan otomatis diperbarui di Google Sheets Anda.
            </p>
        </div>
      )}
    </div>
  );
};

export default Riwayat;
 
