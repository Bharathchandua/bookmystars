import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, Sparkles } from "lucide-react";

/**
 * CropPhotoModal
 * Allows talent users to position, zoom, and crop their profile photo
 * to the exact 4:5 portrait aspect ratio used by the profile card.
 */
export default function CropPhotoModal({ isOpen, imageSrc, onClose, onCropComplete, aspectRatio = 4 / 5 }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Crop frame dimensions in viewport
  const FRAME_WIDTH = 280;
  const FRAME_HEIGHT = Math.round(FRAME_WIDTH / aspectRatio); // 350px for 4:5

  // Reset state when new image opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImgLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Drag handlers
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.min(3, Math.max(0.8, Number((prev + delta).toFixed(2)))));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Export cropped canvas
  const handleApplyCrop = () => {
    if (!imageRef.current) return;

    // High resolution target canvas (640 x 800 px)
    const targetWidth = 640;
    const targetHeight = Math.round(targetWidth / aspectRatio); // 800

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Fill background with clean neutral white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Scale factor from preview frame to export canvas
    const scaleFactor = targetWidth / FRAME_WIDTH;

    ctx.save();
    // Translate to center of canvas
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // Apply user panning
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

    // Apply user rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply user zoom
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    // Draw image centered
    const img = imageRef.current;
    
    // Calculate base cover fit for preview frame
    const isRotatedSideways = rotation % 180 !== 0;
    const naturalW = isRotatedSideways ? img.naturalHeight : img.naturalWidth;
    const naturalH = isRotatedSideways ? img.naturalWidth : img.naturalHeight;

    const coverScale = Math.max(FRAME_WIDTH / naturalW, FRAME_HEIGHT / naturalH);
    const drawW = img.naturalWidth * coverScale;
    const drawH = img.naturalHeight * coverScale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Export as high quality JPEG data URL
    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.78)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "460px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} style={{ color: "#e91e8c" }} />
              Crop Profile Photo
            </h3>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
              Default Card Aspect Ratio (4:5 Portrait)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Cropper Area */}
        <div
          style={{
            padding: "20px",
            background: "#090d16",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none"
          }}
        >
          {/* Cropper Viewport Frame */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            style={{
              width: `${FRAME_WIDTH}px`,
              height: `${FRAME_HEIGHT}px`,
              borderRadius: "14px",
              position: "relative",
              overflow: "hidden",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 20px rgba(233, 30, 140, 0.35)",
              border: "2px solid #e91e8c",
              background: "#1e293b",
              touchAction: "none"
            }}
          >
            {imgLoaded && imageRef.current && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.08s ease-out"
                }}
              >
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  style={{
                    maxWidth: "none",
                    maxHeight: "none",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none"
                  }}
                />
              </div>
            )}

            {/* Rule of thirds grid overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gridTemplateRows: "1fr 1fr 1fr",
                opacity: 0.28
              }}
            >
              <div style={{ borderRight: "1px dashed #fff", borderBottom: "1px dashed #fff" }} />
              <div style={{ borderRight: "1px dashed #fff", borderBottom: "1px dashed #fff" }} />
              <div style={{ borderBottom: "1px dashed #fff" }} />
              <div style={{ borderRight: "1px dashed #fff", borderBottom: "1px dashed #fff" }} />
              <div style={{ borderRight: "1px dashed #fff", borderBottom: "1px dashed #fff" }} />
              <div style={{ borderBottom: "1px dashed #fff" }} />
              <div style={{ borderRight: "1px dashed #fff" }} />
              <div style={{ borderRight: "1px dashed #fff" }} />
              <div />
            </div>
          </div>

          <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            Drag photo to reposition · Scroll or slider to zoom
          </span>
        </div>

        {/* Controls Toolbar */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px", background: "#ffffff" }}>
          
          {/* Zoom Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.8, Number((prev - 0.1).toFixed(2))))}
              title="Zoom out"
              style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", display: "flex", color: "#475569" }}
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "#e91e8c", cursor: "pointer" }}
            />
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, Number((prev + 0.1).toFixed(2))))}
              title="Zoom in"
              style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", display: "flex", color: "#475569" }}
            >
              <ZoomIn size={16} />
            </button>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#475569", minWidth: "36px", textAlign: "right" }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Secondary tool buttons (Rotate, Reset) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleRotate}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#334155",
                  cursor: "pointer"
                }}
              >
                <RotateCw size={14} /> Rotate 90°
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#334155",
                  cursor: "pointer"
                }}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
              220 × 275 Ratio
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              style={{
                padding: "8px 20px",
                border: "none",
                background: "#e91e8c",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(233, 30, 140, 0.3)"
              }}
            >
              <Check size={16} /> Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
