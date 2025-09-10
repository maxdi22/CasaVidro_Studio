import React, { useRef, useEffect, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { Modal } from './Modal';
import { ImageFile } from '../../types';

interface MaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: ImageFile | null;
  onSave: (masks: { displayUrl: string; apiBase64: string }) => void;
}

type Point = { x: number; y: number };

export const MaskEditorModal: React.FC<MaskEditorModalProps> = ({ isOpen, onClose, imageFile, onSave }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [brushSize, setBrushSize] = useState(40);

  const setupCanvas = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (image && canvas) {
      const { width, height } = image.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    if (isOpen && imageFile) {
      window.addEventListener('resize', setupCanvas);
      // setupCanvas will be called by image onLoad
    }
    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, [isOpen, imageFile]);
  
  const getPoint = (e: ReactMouseEvent | ReactTouchEvent | MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawLine = (start: Point, end: Point) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const startDrawing = (e: ReactMouseEvent | ReactTouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPoint(e.nativeEvent);
    setLastPoint(point);
    if(point){ // draw a dot on click
      const ctx = canvasRef.current?.getContext('2d');
      if(!ctx) return;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.arc(point.x, point.y, brushSize/2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (e: ReactMouseEvent | ReactTouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const currentPoint = getPoint(e.nativeEvent);
    if (lastPoint && currentPoint) {
      drawLine(lastPoint, currentPoint);
    }
    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if(canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSaveMask = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // 1. Create API Mask (white on black)
    const apiCanvas = document.createElement('canvas');
    apiCanvas.width = image.naturalWidth;
    apiCanvas.height = image.naturalHeight;
    const apiCtx = apiCanvas.getContext('2d');
    
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = image.naturalWidth;
    displayCanvas.height = image.naturalHeight;
    const displayCtx = displayCanvas.getContext('2d');

    if (!apiCtx || !displayCtx) return;

    // Scale drawing from displayed size to natural image size
    const scaleX = image.naturalWidth / canvas.width;
    const scaleY = image.naturalHeight / canvas.height;
    
    displayCtx.scale(scaleX, scaleY);
    displayCtx.drawImage(canvas, 0, 0);
    const displayUrl = displayCanvas.toDataURL('image/png');

    const imageData = displayCtx.getImageData(0, 0, displayCanvas.width, displayCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        data[i] = 255;     // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 255; // A
      }
    }
    
    apiCtx.fillStyle = 'black';
    apiCtx.fillRect(0, 0, apiCanvas.width, apiCanvas.height);
    apiCtx.putImageData(imageData, 0, 0);
    
    const apiDataUrl = apiCanvas.toDataURL('image/png');
    const apiBase64 = apiDataUrl.substring(apiDataUrl.indexOf(',') + 1);

    onSave({ displayUrl, apiBase64 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marcar Área para Substituição" size="4xl">
      <div className="flex flex-col gap-4">
        <p className='text-center text-sm text-[var(--foreground)] opacity-80'>Pinte sobre a área da imagem que você deseja substituir pelo produto.</p>
        <div className="relative w-full mx-auto touch-none select-none flex justify-center items-center bg-black/10 dark:bg-black/20" >
          <img
            ref={imageRef}
            src={imageFile?.dataUrl}
            alt="Scene to edit"
            onLoad={setupCanvas}
            className="max-w-full max-h-[60vh] object-contain block"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 right-0 bottom-0 m-auto cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-lg bg-black/5 dark:bg-black/20">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="brushSize" className="text-sm font-medium whitespace-nowrap">Tamanho do Pincel:</label>
            <div className='flex items-center gap-2 w-full'>
              <div className="w-10 h-10 rounded-full bg-red-500/50 flex items-center justify-center" style={{width: `${brushSize}px`, height: `${brushSize}px`}}></div>
              <input
                id="brushSize"
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[var(--primary)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleClear} className="w-full sm:w-auto px-4 py-2 bg-black/10 dark:bg-white/10 text-sm rounded-md hover:bg-black/20 dark:hover:bg-white/20">Limpar</button>
            <button onClick={handleSaveMask} className="w-full sm:w-auto px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-md hover:opacity-90">Salvar Máscara</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};