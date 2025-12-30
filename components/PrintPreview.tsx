
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FormData, PaperSize } from '../types';
import { LetterType } from '../types';
import DocumentViewer from './letters/DocumentViewer';
import { PrinterIcon, ZoomIn, ZoomOut, Maximize, Settings2, Info, Plus, Minus } from 'lucide-react';

interface PrintPreviewProps {
  formData: FormData;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ formData }) => {
  const [selectedLetter, setSelectedLetter] = useState<LetterType>(LetterType.SURAT_IZIN_KEPSEK);
  const [paperSize, setPaperSize] = useState<PaperSize>('f4'); 
  const [scale, setScale] = useState(1);
  const [isAutoZoom, setIsAutoZoom] = useState(true);
  const previewAreaRef = useRef<HTMLDivElement>(null);

  const paperDimensions: Record<PaperSize, { w: number; h: number }> = {
    a4: { w: 210, h: 297 },
    f4: { w: 215, h: 330 },
    letter: { w: 216, h: 279 },
    legal: { w: 216, h: 356 }
  };

  const calculateScale = useCallback(() => {
    if (previewAreaRef.current && isAutoZoom) {
      const safetyMargin = 64; 
      
      const availableWidth = previewAreaRef.current.clientWidth - safetyMargin;
      const availableHeight = previewAreaRef.current.clientHeight - safetyMargin;
      
      const paperWidthPx = paperDimensions[paperSize].w * 3.78;
      const paperHeightPx = paperDimensions[paperSize].h * 3.78;

      const scaleX = availableWidth / paperWidthPx;
      const scaleY = availableHeight / paperHeightPx;
      
      const newScale = Math.min(1, scaleX, scaleY);
      
      setScale(prev => (Math.abs(prev - newScale) > 0.005 ? newScale : prev));
    }
  }, [paperSize, isAutoZoom]);

  useEffect(() => {
    const timer = setTimeout(calculateScale, 100);

    const previewArea = previewAreaRef.current;
    if (!previewArea) return () => clearTimeout(timer);

    const observer = new ResizeObserver(() => {
      if (isAutoZoom) calculateScale();
    });
    observer.observe(previewArea);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [calculateScale, isAutoZoom]);

  const handleManualZoom = (newScale: number) => {
    setIsAutoZoom(false);
    setScale(Math.max(0.2, Math.min(2, newScale)));
  };

  const toggleAutoZoom = () => {
    setIsAutoZoom(true);
    // Trigger recalculation immediately
    setTimeout(calculateScale, 10);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Control Panel */}
      <div className="p-4 bg-white rounded-xl shadow-sm mb-6 flex flex-col xl:flex-row items-center justify-between gap-4 print:hidden border border-slate-200">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="w-full md:w-auto">
            <label htmlFor="letter-type" className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Jenis Dokumen</label>
            <div className="relative">
              <select
                id="letter-type"
                value={selectedLetter}
                onChange={(e) => setSelectedLetter(e.target.value as LetterType)}
                className="w-full mt-1 block pl-3 pr-10 py-2.5 text-sm font-medium border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-slate-50"
              >
                <option value={LetterType.SURAT_IZIN_KEPSEK}>Surat Pengantar (Kepala Sekolah)</option>
                <option value={LetterType.BLANGKO_CUTI}>Blangko Permintaan Cuti (BKN)</option>
                <option value={LetterType.SURAT_IZIN_DINAS_TAHUNAN}>Surat Keputusan Cuti (Dinas)</option>
              </select>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label htmlFor="paper-size" className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Ukuran Kertas</label>
            <select
              id="paper-size"
              value={paperSize}
              onChange={(e) => {
                setPaperSize(e.target.value as PaperSize);
                if (isAutoZoom) setTimeout(calculateScale, 50);
              }}
              className="w-full mt-1 block pl-3 pr-10 py-2.5 text-sm font-medium border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-slate-50"
            >
              <option value="f4">F4 / Folio (8.5 x 13 in)</option>
              <option value="a4">A4 (210 x 297 mm)</option>
              <option value="legal">Legal (8.5 x 14 in)</option>
            </select>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100 w-full xl:w-auto">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleManualZoom(scale - 0.1)}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input 
              type="range" 
              min="0.2" 
              max="2" 
              step="0.05" 
              value={scale} 
              onChange={(e) => handleManualZoom(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <button 
              onClick={() => handleManualZoom(scale + 0.1)}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          <button 
            onClick={toggleAutoZoom}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isAutoZoom 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            <Maximize className="w-3.5 h-3.5 mr-1.5" />
            Fit to Screen
          </button>
          
          <span className="text-xs font-mono font-bold text-slate-500 min-w-[45px] text-right">
            {Math.round(scale * 100)}%
          </span>
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
            <button
                onClick={() => window.print()}
                className="flex-grow xl:flex-none flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg shadow-blue-200 text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
            >
                <PrinterIcon className="w-5 h-5 mr-2" />
                Cetak Surat
            </button>
        </div>
      </div>

      {/* Hint Alert for Print Dialog */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 print:hidden">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800 leading-relaxed">
              <strong>Tips Cetak:</strong> Gunakan <kbd className="px-1 py-0.5 bg-white border border-blue-200 rounded text-[10px]">Ctrl + P</kbd>. Pastikan 
              <span className="font-bold"> Margins: None</span> dan 
              <span className="font-bold"> Scale: 100%</span> pada dialog cetak browser agar ukuran fisik sesuai standar.
          </div>
      </div>

      {/* Preview Area */}
      <div 
        ref={previewAreaRef} 
        className="flex-grow overflow-auto bg-slate-200/50 rounded-2xl border-2 border-dashed border-slate-300 p-8 flex justify-center items-start print:bg-transparent print:p-0 print:overflow-visible print:block print:border-none"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
          className="preview-scale-container print:block transition-transform duration-200 ease-out"
        >
          <DocumentViewer formData={formData} letterType={selectedLetter} paperSize={paperSize} />
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
