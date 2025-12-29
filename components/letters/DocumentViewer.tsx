
import React from 'react';
import type { FormData, PaperSize } from '../../types';
import { LetterType } from '../../types';
import SuratIzinKepsek from './SuratIzinKepsek';
import SuratIzinDinas from './SuratIzinDinas';
import BlangkoCuti from './BlangkoCuti';

interface DocumentViewerProps {
  formData: FormData;
  letterType: LetterType;
  paperSize: PaperSize;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ formData, letterType, paperSize }) => {
  const renderDocument = () => {
    switch (letterType) {
      case LetterType.SURAT_IZIN_KEPSEK:
        return <SuratIzinKepsek formData={formData} />;
      case LetterType.BLANGKO_CUTI:
        return <BlangkoCuti formData={formData} />;
      // Jika mode preview adalah Surat Dinas, gunakan tipe cuti dari formData yang dipilih user
      // untuk menentukan judul dan konten surat yang tepat.
      case LetterType.SURAT_IZIN_DINAS_TAHUNAN:
      case LetterType.SURAT_IZIN_DINAS_MELAHIRKAN:
      case LetterType.SURAT_IZIN_DINAS_PENTING:
      case LetterType.SURAT_IZIN_DINAS_SAKIT:
        return <SuratIzinDinas formData={formData} letterType={formData.jenisCuti} />;
      default:
        return <p>Pilih jenis surat untuk ditampilkan.</p>;
    }
  };

  return (
    <div id="print-area" className={`paper ${paperSize} bg-white shadow-lg px-12 py-10 text-black font-document`}>
      {renderDocument()}
    </div>
  );
};

export default DocumentViewer;
