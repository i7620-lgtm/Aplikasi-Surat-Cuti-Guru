
import React, { useCallback } from 'react';
import type { FormData, LeaveHistoryEntry } from '../types';
import { LetterType } from '../types';
import { calculateWorkingDays } from '../utils/dateCalculator';
import { formatIndonesianDate } from '../utils/dateFormatter';
import { History, PlusCircle, Trash2, CheckCircle2, CalendarDays } from 'lucide-react';

interface RiwayatProps {
  formData: FormData;
  leaveHistory: Record<string, LeaveHistoryEntry[]>;
  setLeaveHistory: React.Dispatch<React.SetStateAction<Record<string, LeaveHistoryEntry[]>>>;
}

const Riwayat: React.FC<RiwayatProps> = ({ formData, leaveHistory, setLeaveHistory }) => {
  
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

  const handleSaveToHistory = () => {
    if (!formData.nipPegawai) {
      alert("NIP Pegawai harus diisi untuk menyimpan riwayat.");
      return;
    }
    if (!formData.tglMulai || !formData.tglSelesai) {
      alert("Tanggal Mulai dan Selesai harus diisi.");
      return;
    }

    const workingDays = calculateWorkingDays(formData.tglMulai, formData.tglSelesai);
    
    if (workingDays <= 0) {
      alert("Durasi cuti tidak valid (0 hari).");
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

    setLeaveHistory(prev => {
      const existing = prev[nip] || [];
      return { ...prev, [nip]: [newEntry, ...existing] };
    });

    alert("Riwayat cuti berhasil disimpan ke database lokal!");
  };

  const handleDeleteHistory = (id: string) => {
    if (!window.confirm("Hapus riwayat cuti ini?")) return;
    const nip = formData.nipPegawai.trim();
    setLeaveHistory(prev => {
      const existing = prev[nip] || [];
      return { ...prev, [nip]: existing.filter(e => e.id !== id) };
    });
  };

  // Menghitung total hak cuti tersedia (N + N-1 + N-2)
  const totalTersedia = (parseInt(formData.sisaCutiN, 10) || 0) + 
                        (parseInt(formData.sisaCutiN_1, 10) || 0) + 
                        (parseInt(formData.sisaCutiN_2, 10) || 0);
  
  const totalTerpakai = calculateUsedLeaveCurrentYear();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-4">
         <div className="flex items-center">
             <History className="w-6 h-6 mr-2 text-blue-600"/>
             <h2 className="text-xl font-bold text-gray-800">Manajemen Riwayat Cuti</h2>
         </div>
         <button 
           onClick={handleSaveToHistory}
           className="flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm transition-all"
           title="Simpan data dari form di atas ke dalam riwayat"
         >
           <PlusCircle className="w-4 h-4 mr-2"/>
           Catat Permohonan Saat Ini
         </button>
      </div>

      {/* Ringkasan Dashboard Riwayat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
                <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Total Hak Cuti Tersedia</p>
                <p className="text-3xl font-black text-blue-900 leading-none mt-1">{totalTersedia} <span className="text-sm font-medium">Hari</span></p>
                <p className="text-xs text-blue-600 mt-1 italic">*Akumulasi N + N-1 + N-2</p>
            </div>
         </div>

         <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex items-center shadow-sm">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
                <CalendarDays className="w-8 h-8 text-orange-600" />
            </div>
            <div>
                <p className="text-sm font-semibold text-orange-800 uppercase tracking-wider">Total Hak Cuti Terpakai</p>
                <p className="text-3xl font-black text-orange-900 leading-none mt-1">{totalTerpakai} <span className="text-sm font-medium">Hari</span></p>
                <p className="text-xs text-orange-600 mt-1 italic">*Tercatat di riwayat tahun berjalan</p>
            </div>
         </div>
      </div>
      
      {/* Table Riwayat Cuti */}
      <div className="mt-4">
        {!formData.nipPegawai ? (
           <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-10 text-center">
              <p className="text-gray-500 text-sm font-medium">Silakan masukkan NIP Pegawai di formulir data pegawai</p>
              <p className="text-gray-400 text-xs mt-1">untuk melihat riwayat cuti yang tersimpan.</p>
           </div>
        ) : getMyHistory().length === 0 ? (
           <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-10 text-center">
              <p className="text-gray-500 text-sm font-medium">Belum ada riwayat cuti untuk NIP {formData.nipPegawai}</p>
              <p className="text-gray-400 text-xs mt-1">Klik tombol "Catat Permohonan" untuk menyimpan data.</p>
           </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis Cuti</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durasi</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Alasan</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getMyHistory().map((entry) => (
                  <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatIndonesianDate(entry.tglMulai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN ? 'bg-green-100 text-green-700' :
                        entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_SAKIT ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN ? 'Tahunan' : 
                         entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_SAKIT ? 'Sakit' : 
                         entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_MELAHIRKAN ? 'Melahirkan' : 'Lainnya'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {entry.lamaCuti} Hari
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {entry.alasanCuti || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteHistory(entry.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus riwayat"
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
    </div>
  );
};

export default Riwayat;
