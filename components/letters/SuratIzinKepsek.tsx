
import React from 'react';
import type { FormData } from '../../types';
import { LetterType } from '../../types';
import LetterheadSekolah from './LetterheadSekolah';
import { formatDateParts } from '../../utils/dateFormatter';

interface Props {
  formData: FormData;
}

const SuratIzinKepsek: React.FC<Props> = ({ formData }) => {
  const {
    namaAtasan, nipAtasan, pangkatGolonganAtasan, jabatanAtasan, unitKerjaPegawai,
    namaPegawai, nipPegawai, pangkatGolonganPegawai, jabatanPegawai, satuanOrganisasi,
    tglSurat, tglSuratBali, nomorSuratSekolah, jenisCuti
  } = formData;

  const dateParts = formatDateParts(tglSurat);
  const fullDateString = tglSuratBali ? `${tglSuratBali} ${dateParts.full}` : dateParts.full;

  const getJenisCutiText = () => {
    switch (jenisCuti) {
      case LetterType.SURAT_IZIN_DINAS_SAKIT:
        return 'cuti sakit';
      case LetterType.SURAT_IZIN_DINAS_MELAHIRKAN:
        return 'cuti melahirkan';
      case LetterType.SURAT_IZIN_DINAS_PENTING:
        return 'cuti alasan penting';
      case LetterType.SURAT_IZIN_DINAS_TAHUNAN:
      default:
        return 'cuti tahunan';
    }
  };

  const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex py-0.5">
      {/* whitespace-nowrap memastikan teks panjang tidak turun baris */}
      <div className="w-56 shrink-0 whitespace-nowrap">{label}</div>
      <div className="px-2">:</div>
      <div className="font-normal">{value || '-'}</div>
    </div>
  );

  return (
    <div className="text-[11pt] leading-normal">
      <LetterheadSekolah formData={formData} />
      
      <div className="text-center font-bold underline text-[14pt] mb-1 mt-6">SURAT IZIN CUTI</div>
      <div className="text-center text-[11pt] mb-10">No. {nomorSuratSekolah || '.../.../.../...'}</div>

      <p className="mb-4">Yang bertanda tangan dibawah ini :</p>
      <div className="mb-6 space-y-0.5 ml-4">
        <DataRow label="Nama" value={namaAtasan} />
        <DataRow label="NIP" value={nipAtasan} />
        <DataRow label="Pangkat / Golongan ruang" value={pangkatGolonganAtasan} />
        <DataRow label="Jabatan" value={jabatanAtasan} />
        <DataRow label="Tempat Tugas" value={unitKerjaPegawai} />
      </div>

      <p className="mb-4">Memberikan izin {getJenisCutiText()} kepada :</p>
      <div className="mb-8 space-y-0.5 ml-4">
        <DataRow label="Nama" value={namaPegawai} />
        <DataRow label="NIP" value={nipPegawai} />
        <DataRow label="Pangkat / Golongan ruang" value={pangkatGolonganPegawai} />
        <DataRow label="Jabatan" value={jabatanPegawai} />
        <DataRow label="Tempat Tugas" value={unitKerjaPegawai} />
        <DataRow label="Satuan Organisasi" value={satuanOrganisasi} />
      </div>
      
      <p className="mb-12 text-justify leading-relaxed">
        Demikian surat izin ini dibuat agar dapat dipergunakan sebagaimana mestinya. Atas perhatiannya kami ucapkan terima kasih.
      </p>

      <div className="flex justify-end">
        <div className="text-left">
          <p>{`Denpasar, ${fullDateString}`}</p>
          <p style={{ maxWidth: '105mm' }}>{jabatanAtasan}</p>
          <div className="h-24" />
          <p className="font-bold underline">{namaAtasan}</p>
          <p>NIP. {nipAtasan}</p>
        </div>
      </div>
    </div>
  );
};

export default SuratIzinKepsek;
