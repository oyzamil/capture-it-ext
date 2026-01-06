import { Button, Modal, Space } from 'antd';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

export type Rect = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export interface CropModalProps {
  open: boolean;
  imageBase64: string;
  onCancel: () => void;
  onSave: (croppedBase64: string, crop: Rect) => void;
  modalTitle?: string;
}

export interface CropModalRef {
  getSelection: () => Rect | null;
  resetSelection: () => void;
}

const createCroppedImage = async (base64: string, cropArea: Rect, displaySize: { width: number; height: number }, naturalSize: { width: number; height: number }): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(base64);
        return;
      }

      // Convert display coordinates to natural image coordinates
      const scaleX = naturalSize.width / displaySize.width;
      const scaleY = naturalSize.height / displaySize.height;

      const naturalCrop = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY,
      };

      canvas.width = naturalCrop.width;
      canvas.height = naturalCrop.height;

      ctx.drawImage(img, naturalCrop.x, naturalCrop.y, naturalCrop.width, naturalCrop.height, 0, 0, naturalCrop.width, naturalCrop.height);

      resolve(canvas.toDataURL('image/png'));
    };
  });
};

const ImageCropModal = React.forwardRef<CropModalRef, CropModalProps>(({ open, imageBase64, onCancel, onSave, modalTitle = i18n.t('cropImage') }, ref) => {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const [cropRect, setCropRect] = useState<Rect>({ x: 50, y: 50, width: 200, height: 200 });

  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const resizeDirectionRef = useRef<string>('');
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const initialCropRef = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const resetSelection = () => {
    if (displaySize) {
      // const initialSize = Math.min(displaySize.width, displaySize.height) * 0.6;
      // setCropRect({
      //   x: (displaySize.width - initialSize) / 2,
      //   y: (displaySize.height - initialSize) / 2,
      //   width: initialSize,
      //   height: initialSize,
      // });

      setCropRect({
        x: 0,
        y: 0,
        width: displaySize.width,
        height: displaySize.height,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    getSelection: () => cropRect,
    resetSelection,
  }));

  useEffect(() => {
    if (!imageBase64 || !open || !containerRef.current) return;

    const img = new Image();
    img.src = imageBase64;
    img.onload = () => {
      setNaturalSize({ width: img.width, height: img.height });

      const containerWidth = containerRef.current!.clientWidth;
      const containerHeight = 500;

      // Calculate display size maintaining aspect ratio
      const imgAspect = img.width / img.height;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth, displayHeight;

      if (imgAspect > containerAspect) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / imgAspect;
      } else {
        displayHeight = containerHeight;
        displayWidth = containerHeight * imgAspect;
      }

      setDisplaySize({ width: displayWidth, height: displayHeight });

      // const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
      // setCropRect({
      //   x: (displayWidth - initialSize) / 2,
      //   y: (displayHeight - initialSize) / 2,
      //   width: initialSize,
      //   height: initialSize,
      // });

      setCropRect({
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight,
      });
    };
  }, [open, imageBase64]);

  const getRelativePosition = (clientX: number, clientY: number) => {
    if (!imageRef.current) return { x: 0, y: 0 };

    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;

    const pos = getRelativePosition(e.clientX, e.clientY);
    dragOffsetRef.current = {
      x: pos.x - cropRect.x,
      y: pos.y - cropRect.y,
    };
  };

  const startResize = (direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeDirectionRef.current = direction;

    const pos = getRelativePosition(e.clientX, e.clientY);
    dragOffsetRef.current = { x: pos.x, y: pos.y };
    initialCropRef.current = { ...cropRect };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!displaySize) return;

      const pos = getRelativePosition(e.clientX, e.clientY);

      // ----- DRAGGING LOGIC (container clamped) -----
      if (isDraggingRef.current) {
        let newX = pos.x - dragOffsetRef.current.x;
        let newY = pos.y - dragOffsetRef.current.y;

        newX = Math.max(0, Math.min(newX, displaySize.width - cropRect.width));
        newY = Math.max(0, Math.min(newY, displaySize.height - cropRect.height));

        setCropRect((prev) => ({ ...prev, x: newX, y: newY }));
        return;
      }

      // ----- RESIZING LOGIC -----
      if (isResizingRef.current) {
        const initial = initialCropRef.current;
        const handle = resizeDirectionRef.current;

        setCropRect(() => {
          let x = initial.x;
          let y = initial.y;
          let width = initial.width;
          let height = initial.height;

          const minSize = 20;

          // boundaries
          const maxRight = displaySize.width;
          const maxBottom = displaySize.height;

          // Compute target edges first
          const targetLeft = pos.x;
          const targetTop = pos.y;
          const targetRight = pos.x;
          const targetBottom = pos.y;

          // ----- NORTH WEST / NORTH EAST / SOUTH WEST / SOUTH EAST -----
          if (handle === 'nw') {
            const clampedLeft = Math.max(0, Math.min(targetLeft, initial.x + initial.width - minSize));
            const clampedTop = Math.max(0, Math.min(targetTop, initial.y + initial.height - minSize));

            width = initial.x + initial.width - clampedLeft;
            height = initial.y + initial.height - clampedTop;

            x = clampedLeft;
            y = clampedTop;
          }

          if (handle === 'ne') {
            const clampedRight = Math.max(initial.x + minSize, Math.min(targetRight, maxRight));
            const clampedTop = Math.max(0, Math.min(targetTop, initial.y + initial.height - minSize));

            width = clampedRight - initial.x;
            height = initial.y + initial.height - clampedTop;

            y = clampedTop;
          }

          if (handle === 'sw') {
            const clampedLeft = Math.max(0, Math.min(targetLeft, initial.x + initial.width - minSize));
            const clampedBottom = Math.max(initial.y + minSize, Math.min(targetBottom, maxBottom));

            width = initial.x + initial.width - clampedLeft;
            height = clampedBottom - initial.y;

            x = clampedLeft;
          }

          if (handle === 'se') {
            const clampedRight = Math.max(initial.x + minSize, Math.min(targetRight, maxRight));
            const clampedBottom = Math.max(initial.y + minSize, Math.min(targetBottom, maxBottom));

            width = clampedRight - initial.x;
            height = clampedBottom - initial.y;
          }

          // ----- CARDINAL DIRECTIONS -----

          if (handle === 'w') {
            const clampedLeft = Math.max(0, Math.min(targetLeft, initial.x + initial.width - minSize));

            width = initial.x + initial.width - clampedLeft;
            x = clampedLeft;
          }

          if (handle === 'e') {
            const clampedRight = Math.max(initial.x + minSize, Math.min(targetRight, maxRight));

            width = clampedRight - initial.x;
          }

          if (handle === 'n') {
            const clampedTop = Math.max(0, Math.min(targetTop, initial.y + initial.height - minSize));

            height = initial.y + initial.height - clampedTop;
            y = clampedTop;
          }

          if (handle === 's') {
            const clampedBottom = Math.max(initial.y + minSize, Math.min(targetBottom, maxBottom));

            height = clampedBottom - initial.y;
          }

          // Final sanity clamp
          width = Math.max(minSize, Math.min(width, displaySize.width - x));
          height = Math.max(minSize, Math.min(height, displaySize.height - y));

          return { x, y, width, height };
        });

        return;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
      resizeDirectionRef.current = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [displaySize, cropRect]);

  const handleSave = async () => {
    if (!naturalSize || !displaySize) return;

    const cropped = await createCroppedImage(imageBase64, cropRect, displaySize, naturalSize);

    // Return crop in natural image coordinates
    const scaleX = naturalSize.width / displaySize.width;
    const scaleY = naturalSize.height / displaySize.height;

    onSave(cropped, {
      x: Math.round(cropRect.x * scaleX),
      y: Math.round(cropRect.y * scaleY),
      width: Math.round(cropRect.width * scaleX),
      height: Math.round(cropRect.height * scaleY),
    });
  };

  return (
    <Modal open={open} title={modalTitle} onCancel={onCancel} footer={null} width={800} maskClosable={false}>
      <div ref={containerRef} className="relative flex items-center justify-center" style={{ height: 500 }}>
        {imageBase64 && displaySize && (
          <div
            className="relative"
            style={{
              width: displaySize.width,
              height: displaySize.height,
              userSelect: 'none',
            }}
          >
            <img
              ref={imageRef}
              src={imageBase64}
              alt="Crop preview"
              className="block"
              style={{
                width: displaySize.width,
                height: displaySize.height,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
            />

            {/* Dark overlay with cutout for crop area */}
            <svg className="absolute inset-0" style={{ pointerEvents: 'none' }} width={displaySize.width} height={displaySize.height}>
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x={cropRect.x} y={cropRect.y} width={cropRect.width} height={cropRect.height} fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#crop-mask)" />
            </svg>

            {/* Crop area */}
            <div
              className="absolute border-2 border-app-500 cursor-move border-dashed"
              style={{
                left: cropRect.x,
                top: cropRect.y,
                width: cropRect.width,
                height: cropRect.height,
              }}
              onMouseDown={startDrag}
            >
              {/* Grid lines */}
              {/* <div className="absolute inset-0 grid grid-cols-3 grid-rows-3" style={{ pointerEvents: 'none' }}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-app-500/10" />
                ))}
              </div> */}

              {/* Resize handles */}
              {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((pos) => (
                <div
                  key={pos}
                  className={cn('resize-handle', `cursor-${pos}-resize`)}
                  style={{
                    ...(pos === 'nw' && { left: -6, top: -6 }),
                    ...(pos === 'ne' && { right: -6, top: -6 }),
                    ...(pos === 'sw' && { left: -6, bottom: -6 }),
                    ...(pos === 'se' && { right: -6, bottom: -6 }),
                    ...(pos === 'n' && { left: '50%', top: -6, transform: 'translateX(-50%)' }),
                    ...(pos === 's' && { left: '50%', bottom: -6, transform: 'translateX(-50%)' }),
                    ...(pos === 'e' && { right: -6, top: '50%', transform: 'translateY(-50%)' }),
                    ...(pos === 'w' && { left: -6, top: '50%', transform: 'translateY(-50%)' }),
                    cursor: `${pos}-resize`,
                  }}
                  onMouseDown={(e) => startResize(pos, e)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-right">
        <Space>
          <Button onClick={resetSelection}>Reset Selection</Button>
          <Button onClick={handleSave} type="primary">
            Crop & Save
          </Button>
        </Space>
      </div>

      {/* {naturalSize && displaySize && (
        <div className="mt-3 text-sm text-gray-500">
          Original Image Size: {naturalSize.width} × {naturalSize.height}
          <span className="ml-4">
            Crop: {Math.round(cropRect.width * (naturalSize.width / displaySize.width))} × {Math.round(cropRect.height * (naturalSize.height / displaySize.height))}
          </span>
        </div>
      )} */}
    </Modal>
  );
});

export default ImageCropModal;
