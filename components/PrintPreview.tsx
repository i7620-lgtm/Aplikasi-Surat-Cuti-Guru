
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FormData, PaperSize } from '../types';
import { LetterType } from '../types';
import DocumentViewer from './letters/DocumentViewer';
import { PrinterIcon, ZoomIn } from 'lucide-react';

interface PrintPreviewProps {
  formData: FormData;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ formData }) => {
  const [selectedLetter, setSelectedLetter] = useState<LetterType>(LetterType.SURAT_IZIN_KEPSEK);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [scale, setScale] = useState(1);
  const previewAreaRef = useRef<HTMLDivElement>(null); // Ref for the actual scrolling preview area

  const paperDimensions: Record<PaperSize, { w: number; h: number }> = {
    a4: { w: 210, h: 297 },
    f4: { w: 215, h: 330 },
    letter: { w: 216, h: 279 },
    legal: { w: 216, h: 356 }
  };

  const calculateScale = useCallback(() => {
    if (previewAreaRef.current) {
      const safetyMargin = 32; // Consistent 16px visual gap on all sides
      
      const availableWidth = previewAreaRef.current.clientWidth - safetyMargin;
      const availableHeight = previewAreaRef.current.clientHeight - safetyMargin;
      
      const paperWidthPx = paperDimensions[paperSize].w * 3.78;
      const paperHeightPx = paperDimensions[paperSize].h * 3.78;

      const scaleX = availableWidth / paperWidthPx;
      const scaleY = availableHeight / paperHeightPx;
      
      // Scale is determined by the most restrictive dimension (width or height) and capped at 100%.
      const newScale = Math.min(1, scaleX, scaleY);
      
      setScale(prev => (Math.abs(prev - newScale) > 0.005 ? newScale : prev));
    }
  }, [paperSize]);

  useEffect(() => {
    // A small delay allows the layout to stabilize before the initial calculation.
    const timer = setTimeout(calculateScale, 50);

    const previewArea = previewAreaRef.current;
    if (!previewArea) return () => clearTimeout(timer);

    const observer = new ResizeObserver(calculateScale);
    observer.observe(previewArea);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [calculateScale]);

  return (
    <div className="flex flex-col h-full overflow-hidden print:overflow-visible print:block">
      <div className="p-4 bg-white rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <label htmlFor="letter-type" className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen Cetak</label>
            <select
              id="letter-type"
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value as LetterType)}
              className="w-full mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={LetterType.SURAT_IZIN_KEPSEK}>Surat Pengantar (Kepala Sekolah)</option>
              <option value={LetterType.BLANGKO_CUTI}>Blangko Permintaan Cuti</option>
              <option value={LetterType.SURAT_IZIN_DINAS_TAHUNAN}>Surat Keputusan Cuti (Dinas)</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label htmlFor="paper-size" className="block text-sm font-medium text-gray-700 mb-1">Ukuran Kertas</label>
            <select
              id="paper-size"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              className="w-full mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="a4">A4 (210 x 297 mm)</option>
              <option value="f4">F4 (215 x 330 mm)</option>
              <option value="letter">Letter (216 x 279 mm)</option>
              <option value="legal">Legal (216 x 356 mm)</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="hidden lg:flex items-center text-xs text-gray-400 mr-2">
                <ZoomIn className="w-3 h-3 mr-1" />
                Scale: {Math.round(scale * 100)}%
            </div>
            <button
                onClick={() => window.print()}
                className="flex-grow md:flex-none flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
                <PrinterIcon className="w-5 h-5 mr-2" />
                Cetak
            </button>
        </div>
      </div>

      <div 
        ref={previewAreaRef} 
        className="flex-grow overflow-auto bg-gray-200 p-4 flex justify-center items-start print:bg-transparent print:p-0 print:overflow-visible print:block"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            marginBottom: '32px'
          }}
          className="print:m-0 print:transform-none print:block"
        >
          <DocumentViewer formData={formData} letterType={selectedLetter} paperSize={paperSize} />
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
