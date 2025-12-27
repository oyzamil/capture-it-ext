import { useCallback } from 'react';
import { ensureFontsReady } from '../utils';
import ActionButtons from './ActionButtons';

type Point = {
  x: number;
  y: number;
};

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

export default function CaptureCustom() {
  const { settings, saveSettings } = useSettings();
  const [options, setOptions] = useStateUpdater({
    overlay: true,
    isSelecting: false,
    downloading: false,
    copying: false,
    eraser: false,
  });

  const [selection, setSelection] = useState<Rect | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [moveStart, setMoveStart] = useState<Point | null>(null);
  const [resizeStart, setResizeStart] = useState<{ box: Rect; mouse: Point } | null>(null);

  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  const { position, isDragging, dragStart, dragEnd } = useCursor();
  useEffect(() => {
    startSelection();
  }, []);
  // Create initial selection
  useEffect(() => {
    if (options.isSelecting && dragStart && isDragging) {
      const x = Math.min(dragStart.x, position.x);
      const y = Math.min(dragStart.y, position.y);
      const width = Math.abs(position.x - dragStart.x);
      const height = Math.abs(position.y - dragStart.y);

      setSelection((prev) => {
        if (!prev || prev.x !== x || prev.y !== y || prev.width !== width || prev.height !== height) {
          return { x, y, width, height };
        }
        return prev; // no change
      });
    }
  }, [options.isSelecting, dragStart, position, isDragging]);

  // Finalize selection
  useEffect(() => {
    if (options.isSelecting && dragEnd && dragStart) {
      const x = Math.min(dragStart.x, dragEnd.x);
      const y = Math.min(dragStart.y, dragEnd.y);
      const width = Math.abs(dragEnd.x - dragStart.x);
      const height = Math.abs(dragEnd.y - dragStart.y);

      if (width > 10 && height > 10) {
        setSelection({ x, y, width, height });
        setOptions({ isSelecting: false });
      }
    }
  }, [dragEnd, dragStart, options.isSelecting]);

  // Handle moving
  useEffect(() => {
    if (isMoving && moveStart) {
      const dx = position.x - moveStart.x;
      const dy = position.y - moveStart.y;

      if (dx !== 0 || dy !== 0) {
        setSelection((prev) => (prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : prev));
        setMoveStart(position);
      }
    }
  }, [position, isMoving, moveStart]);

  // Handle resizing
  useEffect(() => {
    if (isResizing && resizeStart && resizeHandle) {
      const dx = position.x - resizeStart.mouse.x;
      const dy = position.y - resizeStart.mouse.y;

      if (dx === 0 && dy === 0) return;

      setSelection((prev) => {
        if (!prev) return prev;

        let newBox = { ...resizeStart.box };

        switch (resizeHandle) {
          case 'nw':
            newBox.x += dx;
            newBox.y += dy;
            newBox.width -= dx;
            newBox.height -= dy;
            break;
          case 'ne':
            newBox.y += dy;
            newBox.width += dx;
            newBox.height -= dy;
            break;
          case 'sw':
            newBox.x += dx;
            newBox.width -= dx;
            newBox.height += dy;
            break;
          case 'se':
            newBox.width += dx;
            newBox.height += dy;
            break;
          case 'n':
            newBox.y += dy;
            newBox.height -= dy;
            break;
          case 's':
            newBox.height += dy;
            break;
          case 'e':
            newBox.width += dx;
            break;
          case 'w':
            newBox.x += dx;
            newBox.width -= dx;
            break;
        }

        // Minimum size
        if (newBox.width < 20) {
          newBox.width = 20;
          if (resizeHandle.includes('w')) {
            newBox.x = resizeStart.box.x + resizeStart.box.width - 20;
          }
        }
        if (newBox.height < 20) {
          newBox.height = 20;
          if (resizeHandle.includes('n')) {
            newBox.y = resizeStart.box.y + resizeStart.box.height - 20;
          }
        }

        // Update resizeStart for next iteration
        setResizeStart({ box: newBox, mouse: position });
        return newBox;
      });
    }
  }, [position, isResizing, resizeStart, resizeHandle]);

  const startSelection = () => {
    setOptions({ isSelecting: true });
    setSelection(null);
  };

  const startMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMoving(true);
    setMoveStart({ x: e.clientX, y: e.clientY });
  };

  const stopMove = () => {
    setIsMoving(false);
    setMoveStart(null);
  };

  const startResize = (handle: ResizeHandle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selection) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      box: { ...selection },
      mouse: { x: e.clientX, y: e.clientY },
    });
  };

  const stopResize = () => {
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStart(null);
  };

  const createCanvas = async (targetResolution: Resolution = 'normal'): Promise<CanvasResult> => {
    const capturePadding = 0; // settings.captureMargin;

    try {
      if (!selection) throw new Error('No selection or capturing in progress');
      await ensureFontsReady();
      hideSelectionUI();

      await new Promise((r) => setTimeout(r, 100));

      // Capture VISIBLE viewport (NOT document)
      const { screenshotUrl } = await sendMessage(EXT_MESSAGES.CAPTURE_VISIBLE);

      resetSelection();

      const image = new Image();
      image.src = screenshotUrl;
      await new Promise<void>((r, rej) => {
        image.onload = () => r();
        image.onerror = () => rej(new Error('Failed to load screenshot image'));
      });

      // Compute ratios
      const widthRatio = image.width / window.innerWidth;
      const heightRatio = image.height / window.innerHeight;

      // Expand selection by margin
      const cropX = Math.max(0, selection.x - capturePadding);
      const cropY = Math.max(0, selection.y - capturePadding);
      const cropWidth = Math.min(window.innerWidth - cropX, selection.width + capturePadding * 2);
      const cropHeight = Math.min(window.innerHeight - cropY, selection.height + capturePadding * 2);

      // ===== Handle resolution scaling =====
      let scaleFactor = 1;
      if (targetResolution === '4k') {
        scaleFactor = Math.min(3840 / cropWidth, 2160 / cropHeight, 2);
      } else if (targetResolution === '8k') {
        scaleFactor = Math.min(7680 / cropWidth, 4320 / cropHeight, 2);
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(cropWidth * widthRatio * scaleFactor);
      canvas.height = Math.floor(cropHeight * heightRatio * scaleFactor);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context creation failed');

      ctx.drawImage(
        image,
        Math.floor(cropX * widthRatio),
        Math.floor(cropY * heightRatio),
        Math.floor(cropWidth * widthRatio),
        Math.floor(cropHeight * heightRatio),
        0,
        0,
        canvas.width,
        canvas.height
      );

      const dataUrl = canvas.toDataURL('image/png');

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to convert canvas to blob'));
        }, 'image/png');
      });

      return { blob, dataUrl };
    } catch (error) {
      throw new Error(`Capture failed: ${(error as Error).message}`);
    }
  };

  const handleDownload = useCallback(async () => {
    try {
      await setOptions({ downloading: true });

      const { dataUrl } = await createCanvas();
      await sendMessage(EXT_MESSAGES.DOWNLOAD, { dataUrl, filename: validFilename(`${settings.quality}`, 'png') });

      await sendMessage(EXT_MESSAGES.NOTIFY, { title: 'Image Downloaded!', message: i18n.t('exportMessages.success') });
    } catch (error: any) {
      throw new Error(`Screenshot download failed: ${error?.message || error}`);
    } finally {
      await setOptions({ downloading: false });
      setSelection(null);
      handleUnmount();
    }
  }, [selection]);

  const handleCopy = useCallback(async () => {
    try {
      await setOptions({ copying: true });
      const { blob } = await createCanvas();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch (error: any) {
      throw new Error(`Screenshot copy failed: ${error?.message || error}`);
    } finally {
      await setOptions({ copying: false });
      setSelection(null);
      handleUnmount();
    }
  }, [selection]);

  const handleEdit = useCallback(async () => {
    try {
      const { dataUrl } = await createCanvas();

      await saveSettings({ base64Image: dataUrl });
      await sendMessage(EXT_MESSAGES.SHOW_EDITOR);
    } catch (error: any) {
      throw new Error(`Screenshot editing failed: ${error?.message || error}`);
    } finally {
      setSelection(null);
      handleUnmount();
    }
  }, [selection]);

  const hideSelectionUI = () => {
    if (actionButtonsRef.current) actionButtonsRef.current.style.display = 'none';
    if (overlayRef.current) overlayRef.current.style.display = 'none';
    if (selectionRef.current) selectionRef.current.style.display = 'none';
  };

  const resetSelection = useCallback(() => {
    setSelection(null);
    setOptions({ isSelecting: false });
  }, []);

  useEffect(() => {
    if (isMoving) {
      window.addEventListener('mouseup', stopMove);
      return () => window.removeEventListener('mouseup', stopMove);
    }
  }, [isMoving]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mouseup', stopResize);
      return () => window.removeEventListener('mouseup', stopResize);
    }
  }, [isResizing]);

  const handleUnmount = useCallback(async () => {
    sendMessageToMain(EXT_MESSAGES.UNMOUNT);
  }, [sendMessageToMain]);
  return (
    <div className="fixed inset-0 z-99999999! select-none">
      {/* Toolbar */}
      {/* {!selection && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 flex gap-2 items-center z-50">
          {!selection && !options.isSelecting && (
            <button onClick={startSelection} className="flex items-center gap-2 px-4 py-2 bg-app-500 text-white rounded hover:bg-app-600 transition">
              Start Selection
            </button>
          )}
        </div>
      )} */}

      {/* Overlay with cutout */}
      {(options.isSelecting || selection) && (
        <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <mask id="selection-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {selection && <rect x={selection.x} y={selection.y} width={selection.width} height={selection.height} fill="black" />}
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#selection-mask)" />
          </svg>
        </div>
      )}

      {/* Selection Box */}
      {selection && (
        <div
          ref={selectionRef}
          className="absolute border-2 border-dashed border-app-500 pointer-events-auto"
          style={{
            left: selection.x,
            top: selection.y,
            width: selection.width,
            height: selection.height,
            cursor: isMoving ? 'grabbing' : 'grab',
          }}
          onMouseDown={startMove}
        >
          {/* Move handle */}
          <div className={cn('absolute bottom-2 right-2 cursor-move text-xs font-medium', 'bg-white/50 px-2 py-1 text-black rounded')}>
            {Math.round(selection.width)} × {Math.round(selection.height)}
          </div>

          {/* Resize handles */}
          <div className="resize-handle cursor-nw-resize" style={{ left: -6, top: -6 }} onMouseDown={(e) => startResize('nw', e)} />
          <div className="resize-handle cursor-ne-resize" style={{ right: -6, top: -6 }} onMouseDown={(e) => startResize('ne', e)} />
          <div className="resize-handle cursor-sw-resize" style={{ left: -6, bottom: -6 }} onMouseDown={(e) => startResize('sw', e)} />
          <div className="resize-handle cursor-se-resize" style={{ right: -6, bottom: -6 }} onMouseDown={(e) => startResize('se', e)} />
          <div className="resize-handle cursor-n-resize" style={{ left: '50%', top: -6, transform: 'translateX(-50%)' }} onMouseDown={(e) => startResize('n', e)} />
          <div className="resize-handle cursor-s-resize" style={{ left: '50%', bottom: -6, transform: 'translateX(-50%)' }} onMouseDown={(e) => startResize('s', e)} />
          <div className="resize-handle cursor-e-resize" style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }} onMouseDown={(e) => startResize('e', e)} />
          <div className="resize-handle cursor-w-resize" style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }} onMouseDown={(e) => startResize('w', e)} />
        </div>
      )}

      {!options.isSelecting && !isResizing && selection && (
        <ActionButtons
          ref={actionButtonsRef}
          selection={selection}
          onDownload={handleDownload}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onEraser={() => {}}
          onCancel={() => {
            resetSelection();
            handleUnmount();
          }}
          options={options}
        />
      )}
    </div>
  );
}
