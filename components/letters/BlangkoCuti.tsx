
import React from 'react';
import type { FormData } from '../../types';
import { formatIndonesianDate } from '../../utils/dateFormatter';
import { LetterType } from '../../types';

interface Props {
  formData: FormData;
}

const BlangkoCuti: React.FC<Props> = ({ formData }) => {
  const {
    namaPegawai, nipPegawai, jabatanPegawai, masaKerjaPegawai, unitKerjaPegawai, statusPegawai,
    alasanCuti, lamaCuti, tglMulai, tglSelesai, alamatSelamaCuti, telpPegawai,
    namaAtasan, nipAtasan, jabatanAtasan,
    namaPejabat, nipPejabat, jabatanPejabat,
    tglSurat, jenisCuti
  } = formData;

  const isTahunan = jenisCuti === LetterType.SURAT_IZIN_DINAS_TAHUNAN;
  const isSakit = jenisCuti === LetterType.SURAT_IZIN_DINAS_SAKIT;
  const isMelahirkan = jenisCuti === LetterType.SURAT_IZIN_DINAS_MELAHIRKAN;

  /**
   * Logika "Shrink to Fit" - Menghitung beban visual teks dan mengembalikan objek style.
   * Menggunakan inline style karena Tailwind JIT sulit menangani nilai font-size dinamis hasil kalkulasi.
   */
  const getShrinkToFitStyle = (name: string, nip: string, capacityLimit: number): React.CSSProperties => {
    const fullNip = nip ? `NIP. ${nip}` : '';
    
    const getVisualWeight = (str: string) => {
      return str.split('').reduce((acc, char) => {
        if (/[A-Z]/.test(char)) return acc + 1.2; // Huruf kapital lebih lebar
        if (/[a-z0-9]/.test(char)) return acc + 0.9;
        if (/[\s.,\-/]/.test(char)) return acc + 0.6;
        return acc + 1.1;
      }, 0);
    };

    const nameWeight = getVisualWeight(name || '');
    const nipWeight = getVisualWeight(fullNip);
    const maxWeight = Math.max(nameWeight, nipWeight);

    // Jika beban visual di bawah limit, gunakan ukuran standar 10pt
    if (maxWeight <= capacityLimit) return { fontSize: '10pt' };
    
    // Hitung faktor penyusutan (skala)
    const shrinkFactor = capacityLimit / maxWeight;
    const calculatedSize = 10 * shrinkFactor;
    
    // Minimal font size 6.5pt agar tetap terbaca oleh mata manusia/scanner
    const finalSize = Math.max(6.5, calculatedSize);
    
    return { fontSize: `${finalSize.toFixed(2)}pt` };
  };

  const Check = ({ cond }: { cond: boolean }) => (
    <div className="flex justify-center items-center h-full text-[12pt]">
      {cond ? '✓' : ''}
    </div>
  );

  const DurationUnit = () => {
    const text = (lamaCuti || '').toLowerCase();
    const isHari = text.includes('hari');
    const isBulan = text.includes('bulan');
    const isTahun = text.includes('tahun');
    const hasUnit = isHari || isBulan || isTahun;

    const getStyle = (isMatch: boolean) => ({
      textDecoration: hasUnit && !isMatch ? 'line-through' : 'none',
      color: hasUnit && !isMatch ? '#9ca3af' : 'inherit'
    });

    return (
      <span className="whitespace-nowrap">
        (<span style={getStyle(isHari)}>hari</span>/
        <span style={getStyle(isBulan)}>bulan</span>/
        <span style={getStyle(isTahun)}>tahun</span>)*
      </span>
    );
  };
  
  const getDurationNumber = () => {
      if (!lamaCuti) return '-';
      const match = lamaCuti.match(/\d+/);
      return match ? match[0] : '-';
  };

  return (
    <div className="font-['Arial',_sans-serif] text-black text-[10pt] leading-[1.1] max-w-[215mm] mx-auto bg-white p-4">
      {/* HEADER KANAN */}
      <div className="flex justify-end mb-2">
        <div className="w-[50%] text-[9pt] font-medium leading-[1.1]">
          <p>LAMPIRAN II</p>
          <p>PERATURAN BADAN KEPEGAWAIAN NEGARA REPUBLIK INDONESIA</p>
          <p>NOMOR 7 TAHUN 2022</p>
          <p>TENTANG</p>
          <p>TATA CARA PEMBERIAN CUTI PEGAWAI NEGERI SIPIL</p>
        </div>
      </div>

      {/* TANGGAL DAN ALAMAT */}
      <div className="flex flex-col items-end mb-2">
        <div className="w-full text-right mb-2 text-[10pt]">
          Denpasar, {formatIndonesianDate(tglSurat) || '................................'}
        </div>
        <div className="w-[50%] text-left text-[10pt]">
          <p>Kepada</p>
          <p>Yth. Kepala Dinas Pendidikan Kepemudaan</p>
          <p className="pl-6">dan Olahraga Kota Denpasar</p>
          <p>di -</p>
          <p className="pl-8">Denpasar</p>
        </div>
      </div>

      <div className="text-center font-bold text-[10pt] mb-2 uppercase">
        FORMULIR PERMINTAAN DAN PEMBERIAN CUTI
      </div>

      {/* I. DATA PEGAWAI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[2px] font-bold border-b border-black">I. DATA PEGAWAI</div>
        <div className="grid grid-cols-[100px_1fr_100px_1fr]">
          <div className="px-2 py-[2px] border-r border-b border-black">Nama</div>
          <div className="px-2 py-[2px] border-r border-b border-black overflow-hidden">
            <p 
              style={getShrinkToFitStyle(namaPegawai, '', 30)} 
              className="whitespace-nowrap inline-block max-w-full leading-tight"
            >
              {namaPegawai}
            </p>
          </div>
          <div className="px-2 py-[2px] border-r border-b border-black">NIP</div>
          <div className="px-2 py-[2px] border-b border-black">{nipPegawai}</div>
          
          <div className="px-2 py-[2px] border-r border-b border-black">Jabatan</div>
          <div className="px-2 py-[2px] border-r border-b border-black">{jabatanPegawai}</div>
          <div className="px-2 py-[2px] border-r border-b border-black">Masa Kerja</div>
          <div className="px-2 py-[2px] border-b border-black">{masaKerjaPegawai}</div>
          
          <div className="px-2 py-[2px] border-r border-black">Unit Kerja</div>
          <div className="px-2 py-[2px] col-span-3">{unitKerjaPegawai}</div>
        </div>
      </div>

      {/* II. JENIS CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[2px] font-bold border-b border-black">II. JENIS CUTI YANG DIAMBIL**</div>
        <div className="grid grid-cols-[1fr_50px]">
           <div className="px-2 py-[2px] border-r border-b border-black">1. Cuti Tahunan</div>
           <div className="px-2 py-[2px] border-b border-black text-center"><Check cond={isTahunan} /></div>
           <div className="px-2 py-[2px] border-r border-b border-black">2. Cuti Sakit</div>
           <div className="px-2 py-[2px] border-b border-black text-center"><Check cond={isSakit} /></div>
           <div className="px-2 py-[2px] border-r border-black">3. Cuti Melahirkan</div>
           <div className="px-2 py-[2px] border-black text-center"><Check cond={isMelahirkan} /></div>
        </div>
      </div>

      {/* III. ALASAN CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[2px] font-bold border-b border-black">III. ALASAN CUTI</div>
        <div className="px-2 py-[2px] min-h-[25px]">{alasanCuti}</div>
      </div>

      {/* IV. LAMANYA CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[2px] font-bold border-b border-black">IV. LAMANYA CUTI</div>
        <div className="grid grid-cols-[60px_1.5fr_100px_1fr_40px_1fr]">
            <div className="px-2 py-[2px] border-r border-black">Selama</div>
            <div className="px-2 py-[2px] border-r border-black whitespace-nowrap">
                {getDurationNumber()} <DurationUnit />
            </div>
            <div className="px-2 py-[2px] border-r border-black">mulai tanggal</div>
            <div className="px-2 py-[2px] border-r border-black">{tglMulai ? formatIndonesianDate(tglMulai) : '-'}</div>
            <div className="px-2 py-[2px] border-r border-black text-center">s/d</div>
            <div className="px-2 py-[2px]">{tglSelesai ? formatIndonesianDate(tglSelesai) : '-'}</div>
        </div>
      </div>

      {/* V. CATATAN CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[2px] font-bold border-b border-black">V. CATATAN CUTI***</div>
        <div className="grid grid-cols-[60px_1.5fr_100px_1fr_40px_1fr]">
            <div className="px-2 py-[2px] border-r border-b border-black col-span-5">1. Cuti Tahunan</div>
            <div className="px-2 py-[2px] border-b border-black"></div>
            <div className="px-2 py-[2px] border-r border-b border-black col-span-5">2. Cuti Sakit</div>
            <div className="px-2 py-[2px] border-b border-black"></div>
            <div className="px-2 py-[2px] border-r border-black col-span-5">3. Cuti Melahirkan</div>
            <div className="px-2 py-[2px] border-black"></div>
        </div>
      </div>

      {/* VI. ALAMAT */}
      <div className="mb-1 border border-black overflow-hidden">
        <div className="px-2 py-[2px] font-bold border-b border-black">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
        <div className="flex">
            <div className="w-[60%] border-r border-black px-2 py-[2px] min-h-[70px]">
                {alamatSelamaCuti}
            </div>
            <div className="w-[40%] flex flex-col">
                <div className="px-2 py-[2px] border-b border-black">
                    TELP: {telpPegawai}
                </div>
                <div className="flex flex-col justify-center items-center flex-grow p-2">
                    <div className="mb-[30px] text-center">Hormat saya,</div>
                    <div className="text-center w-full overflow-hidden">
                        <p 
                          style={getShrinkToFitStyle(namaPegawai, nipPegawai, 28)}
                          className="font-bold underline whitespace-nowrap inline-block max-w-full leading-tight"
                        >
                            {namaPegawai || '................................'}
                        </p>
                        <p 
                          style={getShrinkToFitStyle(namaPegawai, nipPegawai, 28)}
                          className="whitespace-nowrap inline-block max-w-full leading-tight"
                        >
                            NIP. {nipPegawai || '................................'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* VII. PERTIMBANGAN ATASAN */}
      <div className="mb-1">
        <div className="px-2 py-[2px] font-bold border border-black">VII. PERTIMBANGAN ATASAN LANGSUNG**</div>
        <div className="grid grid-cols-4">
            <div className="px-1 py-[2px] border-l border-r border-b border-black text-center text-[9pt]">DISETUJUI (✓)</div>
            <div className="px-1 py-[2px] border-r border-b border-black text-center text-[9pt] line-through text-gray-500">PERUBAHAN****</div>
            <div className="px-1 py-[2px] border-r border-b border-black text-center text-[9pt] line-through text-gray-500">DITANGGUHKAN****</div>
            <div className="px-1 py-[2px] border-r border-b border-black text-center text-[9pt] line-through text-gray-500">TIDAK DISETUJUI****</div>

            <div className="h-[25px] border-l border-r border-b border-black"></div>
            <div className="h-[25px] border-r border-b border-black"></div>
            <div className="h-[25px] border-r border-b border-black"></div>
            <div className="h-[25px] border-r border-b border-black"></div>
            
            <div className=""></div> 
            <div className="border-r border-black"></div>
            <div className="col-span-2 flex flex-col justify-between min-h-[104px] border-r border-b border-black p-2 overflow-hidden">
                 <div className="w-full text-center">
                    <p>{jabatanAtasan}</p>
                 </div>
                 <div className="text-center w-full overflow-hidden">
                    <p 
                      style={getShrinkToFitStyle(namaAtasan, nipAtasan, 38)}
                      className="font-bold underline whitespace-nowrap inline-block max-w-full leading-tight"
                    >
                        {namaAtasan || '................................'}
                    </p>
                    <p 
                      style={getShrinkToFitStyle(namaAtasan, nipAtasan, 38)}
                      className="whitespace-nowrap inline-block max-w-full leading-tight"
                    >
                        NIP. {nipAtasan || '................................'}
                    </p>
                 </div>
            </div>
        </div>
      </div>

      {/* VIII. KEPUTUSAN PEJABAT */}
      <div className="mb-1">
        <div className="px-2 py-[2px] font-bold border border-black">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI**</div>
        <div className="grid grid-cols-4">
            <div className="px-1 py-[2px] border-l border-r border-b border-black text-center text-[9pt]">DISETUJUI (✓)</div>
            <div className="px-1 py-[2px] border-r border-b border-black text-center text-[9pt] line-through text-gray-500">PERUBAHAN****</div>
            <div className="px-1 py-[2px] border-r border-b border-black text-center text-[9pt] line-through text-gray-500">DITANGGUHKAN****</div>
            <div className="px-1 py-[2px] border-r border-b border-black text-center text-[9pt] line-through text-gray-500">TIDAK DISETUJUI****</div>

            <div className="h-[25px] border-l border-r border-b border-black"></div>
            <div className="h-[25px] border-r border-b border-black"></div>
            <div className="h-[25px] border-r border-b border-black"></div>
            <div className="h-[25px] border-r border-b border-black"></div>
            
            <div className=""></div> 
            <div className="border-r border-black"></div>
            <div className="col-span-2 flex flex-col justify-between min-h-[110px] border-r border-b border-black p-2 overflow-hidden">
                 <div className="w-full text-center">
                    <p>{jabatanPejabat}</p>
                 </div>
                 <div className="text-center w-full overflow-hidden">
                    <p 
                      style={getShrinkToFitStyle(namaPejabat, nipPejabat, 38)}
                      className="font-bold underline whitespace-nowrap inline-block max-w-full leading-tight"
                    >
                        {namaPejabat || '................................'}
                    </p>
                    <p 
                      style={getShrinkToFitStyle(namaPejabat, nipPejabat, 38)}
                      className="whitespace-nowrap inline-block max-w-full leading-tight"
                    >
                        NIP. {nipPejabat || '................................'}
                    </p>
                 </div>
            </div>
        </div>
      </div>

      {/* FOOTER NOTES */}
      <div className="text-[8.5pt] mt-3">
        <p className="font-bold mb-1">Catatan:</p>
        <div className="grid grid-cols-[35px_10px_1fr] gap-y-0.5 leading-[1]">
           <div>*</div><div className="text-center">:</div><div>Coret yang tidak perlu</div>
           <div>**</div><div className="text-center">:</div><div>Pilih salah satu dengan memberi tanda centang (✓)</div>
           <div>***</div><div className="text-center">:</div><div>Diisi oleh pejabat yang menangani bidang kepegawaian sebelum {statusPegawai || 'PNS'} mengajukan cuti</div>
           <div>****</div><div className="text-center">:</div><div>Diberi tanda centang dan alasannya</div>
           <div>N</div><div className="text-center">:</div><div>Cuti tahun berjalan</div>
           <div>N-1</div><div className="text-center">:</div><div>Sisa cuti 1 Tahun sebelumnya</div>
           <div>N-2</div><div className="text-center">:</div><div>Sisa cuti 2 tahun sebelumnya</div>
        </div>
      </div>
    </div>
  );
};

export default BlangkoCuti;
