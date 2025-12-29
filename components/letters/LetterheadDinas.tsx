
import React, { useMemo } from 'react';
import { logoDenpasarBase64 } from '../../assets/logo-denpasar';
import { transliterate } from '../../utils/TransliterationUtil';

interface Props {
  logoDinas?: string;
}

const LetterheadDinas: React.FC<Props> = ({ logoDinas }) => {
  const pemdaText = "PEMERINTAH KOTA DENPASAR";
  const dinasText = "DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA";
  const addressText = "Jalan Mawar No.6 Denpasar Telp. (0361) 247521 Fax. (0361) 236151";
  const contactText = "Laman : www.pendidikan.denpasarkota.go.id, Pos-el : pendidikan@denpasarkota.go.id";

  const transliterated = useMemo(() => ({
    pemda: transliterate(pemdaText),
    dinas: transliterate(dinasText),
    address: transliterate(addressText)
  }), []);

  return (
    <div className="relative mb-6 font-['Times_New_Roman',_serif] pt-2">
      {/* Container Logo dan Teks */}
      <div className="relative flex items-start">
        {/* Logo diletakkan secara absolut di kiri dan diposisikan di tengah tinggi container ini */}
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2">
          <img 
            src={logoDinas || logoDenpasarBase64} 
            alt="Logo Kota Denpasar" 
            className="w-[100px] h-auto object-contain" 
          />
        </div>

        {/* Bagian Teks yang Terpusat */}
        <div className="w-full text-center px-4">
          {/* Baris Pemerintah */}
          <p className="font-aksara-bali text-[11pt] leading-tight mb-0.5">{transliterated.pemda}</p>
          <p className="text-[15pt] font-bold tracking-wider leading-none mb-2">{pemdaText}</p>
          
          {/* Baris Dinas */}
          <p className="font-aksara-bali text-[11pt] leading-tight mb-0.5">{transliterated.dinas}</p>
          <p className="text-[15pt] font-bold tracking-tight leading-none mb-2">{dinasText}</p>
          
          {/* Baris Alamat */}
          <p className="font-aksara-bali text-[9pt] leading-tight mb-0.5">{transliterated.address}</p>
          <p className="text-[9.5pt] leading-tight font-normal">
            {addressText}
          </p>
          
          {/* Baris Kontak */}
          <p className="text-[9.5pt] leading-tight font-normal">
            {contactText}
          </p>
        </div>
      </div>

      {/* Garis Pemisah Kop (Double Line: Tebal di atas, Tipis di bawah) */}
      <div className="mt-4 border-t-[3px] border-black"></div>
      <div className="mt-[2px] border-t-[1px] border-black"></div>
    </div>
  );
};

export default LetterheadDinas;
