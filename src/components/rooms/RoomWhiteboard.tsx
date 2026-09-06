import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  RotateCcw,
  Download,
  Trash2,
  Grid,
} from 'lucide-react';

interface RoomWhiteboardProps {
  roomId?: string;
  isHost?: boolean;
}

type Tool = 'pen' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'circle';
type GridType = 'blank' | 'grid' | 'dots';

export const RoomWhiteboard: React.FC<RoomWhiteboardProps> = ({ roomId, isHost }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#4f46e5');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [gridType, setGridType] = useState<GridType>('grid');

  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  const colors = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Dark Slate', value: '#1e293b' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Sky', value: '#0284c7' },
    { name: 'Purple', value: '#9333ea' },
  ];

  // Initialize and resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const tempCtx = canvas.getContext('2d');
    let prevData: ImageData | null = null;
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      try {
        prevData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {}
    }

    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (prevData) {
        ctx.putImageData(prevData, 0, 0);
      }
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-15), data]);
    } catch {}
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newHistory.length > 0) {
      ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveStateToHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `studyspace-whiteboard-${roomId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    saveStateToHistory();

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 6;
    } else if (currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor + '55'; // 33% opacity
      ctx.lineWidth = strokeWidth * 5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
    }

    try {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } catch {}
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();

      if (currentTool === 'line') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
      } else if (currentTool === 'rect') {
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.closePath();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="p-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Tools Selection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setCurrentTool('pen')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              currentTool === 'pen' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Pen Tool"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            onClick={() => setCurrentTool('highlighter')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              currentTool === 'highlighter' ? 'bg-white text-amber-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              currentTool === 'eraser' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          <button
            onClick={() => setCurrentTool('line')}
            className={`p-1.5 rounded-lg transition ${
              currentTool === 'line' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Straight Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('rect')}
            className={`p-1.5 rounded-lg transition ${
              currentTool === 'rect' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Rectangle"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('circle')}
            className={`p-1.5 rounded-lg transition ${
              currentTool === 'circle' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Circle"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCurrentColor(c.value);
                if (currentTool === 'eraser') setCurrentTool('pen');
              }}
              className={`w-5 h-5 rounded-full transition transform ${
                currentColor === c.value && currentTool !== 'eraser'
                  ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>

        {/* Stroke Size */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              onClick={() => setStrokeWidth(size)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                strokeWidth === size ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {size === 2 ? 'Fine' : size === 4 ? 'Med' : 'Thick'}
            </button>
          ))}
        </div>

        {/* Utilities: Grid, Undo, Clear, Save */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setGridType((g) => (g === 'grid' ? 'dots' : g === 'dots' ? 'blank' : 'grid'));
            }}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Toggle Grid / Dots / Blank"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
            title="Clear Whiteboard"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
            title="Export PNG Snapshot"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area with Math / Dot Grid Background */}
      <div
        ref={containerRef}
        className={`flex-1 relative cursor-crosshair ${
          gridType === 'grid'
            ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] bg-white'
            : gridType === 'dots'
            ? 'bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:20px_20px] bg-white'
            : 'bg-white'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full touch-none"
        />
      </div>
    </div>
  );
};
