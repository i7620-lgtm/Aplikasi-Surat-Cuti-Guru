
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

  // Render Checkmark if condition is true
  const Check = ({ cond }: { cond: boolean }) => (
    <div className="flex justify-center items-center h-full text-[12pt]">
      {cond ? '✓' : ''}
    </div>
  );

  // Helper untuk mencoret satuan waktu yang tidak dipilih
  const DurationUnit = () => {
    const text = (lamaCuti || '').toLowerCase();
    const isHari = text.includes('hari');
    const isBulan = text.includes('bulan');
    const isTahun = text.includes('tahun');
    const hasUnit = isHari || isBulan || isTahun;

    const getStyle = (isMatch: boolean) => ({
      textDecoration: hasUnit && !isMatch ? 'line-through' : 'none'
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
    <div className="font-['Arial',_sans-serif] text-black text-[10pt] leading-[1] max-w-[215mm] mx-auto bg-white p-4">
      {/* HEADER KANAN */}
      <div className="flex justify-end mb-2">
        <div className="w-[50%] text-[10pt] font-medium leading-[1]">
          <p>LAMPIRAN II</p>
          <p>PERATURAN BADAN KEPEGAWAIAN NEGARA REPUBLIK INDONESIA</p>
          <p>NOMOR 7 TAHUN 2022</p>
          <p>TENTANG</p>
          <p>TATA CARA PEMBERIAN CUTI PEGAWAI NEGERI SIPIL</p>
        </div>
      </div>

      {/* TANGGAL DAN ALAMAT */}
      <div className="flex flex-col items-end mb-2">
        <div className="w-full text-right mb-2">
          Denpasar, {formatIndonesianDate(tglSurat) || '................................'}
        </div>
        <div className="w-[50%] text-left">
          <p>Kepada</p>
          <p>Yth. Kepala Dinas Pendidikan Kepemudaan</p>
          <p className="pl-6">dan Olahraga Kota Denpasar</p>
          <p>di -</p>
          <p className="pl-8">Denpasar</p>
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center font-bold text-[10pt] mb-2 uppercase">
        FORMULIR PERMINTAAN DAN PEMBERIAN CUTI
      </div>

      {/* I. DATA PEGAWAI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[1px] font-bold border-b border-black">I. DATA PEGAWAI</div>
        <div className="grid grid-cols-[100px_1fr_100px_1fr]">
          {/* Row 1 */}
          <div className="px-2 py-[1px] border-r border-b border-black">Nama</div>
          <div className="px-2 py-[1px] border-r border-b border-black">{namaPegawai}</div>
          <div className="px-2 py-[1px] border-r border-b border-black">NIP</div>
          <div className="px-2 py-[1px] border-b border-black">{nipPegawai}</div>
          
          {/* Row 2 */}
          <div className="px-2 py-[1px] border-r border-b border-black">Jabatan</div>
          <div className="px-2 py-[1px] border-r border-b border-black">{jabatanPegawai}</div>
          <div className="px-2 py-[1px] border-r border-b border-black">Masa Kerja</div>
          <div className="px-2 py-[1px] border-b border-black">{masaKerjaPegawai}</div>
          
          {/* Row 3 */}
          <div className="px-2 py-[1px] border-r border-black">Unit Kerja</div>
          <div className="px-2 py-[1px] col-span-3">{unitKerjaPegawai}</div>
        </div>
      </div>

      {/* II. JENIS CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[1px] font-bold border-b border-black">II. JENIS CUTI YANG DIAMBIL**</div>
        <div className="grid grid-cols-[1fr_50px]">
           {/* Row 1 */}
           <div className="px-2 py-[1px] border-r border-b border-black">1. Cuti Tahunan</div>
           <div className="px-2 py-[1px] border-b border-black text-center"><Check cond={isTahunan} /></div>

           {/* Row 2 */}
           <div className="px-2 py-[1px] border-r border-b border-black">2. Cuti Sakit</div>
           <div className="px-2 py-[1px] border-b border-black text-center"><Check cond={isSakit} /></div>

           {/* Row 3 */}
           <div className="px-2 py-[1px] border-r border-black">3. Cuti Melahirkan</div>
           <div className="px-2 py-[1px] border-black text-center"><Check cond={isMelahirkan} /></div>
        </div>
      </div>

      {/* III. ALASAN CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[1px] font-bold border-b border-black">III. ALASAN CUTI</div>
        <div className="px-2 py-[1px] min-h-[20px]">{alasanCuti}</div>
      </div>

      {/* IV. LAMANYA CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[1px] font-bold border-b border-black">IV. LAMANYA CUTI</div>
        <div className="grid grid-cols-[60px_1.5fr_100px_1fr_40px_1fr]">
            <div className="px-2 py-[1px] border-r border-black">Selama</div>
            <div className="px-2 py-[1px] border-r border-black whitespace-nowrap">
                {getDurationNumber()} <DurationUnit />
            </div>
            <div className="px-2 py-[1px] border-r border-black">mulai tanggal</div>
            <div className="px-2 py-[1px] border-r border-black">{tglMulai ? formatIndonesianDate(tglMulai) : '-'}</div>
            <div className="px-2 py-[1px] border-r border-black text-center">s/d</div>
            <div className="px-2 py-[1px]">{tglSelesai ? formatIndonesianDate(tglSelesai) : '-'}</div>
        </div>
      </div>

      {/* V. CATATAN CUTI */}
      <div className="mb-1 border border-black">
        <div className="px-2 py-[1px] font-bold border-b border-black">V. CATATAN CUTI***</div>
        {/* Menggunakan grid yang sama dengan Table IV agar kolom terakhir (ruang tulis) sejajar dengan kolom tanggal terakhir */}
        <div className="grid grid-cols-[60px_1.5fr_100px_1fr_40px_1fr]">
            {/* Row 1: Cuti Tahunan */}
            <div className="px-2 py-[1px] border-r border-b border-black col-span-5">1. Cuti Tahunan</div>
            <div className="px-2 py-[1px] border-b border-black"></div>

            {/* Row 2: Cuti Sakit */}
            <div className="px-2 py-[1px] border-r border-b border-black col-span-5">2. Cuti Sakit</div>
            <div className="px-2 py-[1px] border-b border-black"></div>

            {/* Row 3: Cuti Melahirkan */}
            <div className="px-2 py-[1px] border-r border-black col-span-5">3. Cuti Melahirkan</div>
            <div className="px-2 py-[1px] border-black"></div>
        </div>
      </div>

      {/* VI. ALAMAT */}
      <div className="mb-1 border border-black">
        {/* Judul Kolom Full Width */}
        <div className="px-2 py-[1px] font-bold border-b border-black">VI. ALAMAT SELAMA MENJALANKAN CUTI</div>
        
        <div className="flex">
            {/* Kolom Kiri: Alamat */}
            <div className="w-[60%] border-r border-black px-2 py-[1px] min-h-[50px]">
                {alamatSelamaCuti}
            </div>
            
            {/* Kolom Kanan: Telp & Tanda Tangan */}
            <div className="w-[40%] flex flex-col">
                {/* Telp di atas Tanda Tangan */}
                <div className="px-2 py-[1px] border-b border-black">
                    TELP: {telpPegawai}
                </div>
                
                {/* Area Tanda Tangan Compact */}
                <div className="flex flex-col justify-center items-center flex-grow p-1">
                    {/* Dikurangi 5px: mb-10 (40px) -> mb-[35px] */}
                    <div className="mb-[35px] text-center">Hormat saya,</div>
                    <div className="text-center">
                        <p className="font-bold underline">{namaPegawai}</p>
                        <p>NIP. {nipPegawai}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* VII. PERTIMBANGAN ATASAN */}
      <div className="mb-1">
        <div className="px-2 py-[1px] font-bold border border-black">VII. PERTIMBANGAN ATASAN LANGSUNG**</div>
        <div className="grid grid-cols-4">
            {/* ROW 1: Headers */}
            <div className="px-1 py-[1px] border-l border-r border-b border-black text-center text-[10pt]">DISETUJUI (✓)</div>
            <div className="px-1 py-[1px] border-r border-b border-black text-center text-[10pt] line-through">PERUBAHAN****</div>
            <div className="px-1 py-[1px] border-r border-b border-black text-center text-[10pt] line-through">DITANGGUHKAN****</div>
            <div className="px-1 py-[1px] border-r border-b border-black text-center text-[10pt] line-through">TIDAK DISETUJUI****</div>

            {/* ROW 2: Kotak Kosong */}
            <div className="h-[20px] border-l border-r border-b border-black"></div>
            <div className="h-[20px] border-r border-b border-black"></div>
            <div className="h-[20px] border-r border-b border-black"></div>
            <div className="h-[20px] border-r border-b border-black"></div>
            
            {/* ROW 3: Space & Tanda Tangan */}
            {/* Col 1 */}
            <div className=""></div> 
            {/* Col 2: Tambah border-r agar garisnya sejajar dengan kolom di atasnya (kolom perubahan) */}
            <div className="border-r border-black"></div>
            
            {/* Col 3 & 4 Combined: Tanda Tangan. 
                Dikurangi 5px: min-h-[115px] -> min-h-[110px] */}
            <div className="col-span-2 flex flex-col justify-between min-h-[110px] border-r border-b border-black p-2">
                 {/* Jabatan langsung di atas */}
                 <div className="w-full text-center">
                    <p>{jabatanAtasan}</p>
                 </div>
                 
                 {/* Nama/NIP di bawah */}
                 <div className="flex flex-col items-center text-center w-full">
                     <div className="text-center w-full">
                        <p className="font-bold underline break-words">{namaAtasan}</p>
                        <p className="break-words">NIP. {nipAtasan}</p>
                     </div>
                 </div>
            </div>
        </div>
      </div>

      {/* VIII. KEPUTUSAN PEJABAT */}
      <div className="mb-1">
        <div className="px-2 py-[1px] font-bold border border-black">VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI**</div>
        <div className="grid grid-cols-4">
            {/* ROW 1: Headers */}
            <div className="px-1 py-[1px] border-l border-r border-b border-black text-center text-[10pt]">DISETUJUI (✓)</div>
            <div className="px-1 py-[1px] border-r border-b border-black text-center text-[10pt] line-through">PERUBAHAN****</div>
            <div className="px-1 py-[1px] border-r border-b border-black text-center text-[10pt] line-through">DITANGGUHKAN****</div>
            <div className="px-1 py-[1px] border-r border-b border-black text-center text-[10pt] line-through">TIDAK DISETUJUI****</div>

            {/* ROW 2: Kotak Isi (KOSONG - Hapus centang default) */}
            <div className="h-[20px] border-l border-r border-b border-black"></div>
            <div className="h-[20px] border-r border-b border-black"></div>
            <div className="h-[20px] border-r border-b border-black"></div>
            <div className="h-[20px] border-r border-b border-black"></div>
            
            {/* ROW 3: Space & Tanda Tangan */}
            {/* Col 1 */}
            <div className=""></div> 
            {/* Col 2: Tambah border-r */}
            <div className="border-r border-black"></div>
            
            {/* Col 3 & 4 Combined: Tanda Tangan. 
                Dikurangi 5px: min-h-[115px] -> min-h-[110px] */}
            <div className="col-span-2 flex flex-col justify-between min-h-[110px] border-r border-b border-black p-2">
                 {/* Jabatan langsung di atas */}
                 <div className="w-full text-center">
                    <p>{jabatanPejabat}</p>
                 </div>
                 
                 {/* Nama/NIP di bawah */}
                 <div className="flex flex-col items-center text-center w-full">
                     <div className="text-center w-full">
                        <p className="font-bold underline break-words">{namaPejabat}</p>
                        <p className="break-words">NIP. {nipPejabat}</p>
                     </div>
                 </div>
            </div>
        </div>
      </div>

      {/* FOOTER NOTES */}
      <div className="text-[10pt] mt-4">
        <p className="font-bold mb-1">Catatan:</p>
        <div className="grid grid-cols-[35px_10px_1fr] gap-y-1 leading-[1]">
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
