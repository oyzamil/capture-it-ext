import { Button, Card, Typography } from 'antd';
import { ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { ensureFontsReady, sketchImage } from '../utils';
import ActionButtons from './ActionButtons';

interface selection {
  element: HTMLElement;
  rect: Rect;
}

interface HiddenElement {
  element: HTMLElement;
  label: string;
}

const { Text } = Typography;

export default function ElementSnapExtension() {
  const { position } = useCursor();
  const { settings, saveSettings } = useSettings();
  const [options, setOptions] = useStateUpdater({
    overlay: true,
    downloading: false,
    copying: false,
    eraser: false,
  });

  const [selection, setselection] = useState<selection | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [hoveredRect, setHoveredRect] = useState<Rect | null>(null);
  const [hiddenElements, setHiddenElements] = useState<HiddenElement[]>([]);

  const actionButtonsRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Update hovered element based on cursor position
  useEffect(() => {
    if (selection) return;

    const el = document.elementFromPoint(position.x, position.y) as HTMLElement;
    if (!el || el.closest('capture-it-ext')) {
      setHoveredElement(null);
      setHoveredRect(null);
      return;
    }

    // Ignore panel and its children
    if (panelRef.current?.contains(el)) {
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

  // Handle click to select element
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Allow panel clicks
      if ((e.target as HTMLElement).closest('capture-it-ext')) {
        return;
      }

      if (selection) return;
      if (!hoveredElement || !hoveredRect) return;

      // Ignore clicks on panel
      if (panelRef.current?.contains(e.target as Node)) return;

      e.preventDefault();
      e.stopPropagation();

      setselection({
        element: hoveredElement,
        rect: hoveredRect,
      });
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [hoveredElement, hoveredRect, selection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setselection(null);
      } else if (e.key === 'h' || e.key === 'H') {
        if (!hoveredElement || hoveredElement.closest('capture-it-ext')) return;

        const label = hoveredElement.tagName.toLowerCase() + (hoveredElement.id ? `#${hoveredElement.id}` : '') + (hoveredElement.className ? `.${hoveredElement.className.split(' ')[0]}` : '');

        setHiddenElements((prev) => [...prev, { element: hoveredElement, label }]);
        hoveredElement.style.display = 'none';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredElement]);

  const hideSelectionUI = () => {
    if (actionButtonsRef.current) actionButtonsRef.current.style.display = 'none';
    if (overlayRef.current) overlayRef.current.style.display = 'none';
  };

  const resetSelection = useCallback(() => {
    setselection(null);
  }, []);

  const createCanvas = async (): Promise<CanvasResult> => {
    if (!selection) throw new Error('No selection to capture');

    await ensureFontsReady();
    hideSelectionUI();

    const { element, rect } = selection;
    const padding = settings.captureMargin;
    try {
      const { blob, dataUrl } = await sketchImage(element, {
        captureMargin: padding,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        paddingColor: '#ffffff',
        transparentPadding: false,
        roundedRadius: 0,
        squircleRounding: true,
        cornerSmoothing: 0.6,
        format: 'png',
        quality: 90,
      });
      return { blob, dataUrl };
    } catch (error) {
      throw new Error(`Capture failed: ${(error as Error).message}`);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!selection) return;

    try {
      await setOptions({ downloading: true });
      const { dataUrl } = await createCanvas();
      await sendMessage(EXT_MESSAGES.DOWNLOAD, { dataUrl, filename: validFilename(`${settings.quality}`, 'png') });
      await sendMessage(EXT_MESSAGES.NOTIFY, { title: 'Image Downloaded!', message: 'Image download completed!' });
    } catch (error: any) {
      throw new Error(`Screenshot download failed: ${error?.message || error}`);
    } finally {
      await setOptions({ downloading: false });
      handleUnmount();
    }
  }, [selection, settings.captureMargin]);

  const handleCopy = useCallback(async () => {
    try {
      await setOptions({ copying: true });
      const { blob } = await createCanvas();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch (error: any) {
      throw new Error(`Screenshot copy failed: ${error?.message || error}`);
    } finally {
      await setOptions({ copying: false });
      handleUnmount();
    }
  }, [selection, settings.captureMargin]);

  const handleEdit = useCallback(async () => {
    try {
      const { dataUrl } = await createCanvas();

      await saveSettings({ base64Image: dataUrl });
      await sendMessage(EXT_MESSAGES.SHOW_EDITOR);
    } catch (error: any) {
      throw new Error(`Screenshot editing failed: ${error?.message || error}`);
    } finally {
      resetSelection();
      handleUnmount();
    }
  }, [selection, settings.captureMargin]);

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

  const handleUnmount = useCallback(async () => {
    sendMessageToMain(EXT_MESSAGES.UNMOUNT);
  }, [sendMessageToMain]);

  const displayRect = selection?.rect ?? hoveredRect;
  const maskId = useId();
  const maskRoundRadius = 0;

  return (
    <div className="z-99999999! select-none">
      {options.overlay && displayRect && (
        <div ref={overlayRef} className="fixed inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} preserveAspectRatio="none">
            <defs>
              <mask id={maskId}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect x={displayRect.x} y={displayRect.y} width={displayRect.width} height={displayRect.height} fill="black" rx={maskRoundRadius} />
              </mask>
            </defs>

            {/* Dim layer */}
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask={`url(#${maskId})`} />

            {/* 🔥 Visible border (Tailwind-like styling) */}
            <rect
              x={displayRect.x}
              y={displayRect.y}
              width={displayRect.width}
              height={displayRect.height}
              rx={maskRoundRadius}
              fill="none"
              className="stroke-app-500"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>
        </div>
      )}

      {selection && displayRect && (
        <ActionButtons
          ref={actionButtonsRef}
          selection={displayRect}
          onDownload={() => {
            handleDownload();
          }}
          onCopy={() => {
            handleCopy();
          }}
          onEdit={() => {
            handleEdit();
          }}
          onEraser={() => {}}
          onCancel={() => {
            resetSelection();
            handleUnmount();
          }}
          options={options}
        />
      )}
      {/* Panel */}
      <div ref={panelRef}>
        <div className="fixed right-4 bottom-4" style={{ pointerEvents: 'auto' }}>
          <Card
            size="small"
            title={<Watermark className="mr-3" />}
            // extra={
            //   <Button type="text" size="small" shape="circle" onClick={async () => await setOptions({ overlay: !options.overlay })}>
            //     {options.overlay ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            //   </Button>
            // }
          >
            {/* {selection && (
              <Alert
                type="info"
                description={
                  <div className="space-y-1 text-xs">
                    <div>Width: {Math.round(selection.rect.width)}px</div>
                    <div>Height: {Math.round(selection.rect.height)}px</div>
                    <div>X: {Math.round(selection.rect.x)}px</div>
                    <div>Y: {Math.round(selection.rect.y)}px</div>
                  </div>
                }
              />
            )} */}

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
      </div>
    </div>
  );
}

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
