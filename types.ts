
export enum LetterType {
  SURAT_IZIN_KEPSEK = 'Surat Izin Cuti dari Kepala Sekolah',
  BLANGKO_CUTI = 'Blangko Permintaan dan Pemberian Cuti',
  SURAT_IZIN_DINAS_TAHUNAN = 'Surat Izin Cuti Tahunan (Dinas)',
  SURAT_IZIN_DINAS_MELAHIRKAN = 'Surat Izin Cuti Melahirkan (Dinas)',
  SURAT_IZIN_DINAS_PENTING = 'Surat Izin Cuti Alasan Penting (Dinas)',
  SURAT_IZIN_DINAS_SAKIT = 'Surat Izin Cuti Sakit (Dinas)',
}

export const DinasLetterTypes = [
  LetterType.SURAT_IZIN_DINAS_TAHUNAN,
  LetterType.SURAT_IZIN_DINAS_MELAHIRKAN,
  LetterType.SURAT_IZIN_DINAS_PENTING,
  LetterType.SURAT_IZIN_DINAS_SAKIT,
];

export interface LeaveHistoryEntry {
  id: string;
  tglMulai: string;
  tglSelesai: string;
  lamaCuti: number;
  jenisCuti: LetterType;
  alasanCuti: string;
  timestamp: number;
}

export interface FormData {
  // Pegawai
  namaPegawai: string;
  nipPegawai: string;
  jenisKelamin: string;
  emailPegawai: string;
  pangkatGolonganPegawai: string;
  jabatanPegawai: string;
  statusPegawai: string;
  unitKerjaPegawai: string;
  satuanOrganisasi: string;
  tglMulaiKerja: string;
  masaKerjaPegawai: string;
  alamatSelamaCuti: string;
  telpPegawai: string;

  // Sekolah Info
  alamatSekolah: string;
  teleponSekolah: string;
  emailSekolah: string;
  websiteSekolah: string;

  // Atasan Langsung
  namaAtasan: string;
  nipAtasan: string;
  jabatanAtasan: string;
  pangkatGolonganAtasan: string;

  // Pejabat Berwenang
  namaPejabat: string;
  nipPejabat: string;
  jabatanPejabat: string;

  // Detail Cuti
  jenisCuti: LetterType;
  alasanCuti: string;
  lamaCuti: string;
  tglMulai: string;
  tglSelesai: string;
  jatahCutiTahunan: string;
  sisaCutiN: string;
  sisaCutiN_1: string;
  sisaCutiN_2: string;

  // Surat
  nomorSuratDinas: string;
  nomorSuratSekolah: string;
  tglSurat: string;
  tglSuratBali: string;
  tembusan1: string;
  tembusan2: string;
  tembusan3: string;
  
  // Logos
  logoDinas: string;
  logoSekolah: string;
}

export type PaperSize = 'a4' | 'f4' | 'letter' | 'legal';
 
