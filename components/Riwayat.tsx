
import React, { useCallback } from 'react';
import type { FormData, LeaveHistoryEntry } from '../types';
import { LetterType } from '../types';
import { calculateWorkingDays } from '../utils/dateCalculator';
import { formatIndonesianDate } from '../utils/dateFormatter';
import { History, PlusCircle, Trash2 } from 'lucide-react';

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

    alert("Riwayat cuti berhasil disimpan!");
  };

  const handleDeleteHistory = (id: string) => {
    if (!window.confirm("Hapus riwayat cuti ini?")) return;
    const nip = formData.nipPegawai.trim();
    setLeaveHistory(prev => {
      const existing = prev[nip] || [];
      return { ...prev, [nip]: existing.filter(e => e.id !== id) };
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      
      <div className="flex justify-between items-center border-b pb-3">
         <div className="flex items-center">
             <History className="w-5 h-5 mr-2 text-gray-600"/>
             <h2 className="text-xl font-bold text-gray-800">Manajemen Riwayat Cuti</h2>
         </div>
         <button 
           onClick={handleSaveToHistory}
           className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 shadow-sm"
           title="Simpan data dari form di atas ke dalam riwayat"
         >
           <PlusCircle className="w-4 h-4 mr-2"/>
           Catat Permohonan Saat Ini
         </button>
      </div>

      {/* Info Sisa Cuti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50 p-4 rounded-md border border-blue-100">
         <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Jatah Tahunan</p>
            <p className="text-xl font-bold text-gray-800">{formData.jatahCutiTahunan || 0} Hari</p>
         </div>
         <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Terpakai (Riwayat)</p>
            <p className="text-xl font-bold text-red-600">{calculateUsedLeaveCurrentYear()} Hari</p>
         </div>
         <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Sisa Cuti (N)</p>
            <p className="text-xl font-bold text-green-600">{formData.sisaCutiN} Hari</p>
         </div>
      </div>
      
      {/* Table Riwayat Cuti */}
      <div>
        {!formData.nipPegawai ? (
           <p className="text-gray-500 text-sm italic text-center py-4">Masukkan NIP Pegawai di form data pegawai untuk melihat riwayat.</p>
        ) : getMyHistory().length === 0 ? (
           <p className="text-gray-500 text-sm italic text-center py-4">Belum ada riwayat cuti tercatat untuk NIP ini.</p>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getMyHistory().map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatIndonesianDate(entry.tglMulai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN ? 'Tahunan' : 
                       entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_SAKIT ? 'Sakit' : 
                       entry.jenisCuti === LetterType.SURAT_IZIN_DINAS_MELAHIRKAN ? 'Melahirkan' : 'Lainnya'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.lamaCuti} Hari
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {entry.alasanCuti}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDeleteHistory(entry.id)} 
                        className="text-red-600 hover:text-red-900 transition-colors"
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
