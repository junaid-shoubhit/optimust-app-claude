import React, { useRef, useState, useEffect, useCallback } from "react";
import { MdClose } from "react-icons/md";
// SignaturePad

const SignaturePad = React.forwardRef(({ label }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const hasStroke = useRef(false);

  React.useImperativeHandle(ref, () => ({
    getDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas || !hasStroke.current) return null;
      return canvas.toDataURL("image/png");
    },
    isEmpty: () => !hasStroke.current,
    clear: clearCanvas,
  }));

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
  }, []);

  const getPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pt = getPoint(e, canvasRef.current);
    lastPoint.current = pt;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    hasStroke.current = true;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pt = getPoint(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPoint.current = pt;
    hasStroke.current = true;
  };

  const endDraw = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-0.5 rounded-lg hover:bg-red-50"
        >
          <MdClose size={12} />
          Clear
        </button>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-white"
        style={{ touchAction: "none" }}
      >
        <div className="absolute bottom-[28%] left-4 right-4 border-b border-gray-200 pointer-events-none" />
        <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 pointer-events-none select-none">
          Sign here
        </span>
        <canvas
          ref={canvasRef}
          width={480}
          height={115}
          className="w-full h-[115px] cursor-crosshair relative z-10"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </div>
  );
});

export default SignaturePad;
