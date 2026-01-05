
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FormData, LeaveHistoryEntry } from '../types';
import { LetterType } from '../types';
import { calculateBalineseDate } from '../utils/balineseCalendar';
import { calculateWorkingDays, calculateWorkDuration } from '../utils/dateCalculator';
import { Save, Trash2, Upload, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import Riwayat from './Riwayat';

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
}

const resizeImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str) return resolve('');
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.8));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

const InputField: React.FC<{ label: string; id: keyof FormData; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; required?: boolean; placeholder?: string, rows?: number, readOnly?: boolean, helperText?: string }> = ({ label, id, value, onChange, type = 'text', required = true, placeholder, rows, readOnly=false, helperText }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {type === 'textarea' ? (
       <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
        rows={rows || 3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
    )}
    {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
  </div>
);

const ImageUploadField: React.FC<{
  label: string;
  id: keyof FormData;
  value: string;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onRemoveBackground: (id: keyof FormData) => void;
  isProcessing: boolean;
}> = ({ label, id, value, setFormData, onRemoveBackground, isProcessing }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const resized = await resizeImage(base64);
        setFormData(prev => ({ ...prev, [id]: resized }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <img src={value} alt="Pratinau Logo" className="w-20 h-20 object-contain border p-1 rounded-md" />
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-xs text-gray-500 shrink-0">Pratinjau</div>
        )}
        <div className="flex-grow space-y-2">
          <input
            type="file"
            id={id}
            name={id}
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {value && (
             <button 
                onClick={() => onRemoveBackground(id)} 
                disabled={isProcessing}
                className="flex items-center justify-center w-full px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-wait"
             >
                {isProcessing ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </span>
                ) : (
                    <span>Buat Transparan (Offline)</span>
                )}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
  setLeaveHistory
}) => {
  const [isProcessing, setIsProcessing] = useState<keyof FormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveBackground = useCallback((id: keyof FormData) => {
    const imageData = formData[id] as string;
    if (!imageData) return;
    setIsProcessing(id);
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageData;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setIsProcessing(null); return; }
      ctx.drawImage(image, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const r_bg = data[0], g_bg = data[1], b_bg = data[2];
      const tolerance = 20;
      for (let i = 0; i < data.length; i += 4) {
        const distance = Math.sqrt(Math.pow(data[i] - r_bg, 2) + Math.pow(data[i+1] - g_bg, 2) + Math.pow(data[i+2] - b_bg, 2));
        if (distance <= tolerance) data[i + 3] = 0;
      }
      ctx.putImageData(imgData, 0, 0);
      setFormData(prev => ({ ...prev, [id]: canvas.toDataURL('image/png') }));
      setIsProcessing(null);
    };
    image.onerror = () => setIsProcessing(null);
  }, [formData, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExport = () => {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Data Pegawai
      const pegawaiData = Object.values(profiles).map(profile => {
          const { logoDinas, logoSekolah, ...rest } = profile as any;
          return rest;
      });
      const wsPegawai = XLSX.utils.json_to_sheet(pegawaiData);
      XLSX.utils.book_append_sheet(wb, wsPegawai, 'Data Pegawai');

      // Sheet 2: Logo Global
      const CHUNK_SIZE = 30000;
      const logoData: any[] = [];
      const processLogo = (label: string, data: string) => {
          if (!data) return;
          for (let i = 0, part = 1; i < data.length; i += CHUNK_SIZE, part++) {
              logoData.push({ Tipe: label, Urutan: part, Konten: data.substring(i, i + CHUNK_SIZE) });
          }
      };
      processLogo('LogoDinas', formData.logoDinas);
      processLogo('LogoSekolah', formData.logoSekolah);
      const wsLogos = XLSX.utils.json_to_sheet(logoData);
      XLSX.utils.book_append_sheet(wb, wsLogos, 'Logo Aplikasi');

      // Sheet Per Pegawai: Riwayat Cuti
      Object.entries(profiles).forEach(([name, profileData]) => {
          // Fix: Added explicit casting to FormData to resolve 'Property nipPegawai does not exist on type unknown' error.
          const profile = profileData as FormData;
          const nip = profile.nipPegawai?.trim();
          if (nip && leaveHistory[nip] && leaveHistory[nip].length > 0) {
              // Nama Sheet maksimal 31 karakter
              const sheetName = `RIW_${name.substring(0, 25)}`.trim();
              const historyData = leaveHistory[nip].map(entry => ({
                  'Tgl Mulai': entry.tglMulai,
                  'Tgl Selesai': entry.tglSelesai,
                  'Lama (Hari)': entry.lamaCuti,
                  'Jenis': entry.jenisCuti,
                  'Alasan': entry.alasanCuti,
                  'NIP_OWNER': nip // ID unik untuk relasi saat impor
              }));
              const wsHistory = XLSX.utils.json_to_sheet(historyData);
              XLSX.utils.book_append_sheet(wb, wsHistory, sheetName);
          }
      });

      XLSX.writeFile(wb, 'data_lengkap_cuti_guru.xlsx');
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
            const workbook = XLSX.read(ev.target?.result, { type: 'array' });
            
            // 1. Proses Logo
            let importedDinas = '';
            let importedSekolah = '';
            if (workbook.SheetNames.includes('Logo Aplikasi')) {
                const logoJson = XLSX.utils.sheet_to_json(workbook.Sheets['Logo Aplikasi']) as any[];
                importedDinas = logoJson.filter(row => row.Tipe === 'LogoDinas').sort((a,b) => a.Urutan - b.Urutan).map(row => row.Konten).join('');
                importedSekolah = logoJson.filter(row => row.Tipe === 'LogoSekolah').sort((a,b) => a.Urutan - b.Urutan).map(row => row.Konten).join('');
            }

            // 2. Proses Pegawai
            const newProfiles = { ...profiles };
            if (workbook.SheetNames.includes('Data Pegawai')) {
                const pegawaiJson = XLSX.utils.sheet_to_json(workbook.Sheets['Data Pegawai']) as any[];
                pegawaiJson.forEach((row) => {
                    if (row.namaPegawai) newProfiles[row.namaPegawai.trim()] = row;
                });
            }
            
            // 3. Proses Riwayat Cuti (Mencari Sheet berawalan RIW_)
            const newHistory = { ...leaveHistory };
            workbook.SheetNames.forEach(sheetName => {
                if (sheetName.startsWith('RIW_')) {
                    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];
                    if (rows.length > 0) {
                        const nip = rows[0].NIP_OWNER;
                        if (nip) {
                            newHistory[nip] = rows.map(r => ({
                                id: Date.now().toString() + Math.random(),
                                tglMulai: r['Tgl Mulai'],
                                tglSelesai: r['Tgl Selesai'],
                                lamaCuti: r['Lama (Hari)'],
                                jenisCuti: r['Jenis'],
                                alasanCuti: r['Alasan'],
                                timestamp: Date.now()
                            }));
                        }
                    }
                }
            });
            
            setProfiles(newProfiles);
            setLeaveHistory(newHistory);
            
            if (importedDinas || importedSekolah) {
                setFormData(prev => ({ 
                    ...prev, 
                    logoDinas: importedDinas || prev.logoDinas, 
                    logoSekolah: importedSekolah || prev.logoSekolah 
                }));
            }
            alert('Impor berhasil. Profil dan riwayat cuti telah diperbarui.');
          } catch (error) {
              console.error("Gagal mengimpor file:", error);
              alert("Gagal mengimpor file. Pastikan format file benar.");
          }
      };
      reader.readAsArrayBuffer(file);
      e.target.value = '';
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

  useEffect(() => {
      const newMasaKerja = calculateWorkDuration(formData.tglMulaiKerja);
      if (newMasaKerja && newMasaKerja !== formData.masaKerjaPegawai) {
          setFormData(prev => ({ ...prev, masaKerjaPegawai: newMasaKerja }));
      }
  }, [formData.tglMulaiKerja]);

  const totalSisaCuti = (parseInt(formData.sisaCutiN, 10) || 0) + 
                        (parseInt(formData.sisaCutiN_1, 10) || 0) + 
                        (parseInt(formData.sisaCutiN_2, 10) || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Manajemen Profil Pegawai</h2>
        <div className="space-y-4">
          <select
            value={activeProfileKey ?? ''}
            onChange={(e) => onProfileChange(e.target.value || null)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
          >
            <option value="">-- Buat Profil Baru --</option>
            {Object.keys(profiles).sort().map(key => <option key={key} value={key}>{key}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            <button onClick={onSaveProfile} className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition">
              <Save className="w-4 h-4 mr-2"/> Simpan Profil
            </button>
            <button onClick={onDeleteProfile} disabled={!activeProfileKey} className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400">
              <Trash2 className="w-4 h-4 mr-2"/> Hapus Profil
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
             <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition">
               <Upload className="w-4 h-4 mr-2" /> Impor Data Lengkap
             </button>
             <button onClick={handleExport} disabled={Object.keys(profiles).length === 0} className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition">
               <Download className="w-4 h-4 mr-2" /> Ekspor Data (Multi-Sheet)
             </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls" className="hidden" />
          <p className="text-[10px] text-gray-400 italic">*Ekspor mencakup data pegawai, logo global, dan riwayat per pegawai.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Kop Surat & Sekolah</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ImageUploadField label="Logo Dinas" id="logoDinas" value={formData.logoDinas} setFormData={setFormData} onRemoveBackground={handleRemoveBackground} isProcessing={isProcessing === 'logoDinas'} />
          <ImageUploadField label="Logo Sekolah" id="logoSekolah" value={formData.logoSekolah} setFormData={setFormData} onRemoveBackground={handleRemoveBackground} isProcessing={isProcessing === 'logoSekolah'} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Alamat Sekolah" id="alamatSekolah" value={formData.alamatSekolah} onChange={handleChange} />
          <InputField label="Telepon Sekolah" id="teleponSekolah" value={formData.teleponSekolah} onChange={handleChange} />
          <InputField label="Email Sekolah" id="emailSekolah" value={formData.emailSekolah} onChange={handleChange} />
          <InputField label="Website" id="websiteSekolah" value={formData.websiteSekolah} onChange={handleChange} required={false} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Data Pegawai (Pemohon)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Nama Lengkap" id="namaPegawai" value={formData.namaPegawai} onChange={handleChange} />
          <InputField label="NIP" id="nipPegawai" value={formData.nipPegawai} onChange={handleChange} placeholder="Relasi untuk riwayat cuti" />
          <InputField label="Pangkat / Golongan ruang" id="pangkatGolonganPegawai" value={formData.pangkatGolonganPegawai} onChange={handleChange} />
          <InputField label="Jabatan" id="jabatanPegawai" value={formData.jabatanPegawai} onChange={handleChange} />
          <InputField label="Unit Kerja" id="unitKerjaPegawai" value={formData.unitKerjaPegawai} onChange={handleChange} />
          <InputField label="Satuan Organisasi" id="satuanOrganisasi" value={formData.satuanOrganisasi} onChange={handleChange} />
          <InputField label="Status Pegawai" id="statusPegawai" value={formData.statusPegawai} onChange={handleChange} />
          <InputField label="Tanggal Mulai Kerja" id="tglMulaiKerja" value={formData.tglMulaiKerja} onChange={handleChange} type="date" required={false} />
          <InputField label="Masa Kerja" id="masaKerjaPegawai" value={formData.masaKerjaPegawai} onChange={handleChange} required={false} readOnly />
          <InputField label="Nomor Telepon" id="telpPegawai" value={formData.telpPegawai} onChange={handleChange} />
          <InputField label="Alamat Selama Cuti" id="alamatSelamaCuti" value={formData.alamatSelamaCuti} onChange={handleChange} type="textarea" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Detail Permohonan Cuti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label htmlFor="jenisCuti" className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
            <select id="jenisCuti" name="jenisCuti" value={formData.jenisCuti} onChange={(e) => setFormData(prev => ({ ...prev, jenisCuti: e.target.value as LetterType }))} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value={LetterType.SURAT_IZIN_DINAS_TAHUNAN}>Cuti Tahunan</option>
              <option value={LetterType.SURAT_IZIN_DINAS_SAKIT}>Cuti Sakit</option>
              <option value={LetterType.SURAT_IZIN_DINAS_MELAHIRKAN}>Cuti Melahirkan</option>
            </select>
          </div>
          <InputField label="Tanggal Mulai" id="tglMulai" value={formData.tglMulai} onChange={handleChange} type="date" />
          <InputField label="Tanggal Selesai" id="tglSelesai" value={formData.tglSelesai} onChange={handleChange} type="date" />
          <div className="md:col-span-2">
            <InputField label="Alasan Cuti" id="alasanCuti" value={formData.alasanCuti} onChange={handleChange} type="textarea" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Jatah Cuti Tahunan" id="jatahCutiTahunan" value={formData.jatahCutiTahunan} onChange={handleChange} type="number" />
          <InputField label="Lama Cuti (Saat Ini)" id="lamaCuti" value={formData.lamaCuti} onChange={handleChange} readOnly />
          <InputField label="Sisa Cuti (N)" id="sisaCutiN" value={formData.sisaCutiN} onChange={handleChange} readOnly />
          <InputField label="Sisa Cuti (N-1)" id="sisaCutiN_1" value={formData.sisaCutiN_1} onChange={handleChange} type="number" required={false} />
          <InputField label="Sisa Cuti (N-2)" id="sisaCutiN_2" value={formData.sisaCutiN_2} onChange={handleChange} type="number" required={false} />
          <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-center">
             <div className="flex-grow">
                <p className="text-xs font-bold text-green-800 uppercase">Total Hak Cuti Tersedia</p>
                <p className="text-2xl font-black text-green-700">{totalSisaCuti} Hari</p>
             </div>
             <Info className="w-5 h-5 text-green-500 ml-2" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Pejabat Penandatangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Nama Kepala Sekolah" id="namaAtasan" value={formData.namaAtasan} onChange={handleChange} />
          <InputField label="NIP Kepala Sekolah" id="nipAtasan" value={formData.nipAtasan} onChange={handleChange} />
          <InputField label="Pangkat / Golongan Kepala Sekolah" id="pangkatGolonganAtasan" value={formData.pangkatGolonganAtasan} onChange={handleChange} />
          <InputField label="Jabatan Atasan" id="jabatanAtasan" value={formData.jabatanAtasan} onChange={handleChange} readOnly />
          <div className="md:col-span-2 border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Nama Pejabat Berwenang" id="namaPejabat" value={formData.namaPejabat} onChange={handleChange} />
            <InputField label="NIP Pejabat Berwenang" id="nipPejabat" value={formData.nipPejabat} onChange={handleChange} />
            <div className="md:col-span-2">
                <InputField label="Jabatan Pejabat Berwenang" id="jabatanPejabat" value={formData.jabatanPejabat} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Administrasi Surat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="No. Surat Sekolah" id="nomorSuratSekolah" value={formData.nomorSuratSekolah} onChange={handleChange} />
          <InputField label="No. Surat Dinas" id="nomorSuratDinas" value={formData.nomorSuratDinas} onChange={handleChange} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Surat</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" name="tglSurat" value={formData.tglSurat} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2" />
              <input type="text" value={formData.tglSuratBali} readOnly className="w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>
        </div>
      </div>
      
      <Riwayat formData={formData} leaveHistory={leaveHistory} setLeaveHistory={setLeaveHistory} />
    </div>
  );
};

export default DataForm;
