import React from 'react';
import type { FormData } from '../../types';
import { LetterType } from '../../types';
import LetterheadDinas from './LetterheadDinas';
import { formatIndonesianDate, formatDateParts } from '../../utils/dateFormatter';

interface Props {
  formData: FormData;
  letterType: LetterType;
}

const SuratIzinDinas: React.FC<Props> = ({ formData, letterType }) => {
    const {
        namaPegawai, nipPegawai, pangkatGolonganPegawai, jabatanPegawai, unitKerjaPegawai, statusPegawai, satuanOrganisasi,
        lamaCuti, tglMulai, tglSelesai,
        namaPejabat, nipPejabat, jabatanPejabat,
        tglSurat, tglSuratBali, nomorSuratDinas, tembusan1, tembusan2, tembusan3,
        logoDinas
    } = formData;

    const dateParts = formatDateParts(tglSurat);
    const fullDateString = tglSuratBali ? `${tglSuratBali} ${dateParts.full}` : dateParts.full;
    
    const getLetterTitle = () => {
        switch(letterType) {
            case LetterType.SURAT_IZIN_DINAS_TAHUNAN: return 'SURAT IZIN CUTI TAHUNAN';
            case LetterType.SURAT_IZIN_DINAS_MELAHIRKAN: return 'SURAT IZIN CUTI MELAHIRKAN';
            case LetterType.SURAT_IZIN_DINAS_PENTING: return 'SURAT IZIN CUTI ALASAN PENTING';
            case LetterType.SURAT_IZIN_DINAS_SAKIT: return 'SURAT IZIN CUTI SAKIT';
            default: return '';
        }
    };
    
    const getNomor = () => {
        const year = tglSurat ? new Date(tglSurat).getFullYear() : new Date().getFullYear();
        const number = nomorSuratDinas || '...';
        if (letterType === LetterType.SURAT_IZIN_DINAS_TAHUNAN) {
            return `NOMOR : 800.1.11.4/ ${number} / Disdikpora`;
        }
        return `NOMOR : ${number} / Dikpora / ${year}`;
    }
    
    const getGivenToText = () => {
        let leaveType = '';
         switch(letterType) {
            case LetterType.SURAT_IZIN_DINAS_TAHUNAN: leaveType = 'Cuti Tahunan'; break;
            case LetterType.SURAT_IZIN_DINAS_MELAHIRKAN: leaveType = 'cuti melahirkan'; break;
            case LetterType.SURAT_IZIN_DINAS_PENTING: leaveType = 'Cuti Alasan Penting'; break;
            case LetterType.SURAT_IZIN_DINAS_SAKIT: leaveType = 'cuti sakit'; break;
        }

        return `Diberikan ${leaveType} kepada ${statusPegawai || '...'}:`;
    }

    const DataRow: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
        <tr>
          <td className="w-52 align-top">{label}</td>
          <td className="px-2 align-top">:</td>
          <td className="align-top">{value || '-'}</td>
        </tr>
      );

  return (
    <div className="text-[11pt] leading-normal">
      <LetterheadDinas logoDinas={logoDinas} />

      <div className="text-center mt-4">
        <p className="font-bold underline text-[14pt] mb-1 tracking-wider">{getLetterTitle()}</p>
        <p className="text-[11pt] mb-6">{getNomor()}</p>
      </div>
      
      <p className="mb-4">{getGivenToText()}</p>

      <table className="w-full mb-6 text-[11pt]">
        <tbody>
          <DataRow label="Nama" value={namaPegawai} />
          <DataRow label="NIP" value={nipPegawai} />
          <DataRow label="Pangkat / Golongan" value={pangkatGolonganPegawai} />
          <DataRow label="Jabatan" value={jabatanPegawai} />
          <DataRow label="Tempat Tugas" value={unitKerjaPegawai} />
          <DataRow label="Satuan Organisasi" value={satuanOrganisasi} />
        </tbody>
      </table>

      <p className="mb-4 text-justify leading-relaxed">
        Terhitung mulai tanggal <strong>{formatIndonesianDate(tglMulai)}</strong> sampai dengan <strong>{formatIndonesianDate(tglSelesai)}</strong> selama <strong>{lamaCuti}</strong> dengan ketentuan sebagai berikut:
      </p>

      <ol className="list-outside pl-10 mb-6 space-y-1 text-justify leading-relaxed" style={{ listStyleType: 'lower-alpha' }}>
        <li>Sebelum menjalankan cuti, wajib menyerahkan pekerjaannya kepada atasan langsungnya atau pejabat lain yang ditunjuk.</li>
        <li>Setelah melaksanakan cuti, wajib melaporkan diri kepada atasan langsungnya dan bekerja kembali sebagaimana biasa.</li>
      </ol>

      <p className="mb-10 text-justify leading-relaxed">
        Demikian surat izin cuti ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
      </p>

      <div className="flex justify-end">
        <div className="text-left">
          <p>{`Denpasar, ${fullDateString}`}</p>
          <p style={{ maxWidth: '105mm' }}>{jabatanPejabat}</p>
          <div className="h-24" />
          <p className="font-bold underline">{namaPejabat}</p>
          <p>NIP. {nipPejabat}</p>
        </div>
      </div>
      
      <div className="mt-8 text-[11pt]">
          <p className="font-bold underline">Tembusan:</p>
          <ol className="list-decimal list-outside pl-5">
              {tembusan1 && <li>{tembusan1}</li>}
              {tembusan2 && <li>{tembusan2}</li>}
              {tembusan3 && <li>{tembusan3}</li>}
          </ol>
      </div>
    </div>
  );
};

export default SuratIzinDinas;
