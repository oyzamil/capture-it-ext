import ActionButtons from '@/entrypoints/content/components/ActionButtons';
import { Button, Card, Typography } from 'antd';
import { forwardRef, ReactNode, useEffect, useId, useImperativeHandle, useState } from 'react';

const { Text } = Typography;

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;
type CropperProps = {
  mode?: 'custom' | 'element';
  maskRounded?: number;
  image?: string;
  cropperHeight?: number;
  cropperWidth?: number;
};
interface HiddenElement {
  element: HTMLElement;
  label: string;
}

export interface CropperRef {
  div: HTMLDivElement | null;
  resetSelection: () => void;
  hideCropperUI: () => void;
  getSelection: () => Rect | null;
  getImageSize: () => { width: number; height: number };
}

const Cropper = forwardRef<CropperRef, CropperProps>(({ mode = 'custom', maskRounded = 0 }, ref) => {
  const { settings } = useSettings();
  const { position, isDragging, dragStart, dragEnd } = useCursor();
  const [selection, setSelection] = useState<ElementSelection | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [moveStart, setMoveStart] = useState<Point | null>(null);
  const [resizeStart, setResizeStart] = useState<{ box: Rect; mouse: Point } | null>(null);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [cropAreaSize, setCropAreaSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // States for Element Selection Mode
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [hoveredRect, setHoveredRect] = useState<Rect | null>(null);
  const [hiddenElements, setHiddenElements] = useState<HiddenElement[]>([]);
  const localRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => ({
    div: localRef.current,
    getSelection: () => selection?.rect ?? null,
    getImageSize: () => imageSize,
    hideCropperUI,
    resetSelection,
  }));

  // Internal function you want parent to call
  const resetSelection = useCallback(() => {
    setSelection({ rect: { x: 0, y: 0, width: 0, height: 0 }, element: null });
  }, []);

  const hideCropperUI = () => {
    if (localRef.current) localRef.current.style.display = 'none';
  };
  function isSameRect(a: Rect, b: Rect) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
  }

  // Create initial selection
  useEffect(() => {
    if (mode === 'custom' && dragStart && isDragging) {
      const x = Math.min(dragStart.x, position.x);
      const y = Math.min(dragStart.y, position.y);
      const width = Math.abs(position.x - dragStart.x);
      const height = Math.abs(position.y - dragStart.y);

      if (!selection || !isSameRect(selection?.rect, { x, y, width, height })) {
        setSelection({
          rect: { x, y, width, height },
          element: selection?.element ?? null,
        });
      }
    }
  }, [dragStart, position, isDragging, mode]);

  // Finalize selection
  useEffect(() => {
    if (mode === 'custom' && dragEnd && dragStart) {
      const x = Math.min(dragStart.x, dragEnd.x);
      const y = Math.min(dragStart.y, dragEnd.y);
      const width = Math.abs(dragEnd.x - dragStart.x);
      const height = Math.abs(dragEnd.y - dragStart.y);

      if (width > 10 && height > 10) {
        setSelection({ element: null, rect: { x, y, width, height } });
      }
    }
  }, [dragEnd, dragStart, mode]);

  // Handle moving
  useEffect(() => {
    if (mode === 'custom' && isMoving && moveStart && selection) {
      const dx = position.x - moveStart.x;
      const dy = position.y - moveStart.y;

      if (dx !== 0 || dy !== 0) {
        setSelection({
          ...selection,
          rect: {
            ...selection.rect,
            x: selection.rect.x + dx,
            y: selection.rect.y + dy,
          },
        });
        setMoveStart(position);
      }
    }
  }, [mode, position, isMoving, moveStart, selection, setSelection]);

  // Handle resizing
  useEffect(() => {
    if (mode === 'custom' && isResizing && resizeStart && resizeHandle && selection) {
      const dx = position.x - resizeStart.mouse.x;
      const dy = position.y - resizeStart.mouse.y;

      if (dx === 0 && dy === 0) return;

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

      setResizeStart({ box: newBox, mouse: position });

      setSelection({
        ...selection,
        rect: {
          ...newBox,
        },
      });
    }
  }, [mode, position, isResizing, resizeStart, resizeHandle, selection, setSelection]);

  // Cleanup listeners
  useEffect(() => {
    const stopMove = () => {
      setIsMoving(false);
      setMoveStart(null);
    };

    if (mode === 'custom' && isMoving) {
      window.addEventListener('mouseup', stopMove);
      return () => window.removeEventListener('mouseup', stopMove);
    }
  }, [isMoving]);

  useEffect(() => {
    const stopResize = () => {
      setIsResizing(false);
      setResizeHandle(null);
      setResizeStart(null);
    };

    if (mode === 'custom' && isResizing) {
      window.addEventListener('mouseup', stopResize);
      return () => window.removeEventListener('mouseup', stopResize);
    }
  }, [isResizing]);

  const startMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selection) return;
    setIsMoving(true);
    setMoveStart({ x: e.clientX, y: e.clientY });
  };

  const startResize = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selection) return;

    setIsResizing(true);
    setResizeHandle(handle as ResizeHandle);

    setResizeStart({
      box: { ...selection.rect },
      mouse: { x: e.clientX, y: e.clientY },
    });
  };

  // Element Selection Mode --> Handle click to select element
  useEffect(() => {
    if (mode === 'custom' || selection) return;

    const el = document.elementFromPoint(position.x, position.y) as HTMLElement;
    if (localRef.current?.contains(el) || !el || el.closest('capture-it-ext')) {
      setHoveredElement(null);
      setHoveredRect(null);
      return;
    }

    setHoveredElement(el);
    const rect = el.getBoundingClientRect();
    setHoveredRect({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [position, selection]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Allow panel clicks
      // if ((e.target as HTMLElement).closest('capture-it-ext')) {
      //   return;
      // }

      if (selection) return;
      if (!hoveredElement || !hoveredRect) return;

      // Ignore clicks on panel
      if (localRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      e.stopPropagation();

      setSelection({
        element: hoveredElement,
        rect: hoveredRect,
      });
    };

    if (mode === 'element') window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [hoveredElement, hoveredRect, selection, setSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // resetSelection();
      } else if (e.key === 'h' || e.key === 'H') {
        // if (!hoveredElement || hoveredElement.closest('capture-it-ext')) return;
        if (!hoveredElement || localRef.current?.contains(e.target as Node)) return;

        const label = hoveredElement.tagName.toLowerCase() + (hoveredElement.id ? `#${hoveredElement.id}` : '') + (hoveredElement.className ? `.${hoveredElement.className.split(' ')[0]}` : '');

        setHiddenElements((prev) => [...prev, { element: hoveredElement, label }]);
        hoveredElement.style.display = 'none';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredElement]);
  const handleRestoreElement = useCallback(
    (index: number) => {
      const item = hiddenElements[index];
      if (item?.element) {
        item.element.style.display = '';
      }
      setHiddenElements((prev) => prev.filter((_, i) => i !== index));
    },
    [hiddenElements]
  );

  const handleRestoreAll = useCallback(() => {
    hiddenElements.forEach((item) => {
      if (item?.element) {
        item.element.style.display = '';
      }
    });
    setHiddenElements([]);
  }, [hiddenElements]);

  function expandRectToViewport(rect: { x: number; y: number; width: number; height: number }, mode: 'custom' | 'element') {
    const margin = mode === 'custom' ? 0 : settings.captureMargin;
    const x = Math.max(0, rect.x - margin);
    const y = Math.max(0, rect.y - margin);

    return {
      x,
      y,
      width: Math.min(window.innerWidth - x, rect.width + margin * 2),
      height: Math.min(window.innerHeight - y, rect.height + margin * 2),
    };
  }

  const maskId = useId();
  // const displayRect = selection?.rect ?? hoveredRect;
  // const shouldApplyHole = displayRect && !(mode === 'element' && displayRect.x === 0 && displayRect.y === 0);

  const baseRect = selection?.rect ?? hoveredRect;
  const displayRect = baseRect ? expandRectToViewport(baseRect, mode) : null;
  const shouldApplyHole = !!displayRect && !(mode === 'element' && displayRect.x === 0 && displayRect.y === 0);

  return (
    <div ref={localRef} className={cn('z-2147483647! select-none', mode === 'custom' && 'fixed inset-0')}>
      {!displayRect && (
        <div className={cn('flex items-center justify-center', mode === 'custom' && 'absolute inset-0 h-full w-full z-1')}>
          <div className="text-white text-xl font-medium">{mode === 'custom' ? 'Click and drag to select an area' : 'Hover over any element and click to select it!'}</div>
        </div>
      )}
      <div className={cn('inset-0 pointer-events-none', mode === 'element' ? 'fixed' : 'absolute')}>
        <svg className={cn('w-full h-full', mode === 'custom' && 'absolute')} preserveAspectRatio="none" viewBox={`0 0 ${cropAreaSize.width} ${cropAreaSize.height}`}>
          <defs>
            <mask id={maskId}>
              {/* Full visible area */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />

              {/* Cut-out hole (conditionally rendered) */}
              {shouldApplyHole && <rect x={displayRect!.x} y={displayRect!.y} width={displayRect!.width} height={displayRect!.height} rx={maskRounded} fill="black" />}
            </mask>
          </defs>

          {/* Dim layer */}
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask={`url(#${maskId})`} />

          {/* Visible border */}
          {mode === 'element' && displayRect && shouldApplyHole && (
            <rect
              x={displayRect.x}
              y={displayRect.y}
              width={displayRect.width}
              height={displayRect.height}
              rx={maskRounded}
              fill="none"
              className="stroke-app-500"
              strokeWidth="3"
              strokeDasharray="6"
            />
          )}
        </svg>
      </div>

      {/* Selection Box */}
      {mode === 'custom' && selection && (
        <div
          className="absolute border-2 border-dashed border-app-500 pointer-events-auto"
          style={{
            left: selection?.rect.x,
            top: selection?.rect.y,
            width: selection?.rect.width,
            height: selection?.rect.height,
            cursor: isMoving ? 'grabbing' : 'grab',
          }}
          onMouseDown={startMove}
        >
          {/* Move handle */}
          <div className={cn('absolute bottom-2 right-2 cursor-move text-xs font-medium', 'text-black dark:text-white bg-white/50 dark:bg-neutral-900/50 px-2 py-1 rounded')}>
            {Math.round(selection?.rect.width)} × {Math.round(selection?.rect.height)}
          </div>

          {/* Resize handles */}
          {/* <div className="resize-handle cursor-nw-resize" style={{ left: -6, top: -6 }} onMouseDown={(e) => startResize('nw', e)} />
          <div className="resize-handle cursor-ne-resize" style={{ right: -6, top: -6 }} onMouseDown={(e) => startResize('ne', e)} />
          <div className="resize-handle cursor-sw-resize" style={{ left: -6, bottom: -6 }} onMouseDown={(e) => startResize('sw', e)} />
          <div className="resize-handle cursor-se-resize" style={{ right: -6, bottom: -6 }} onMouseDown={(e) => startResize('se', e)} />
          <div className="resize-handle cursor-n-resize" style={{ left: '50%', top: -6, transform: 'translateX(-50%)' }} onMouseDown={(e) => startResize('n', e)} />
          <div className="resize-handle cursor-s-resize" style={{ left: '50%', bottom: -6, transform: 'translateX(-50%)' }} onMouseDown={(e) => startResize('s', e)} />
          <div className="resize-handle cursor-e-resize" style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }} onMouseDown={(e) => startResize('e', e)} />
          <div className="resize-handle cursor-w-resize" style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }} onMouseDown={(e) => startResize('w', e)} />
           */}

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
      )}

      {mode === 'element' && (
        <div className="fixed right-4 bottom-4" style={{ pointerEvents: 'auto' }}>
          <Card size="small" title={<Watermark className="mr-3" />}>
            {/* Hidden Elements */}
            <div className="max-h-40 overflow-auto space-y-2 p-2 border-2 border-gray-200 rounded-md mb-2">
              {hiddenElements.length === 0 ? (
                <p className="text-xs text-center p-2">No hidden elements</p>
              ) : (
                <>
                  <p className="block text-xs font-medium mb-1">Hidden Elements</p>
                  {hiddenElements.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1" title={item.label}>
                        {item.label}
                      </span>
                      <Button size="small" onClick={() => handleRestoreElement(idx)} className="text-xs">
                        {i18n.t('undo')}
                      </Button>
                    </div>
                  ))}
                </>
              )}

              {hiddenElements.length > 0 && (
                <Button size="small" onClick={handleRestoreAll} className="text-xs" block>
                  {i18n.t('restoreAll')}
                </Button>
              )}
            </div>

            <Point prefix="Press" title="H" info="to hide hovered element" />
            <Point prefix="Press" title="Esc" info="Reset selection" />
          </Card>
        </div>
      )}

      {selection && <ActionButtons mode={mode} selection={selection} hideCropperUI={hideCropperUI} />}
    </div>
  );
});

export default Cropper;

type PointTypes = {
  prefix?: ReactNode | string;
  title: ReactNode | string;
  info: ReactNode | string;
};
const Point = ({ prefix, title, info }: PointTypes) => {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs">
        <span>{prefix}</span>
        <Text keyboard>{title}</Text>
        <span>{info}</span>
      </div>
    </div>
  );
};
