import React, { useMemo } from 'react';
import { transliterate, expandAndCapitalizeSchoolName } from '../../utils/TransliterationUtil';
import { logoDenpasarBase64 } from '../../assets/logo-denpasar';
import { logoSekolahBase64 } from '../../assets/logo-sekolah';
import type { FormData } from '../../types';

interface Props {
  formData: FormData;
}

const LetterheadSekolah: React.FC<Props> = ({ formData }) => {
  const { unitKerjaPegawai, logoDinas, logoSekolah, alamatSekolah, teleponSekolah, emailSekolah, websiteSekolah } = formData;
  
  const pemdaText = "PEMERINTAH KOTA DENPASAR";
  const dinasText = "DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA KOTA DENPASAR";
  const sekolahText = useMemo(() => expandAndCapitalizeSchoolName(unitKerjaPegawai || "SEKOLAH DASAR NEGERI 2 PADANGSAMBIAN"), [unitKerjaPegawai]);
  
  const addressLine = `Alamat: ${alamatSekolah || '[Alamat Sekolah]'} Telp. ${teleponSekolah || '[Telepon Sekolah]'}`;
  const contactLine = `${websiteSekolah ? 'Website: ' + websiteSekolah + ' ' : ''}e-mail: ${emailSekolah || '[Email Sekolah]'}`;

  const transliterated = useMemo(() => ({
    pemda: transliterate(pemdaText),
    dinas: transliterate(dinasText),
    sekolah: transliterate(sekolahText),
    address: transliterate(addressLine)
  }), [sekolahText, addressLine]);

  return (
    <div className="mb-4 font-['Times_New_Roman',_serif] text-center">
      <div className="flex justify-between items-center gap-4">
        <img src={logoDinas || logoDenpasarBase64} alt="Logo Dinas" className="w-[90px] h-auto object-contain shrink-0" />
        
        <div className="flex-grow">
          <p className="font-aksara-bali text-[9.5pt] leading-tight mb-0.5">{transliterated.pemda}</p>
          <p className="font-bold text-[10.5pt] leading-tight mb-1">{pemdaText}</p>
          
          <p className="font-aksara-bali text-[9.5pt] leading-tight mb-0.5">{transliterated.dinas}</p>
          <p className="font-bold text-[10.5pt] leading-tight mb-1">{dinasText}</p>
          
          <p className="font-aksara-bali text-[12pt] leading-tight mb-0.5">{transliterated.sekolah}</p>
          <p className="font-bold text-[14pt] leading-tight mb-1">{sekolahText}</p>
          
          <p className="font-aksara-bali text-[8.5pt] leading-tight mb-0.5">{transliterated.address}</p>
          <p className="text-[9pt] leading-tight font-medium">{addressLine}</p>
          <p className="text-[8pt] leading-tight text-gray-700 italic">{contactLine}</p>
        </div>

        <img 
          src={logoSekolah || logoSekolahBase64} 
          alt="Logo Sekolah" 
          className="w-[90px] h-auto object-contain shrink-0" 
        />
      </div>
      <div className="mt-2 border-t-4 border-black" />
      <div className="mt-0.5 border-t border-black" />
    </div>
  );
};

export default LetterheadSekolah;
