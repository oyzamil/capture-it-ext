import { useAntd } from '@/providers/ThemeProvider';
import { ArrowRightOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, ColorPicker, Divider, Row, Select, Space, Switch, Typography } from 'antd';
import domtoimage from 'dom-to-image-more';
import * as htmlToImage from 'html-to-image';

import React, { Activity } from 'react';

const { Title } = Typography;

type BlobState = {
  src: string | ArrayBuffer | null;
  w: number;
  h: number;
};

const ThumbnailGenerator: React.FC = () => {
  const { message } = useAntd();
  const { settings, saveSettings, resetSettings } = useSettings();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [blob, setBlob] = useState<BlobState>({ src: null, w: 0, h: 0 });

  const gradientPresets = [
    {
      label: 'Default Gradients & Colors',
      defaultOpen: true,
      colors: [
        [
          { color: '#f9a8d4', percent: 0 },
          { color: '#fed7aa', percent: 50 },
          { color: '#fca5a5', percent: 100 },
        ],
        [
          { color: '#86efac', percent: 0 },
          { color: '#fef08a', percent: 50 },
          { color: '#bbf7d0', percent: 100 },
        ],
        [
          { color: '#bbf7d0', percent: 0 },
          { color: '#bfdbfe', percent: 50 },
          { color: '#93c5fd', percent: 100 },
        ],
        [
          { color: '#c7d2fe', percent: 0 },
          { color: '#60a5fa', percent: 50 },
          { color: '#8b5cf6', percent: 100 },
        ],
        [
          { color: '#fca5a5', percent: 0 },
          { color: '#fdba74', percent: 50 },
          { color: '#fde68a', percent: 100 },
        ],
        [
          { color: '#f9a8d4', percent: 0 },
          { color: '#f472b6', percent: 50 },
          { color: '#f87171', percent: 100 },
        ],
        [
          { color: '#94a3b8', percent: 0 },
          { color: '#6b7280', percent: 50 },
          { color: '#374151', percent: 100 },
        ],
        [
          { color: '#fdba74', percent: 0 },
          { color: '#fb923c', percent: 50 },
          { color: '#f87171', percent: 100 },
        ],
        [
          { color: '#5eead4', percent: 0 },
          { color: '#22d3ee', percent: 100 },
        ],
        [
          { color: '#f87171', percent: 0 },
          { color: '#9333ea', percent: 100 },
        ],
        // Solid colors
        '#ffffff',
        '#000000',
      ],
    },
  ];

  const bgPatterns = [
    { value: '', label: 'None' },
    { value: 'jigsaw', label: 'jigsaw' },
    { value: 'ripples', label: 'ripples' },
    { value: 'topography', label: 'topography' },
    { value: 'texture', label: 'texture' },
    { value: 'hub', label: 'hub' },
    { value: 'architect', label: 'architect' },
    { value: 'voxel', label: 'voxel' },
    { value: 'crosses', label: 'crosses' },
    { value: 'graph', label: 'graph' },
    { value: 'squares', label: 'squares' },
    { value: 'falling-triangles', label: 'falling-triangles' },
    { value: 'pies', label: 'pies' },
    { value: 'hexagons', label: 'hexagons' },
    { value: 'zig-zag', label: 'zig-zag' },
    { value: 'zig-zag-2', label: 'zig-zag-2' },
    { value: 'autumn', label: 'autumn' },
    { value: 'temple', label: 'temple' },
    { value: 'death-star', label: 'death-star' },
    { value: 'overlapping-hexagons', label: 'overlapping-hexagons' },
    { value: 'stars', label: 'stars' },
    { value: 'bamboo', label: 'bamboo' },
    { value: 'floor', label: 'floor' },
    { value: 'cork-screw', label: 'cork-screw' },
    { value: 'kiwi', label: 'kiwi' },
    { value: 'lips', label: 'lips' },
    { value: 'checkered', label: 'checkered' },
    { value: 'x-equals', label: 'x-equals' },
    { value: 'bevel-circle', label: 'bevel-circle' },
    { value: 'brick-wall', label: 'brick-wall' },
    { value: 'fancy-rectangles', label: 'fancy-rectangles' },
    { value: 'heavy-rain', label: 'heavy-rain' },
    { value: 'overlapping-circles', label: 'overlapping-circles' },
    { value: 'plus', label: 'plus' },
    { value: 'plus-connected', label: 'plus-connected' },
    { value: 'volcano-lamp', label: 'volcano-lamp' },
    { value: 'wiggle', label: 'wiggle' },
    { value: 'bubbles', label: 'bubbles' },
    { value: 'cage', label: 'cage' },
    { value: 'connections', label: 'connections' },
    { value: 'current', label: 'current' },
    { value: 'diagonal-stripes', label: 'diagonal-stripes' },
    { value: 'flipped-diamonds', label: 'flipped-diamonds' },
    { value: 'houndstooth', label: 'houndstooth' },
    { value: 'leaf', label: 'leaf' },
    { value: 'lines-in-motion', label: 'lines-in-motion' },
    { value: 'moroccan', label: 'moroccan' },
    { value: 'morphing-diamonds', label: 'morphing-diamonds' },
    { value: 'rails', label: 'rails' },
    { value: 'rain', label: 'rain' },
    { value: 'squares-in-squares', label: 'squares-in-squares' },
    { value: 'stripes', label: 'stripes' },
    { value: 'tic-tac-toe', label: 'tic-tac-toe' },
    { value: 'aztec', label: 'aztec' },
    { value: 'bank-note', label: 'bank-note' },
    { value: 'boxes', label: 'boxes' },
    { value: 'circles-and-squares', label: 'circles-and-squares' },
    { value: 'circuit-board', label: 'circuit-board' },
    { value: 'curtain', label: 'curtain' },
    { value: 'clouds', label: 'clouds' },
    { value: 'eyes', label: 'eyes' },
    { value: 'tiles', label: 'tiles' },
    { value: 'groovy', label: 'groovy' },
    { value: 'intersecting-circles', label: 'intersecting-circles' },
    { value: 'melt', label: 'melt' },
    { value: 'overlapping-diamonds', label: 'overlapping-diamonds' },
    { value: 'wood', label: 'wood' },
    { value: 'polka', label: 'polka' },
    { value: 'signal', label: 'signal' },
    { value: 'slanted', label: 'slanted' },
    { value: 'lines-diagonal-right', label: 'lines-diagonal-right' },
    { value: 'lines-diagonal-left', label: 'lines-diagonal-left' },
    { value: 'lines-horizontal', label: 'lines-horizontal' },
    { value: 'lines-vertical', label: 'lines-vertical' },
    { value: 'sprinkles', label: 'sprinkles' },
    { value: 'waves', label: 'waves' },
    { value: 'hive', label: 'hive' },
    { value: 'squiggles', label: 'squiggles' },
    { value: 'triangles', label: 'triangles' },
    { value: 'grid', label: 'grid' },
    { value: 'zebra', label: 'zebra' },
    { value: 'pattern-dots', label: 'Dots (pattern-dots)' },
    { value: 'pattern-boxes', label: 'Boxes (pattern-boxes)' },
    { value: 'pattern-cross', label: 'Cross (pattern-cross)' },
    { value: 'pattern-zigzag', label: 'Zigzag (pattern-zigzag)' },
    { value: 'pattern-zigzag-3d', label: 'Zigzag 3D (pattern-zigzag-3d)' },
    { value: 'pattern-isometric', label: 'Isometric (pattern-isometric)' },
    { value: 'pattern-wavy', label: 'Wavy (pattern-wavy)' },
    { value: 'pattern-triangles', label: 'Triangles (pattern-triangles)' },
    { value: 'pattern-moon', label: 'Moon (pattern-moon)' },
    { value: 'pattern-paper', label: 'Paper (pattern-paper)' },
  ];

  useEffect(() => {
    if (settings.base64Image) {
      setBlob((prev) => ({
        ...prev,
        src: settings.base64Image,
      }));
    }
  }, [settings]);

  useEffect(() => {
    document.addEventListener('keydown', handleShortcuts);

    return () => {
      document.removeEventListener('keydown', handleShortcuts);
    };
  }, [blob]);

  const imageStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!blob?.w) return undefined;

    return {
      width: `${blob.w / (window.devicePixelRatio || 1)}px`,
    };
  }, [blob?.w]);

  const handleShortcuts = (e: KeyboardEvent) => {
    if ((e.key === 'c' && e.ctrlKey) || (e.key === 'c' && e.metaKey)) {
      e.preventDefault();
      copyImage();
    }

    if ((e.key === 's' && e.ctrlKey) || (e.key === 's' && e.metaKey)) {
      e.preventDefault();
      saveImage();
    }
  };

  const snapshotCreator = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const scale = window.devicePixelRatio;
        const element = wrapperRef.current; // Reference to the element
        if (element) {
          domtoimage
            .toBlob(element, {
              height: element.offsetHeight * scale,
              width: element.offsetWidth * scale,
              style: {
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${element.offsetWidth}px`,
                height: `${element.offsetHeight}px`,
              },
            })
            .then((blob: Blob | null) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            })
            .catch((error: Error) => {
              reject(error);
            });
        } else {
          reject(new Error('Element not found'));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const saveImage = async () => {
    if (!blob?.src) {
      message.error('Nothing to save, make sure to add a screenshot first!');
      return;
    }

    const savingmessage = message.loading('Exporting image...');
    const scale = window.devicePixelRatio;

    // Define aspect ratio dimensions with optional 4K support
    const getAspectRatioDimensions = (aspectRatio: string, is4K: boolean) => {
      if (!wrapperRef.current) {
        return { width: 700, height: 300 };
      }
      const baseWidth = is4K ? 3840 : wrapperRef.current.offsetWidth * scale; // 4K width or original width
      switch (aspectRatio) {
        case 'aspect-square': // 1:1
          return { width: baseWidth, height: baseWidth };
        case 'aspect-[9/16]': // 9:16
          return { width: baseWidth, height: (baseWidth * 16) / 9 };
        case 'aspect-video': // 16:9
          return { width: baseWidth, height: (baseWidth * 9) / 16 };
        case 'aspect-[4/5]': // 4:5
          return { width: baseWidth, height: (baseWidth * 5) / 4 };
        case 'aspect-[4/3]': // 4:3
          return { width: baseWidth, height: (baseWidth * 3) / 4 };
        case 'aspect-[3/2]': // 3:2
          return { width: baseWidth, height: (baseWidth * 2) / 3 };
        case 'aspect-[21/9]': // 21:9
          return { width: baseWidth, height: (baseWidth * 9) / 21 };
        case 'aspect-crx-thumb': // 1.6:1
          return { width: baseWidth, height: (baseWidth * 1) / 1.6 };
        case 'aspect-auto': // Auto, use original dimensions
        default:
          return {
            width: wrapperRef.current.offsetWidth * scale,
            height: wrapperRef.current.offsetHeight * scale,
          };
      }
    };

    const is4K = settings.resolution === '4k'; // Assuming resolution is stored in `options`
    const { width, height } = getAspectRatioDimensions(settings.aspectRatio, is4K);
    if (wrapperRef.current)
      htmlToImage
        .toPng(wrapperRef.current, {
          height,
          width,
          style: {
            transform: 'scale(' + scale + ')',
            transformOrigin: 'top left',
            width: wrapperRef.current.offsetWidth + 'px',
            height: wrapperRef.current.offsetHeight + 'px',
            border: 'none',
          },
        })
        .then((data) => {
          const a = document.createElement('A') as HTMLAnchorElement;
          a.href = data;
          a.download = `${getPackageProp('name')}-${is4K ? '4k-' : ''}${new Date().toISOString()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          message.success('Image exported!');
        })
        .catch((error) => {
          console.error('Error exporting image:', error);
          message.error('Failed to export image.');
        });
  };

  const copyImage = () => {
    if (!blob?.src) {
      message.error('Nothing to copy, make sure to add a screenshot first!');
      return;
    }
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator?.userAgent);
    const isNotFirefox = navigator.userAgent.indexOf('Firefox') < 0;

    if (isSafari) {
      navigator.clipboard
        .write([
          new ClipboardItem({
            'image/png': new Promise((resolve, reject) => {
              (async () => {
                try {
                  await snapshotCreator();
                  const blob = await snapshotCreator();
                  resolve(new Blob([blob], { type: 'image/png' }));
                } catch (err) {
                  reject(err);
                }
              })();
            }),
          }),
        ])
        .then(() => message.success('Image copied to clipboard'))
        .catch((err) =>
          // Error
          message.success(err)
        );
    } else if (isNotFirefox) {
      navigator?.permissions?.query({ name: 'clipboard-write' as unknown as PermissionName }).then(async (result) => {
        if (result.state === 'granted') {
          const type = 'image/png';
          await snapshotCreator();
          const blob = await snapshotCreator();
          const data = [new ClipboardItem({ [type]: blob })];
          navigator.clipboard
            .write(data)
            .then(() => {
              // Success
            })
            .catch((err) => {
              // Error
              console.error('Error:', err);
            });
        }
      });
    } else {
      alert('Firefox does not support this functionality');
    }
  };

  const onPaste = (event: React.ClipboardEvent | React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    let files: File[] = [];

    // 📋 Clipboard paste
    if ('clipboardData' in event && event.clipboardData) {
      files = Array.from(event.clipboardData.items)
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter(Boolean) as File[];
    }

    // 🖱️ Drag & drop
    else if ('dataTransfer' in event && event.dataTransfer) {
      files = Array.from(event.dataTransfer.files);
    }

    // 📁 File input (FIXED)
    else if (event.target instanceof HTMLInputElement && event.target.files) {
      files = Array.from(event.target.files);
    }

    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) return;

        setBlob((prev) => ({
          ...prev,
          src: result,
        }));
      };

      reader.readAsDataURL(file);
    });
  };

  function hexToRgba(hex: string, opacity: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      onPaste={onPaste}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onPaste(e);
      }}
    >
      <div className="max-w-8xl mx-auto p-4">
        <Title level={2} className="mb-8 text-center">
          🎨 Enhanced Thumbnail Generator
        </Title>

        <Row gutter={[30, 12]} className="justify-center">
          {/* Sticky Preview Panel */}
          <Col xs={12}>
            <div className="sticky top-4">
              <Card
                title="Preview"
                classNames={{
                  body: 'preview-area relative w-full h-full overflow-hidden flex justify-center',
                }}
                extra={
                  <Button onClick={() => setBlob({ src: null, w: 0, h: 0 })} type="text" danger>
                    <span className="size-4">{ResetIcon}</span>
                    Reset Canvas
                  </Button>
                }
              >
                {blob?.src ? (
                  <>
                    <div
                      ref={(el) => {
                        wrapperRef.current = el;
                      }}
                      className={cn('overflow-hidden shadow-xl relative my-5 grid max-h-screen', settings.aspectRatio, settings.roundedWrapper, settings.padding, settings.position)}
                      style={{
                        background: settings.canvasColors
                          ? settings.canvasColors.length === 1
                            ? settings.canvasColors[0] // single color
                            : `linear-gradient(${settings.backgroundAngle}, ${settings.canvasColors
                                .map((c, i) => {
                                  const percent = Math.round((i / (settings.canvasColors.length - 1)) * 100);
                                  return `${c} ${percent}%`;
                                })
                                .join(', ')})`
                          : 'transparent',
                        boxSizing: 'border-box',
                      }}
                    >
                      <PatternBox className="w-full h-full absolute mix-blend-soft-light inset-0" patternName={cn(settings.bgPattern)} />
                      <Activity mode={settings.noise ? 'visible' : 'hidden'}>
                        <div
                          style={{ backgroundImage: `url("/noise.svg")` }}
                          className={`absolute inset-0 w-full h-full bg-repeat opacity-[0.15] ${settings.rounded} ${settings.browserBar !== 'hidden' ? 'rounded-t-none' : ''}`}
                        />
                      </Activity>
                      <div className={cn('grid stack stack-top', settings.scale)}>
                        <div className={cn('stack-item relative overflow-hidden', settings.rounded, settings.shadow)}>
                          {/* Browser Bar  */}
                          <Activity mode={settings.browserBar === 'hidden' ? 'hidden' : 'visible'}>
                            <div
                              className={cn(settings.rounded, 'flex items-center w-full px-4 py-2.5 rounded-b-none z-10', settings.browserBar === 'light' ? 'bg-white' : 'bg-black')}
                              style={imageStyle}
                            >
                              <div className="flex items-center space-x-2">
                                {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                                  <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
                                ))}
                              </div>
                            </div>
                          </Activity>

                          <div
                            aria-label="Generated Image"
                            style={{
                              ...imageStyle,
                              backgroundImage: `url(${blob?.src})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                              backgroundSize: 'contain', // or 'cover' if you want crop
                              aspectRatio: `${blob?.w} / ${blob?.h}`,
                            }}
                            className={cn('relative z-10', settings.rounded, settings.browserBar === 'hidden' ? '' : 'rounded-t-none')}
                          >
                            {/* hidden img only for natural size detection */}
                            <img
                              src={blob?.src as any}
                              alt=""
                              className="hidden"
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement;
                                setBlob({
                                  ...blob,
                                  w: target.naturalWidth,
                                  h: target.naturalHeight,
                                });
                              }}
                            />
                          </div>
                        </div>
                        {[0.9, 0.7].map((opacity, i) => (
                          <div
                            key={i}
                            className={cn(settings.rounded, 'stack-item ')}
                            style={{
                              backgroundColor: settings.browserBar === 'dark' ? hexToRgba('#000000', opacity) : hexToRgba('#ffffff', opacity),
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center min-h-[50vh] lg:min-h-[80vh]">
                    <label
                      className="flex flex-col items-center justify-center text-md opacity-30 select-none max-w-[550px] rounded-md p-10 mt-20 text-center dark:text-white cursor-pointer border-2 border-dashed border-gray-400 hover:opacity-50 duration-300"
                      htmlFor="imagesUpload"
                    >
                      <input
                        className="hidden"
                        id="imagesUpload"
                        type="file"
                        onChange={(e: any) => {
                          onPaste(e);
                        }}
                      />
                      <span className="w-6 h-6 mb-2">{PasteIcon}</span>
                      <p>Paste your screenshot(Cmd/Ctrl+V)</p>
                      <p>or drag and drop your screenshot here</p>
                      <p>or click here to add one</p>
                    </label>
                  </div>
                )}
              </Card>
            </div>
          </Col>
          {/* Controls Panel */}
          <Col xs={12} lg={5}>
            <div className="space-y-6">
              <Card
                title="Canvas Options"
                size="small"
                extra={
                  <Button onClick={resetSettings} type="text" danger>
                    <span className="size-4">{ResetIcon}</span>
                    Reset Settings
                  </Button>
                }
              >
                <Space orientation="vertical" className="w-full" size="middle">
                  <div>
                    <label>Aspect Ratio</label>
                    <Select
                      className="w-full"
                      value={settings.aspectRatio}
                      placeholder="Aspect Ratio"
                      options={[
                        { value: 'aspect-auto', label: 'Auto' },
                        { value: 'aspect-square', label: '1:1 — Square' },
                        { value: 'aspect-video w-full', label: '16:9 — Video' },
                        { value: 'aspect-[9/16]', label: '9:16 — Mobile / Story' },
                        { value: 'aspect-[1280/800] w-full', label: 'Extension Thumbnail' },
                        { value: 'aspect-[440/280] w-full', label: 'Chrome Promo Tile' },
                        { value: 'aspect-[4/5]', label: '4:5 — Instagram Portrait' },
                        { value: 'aspect-[4/3] w-full', label: '4:3 — Classic' },
                        { value: 'aspect-[3/2] w-full', label: '3:2 — Photography' },
                        { value: 'aspect-[21/9] w-full', label: '21:9 — Ultrawide' },
                      ]}
                      onChange={(aspectRatio) => {
                        saveSettings({ aspectRatio });
                      }}
                    />
                  </div>

                  <div>
                    <label>Rounded Corners</label>
                    <Select
                      className="w-full"
                      value={settings.roundedWrapper}
                      placeholder="Rounded Corners"
                      options={[
                        { value: 'rounded-none', label: 'None' },
                        { value: 'rounded-lg', label: 'Small' },
                        { value: 'rounded-xl', label: 'Medium' },
                        { value: 'rounded-3xl', label: 'Large' },
                      ]}
                      onChange={(roundedWrapper) => {
                        saveSettings({ roundedWrapper });
                      }}
                    />
                  </div>

                  <div className="flex w-full border border-gray-300 rounded-md p-2">
                    <div className="w-full flex items-center gap-2 pr-3 justify-between">
                      <label className="block">Background</label>
                      <ColorPicker
                        format="hex"
                        mode={['single', 'gradient']}
                        defaultValue={[
                          {
                            color: settings.canvasColors[0],
                            percent: 0,
                          },
                          {
                            color: settings.canvasColors[1],
                            percent: 100,
                          },
                        ]}
                        presets={gradientPresets}
                        onChangeComplete={(color) => {
                          const colors = color.getColors();
                          const canvasColorsHex = colors.map((c) => c.color.toHexString());

                          saveSettings({ canvasColors: canvasColorsHex });
                        }}
                      />
                    </div>
                    <Divider orientation="vertical" className="h-auto" />
                    <div className="w-full flex items-center gap-2 justify-between">
                      <label>Angle</label>
                      <div className="buttons-list justify-around grid grid-cols-3 gap-0.5">
                        {[
                          { direction: 'To top left', angle: 315 },
                          { direction: 'To top', angle: 0 },
                          { direction: 'To top right', angle: 45 },

                          { direction: 'To left', angle: 270 },
                          { direction: 'Center', angle: 0, disabled: true },
                          { direction: 'To right', angle: 90 },

                          { direction: 'To bottom left', angle: 225 },
                          { direction: 'To bottom', angle: 180 },
                          { direction: 'To bottom right', angle: 135 },
                        ].map(({ direction, angle, disabled }, i) => {
                          return (
                            <Button
                              key={i}
                              size="small"
                              title={direction}
                              onClick={() => saveSettings({ backgroundAngle: `${angle}deg` })}
                              className={cn('border border-gray-200 rounded-lg size-4', disabled ? 'opacity-0 cursor-auto' : '')}
                              disabled={disabled}
                            >
                              <ArrowRightOutlined
                                style={{
                                  transform: `rotate(${angle - 90}deg)`,
                                  fontSize: '10px',
                                }}
                              />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label>Background Pattern</label>
                    <Select
                      className="w-full"
                      value={settings.bgPattern}
                      placeholder="Pattern"
                      options={bgPatterns}
                      showSearch={false}
                      onInputKeyDown={(e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                          e.preventDefault();

                          const currentIndex = bgPatterns.findIndex((o) => o.value === settings.bgPattern);

                          const nextIndex = e.key === 'ArrowDown' ? Math.min(currentIndex + 1, bgPatterns.length - 1) : Math.max(currentIndex - 1, 0);

                          saveSettings({
                            bgPattern: bgPatterns[nextIndex].value,
                          });
                        }
                      }}
                      onChange={(bgPattern) => {
                        saveSettings({ bgPattern });
                      }}
                    />
                  </div>
                </Space>
              </Card>
              <Card title="Screenshot Options" size="small">
                <Space orientation="vertical" className="w-full" size="middle">
                  <div>
                    <label>Browser Bar</label>
                    <Select
                      className="w-full"
                      value={settings.browserBar}
                      placeholder="Browser Bar"
                      options={[
                        { value: 'hidden', label: 'None' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                      ]}
                      onChange={(browserBar) => {
                        saveSettings({ browserBar });
                      }}
                    />
                  </div>
                  <div>
                    <label>Scale</label>
                    <Select
                      className="w-full"
                      value={settings.scale}
                      placeholder="Scale"
                      options={[
                        { value: 'scale-0', label: '0' },
                        { value: 'scale-50', label: '0.5' },
                        { value: 'scale-75', label: '0.75' },
                        { value: 'scale-90', label: '0.9' },
                        { value: 'scale-95', label: '0.95' },
                        { value: 'scale-100', label: '1' },
                        { value: 'scale-105', label: '1.05' },
                        { value: 'scale-110', label: '1.1' },
                        { value: 'scale-125', label: '1.25' },
                        { value: 'scale-150', label: '1.5' },
                        { value: 'scale-200', label: '2' },
                      ]}
                      onChange={(scale) => {
                        saveSettings({ scale });
                      }}
                    />
                  </div>

                  <div>
                    <label>Spacing</label>
                    <Select
                      className="w-full"
                      value={settings.padding}
                      placeholder="Spacing"
                      options={[
                        { value: 'p-0', label: 'None' },
                        { value: 'p-10', label: 'Small' },
                        { value: 'p-20', label: 'Medium' },
                        { value: 'p-32', label: 'Large' },
                      ]}
                      onChange={(padding) => {
                        saveSettings({ padding });
                      }}
                    />
                  </div>

                  <div>
                    <label>Rounded</label>
                    <Select
                      className="w-full"
                      value={settings.rounded}
                      placeholder="Rounded"
                      options={[
                        { value: 'rounded-none', label: 'None' },
                        { value: 'rounded-lg', label: 'Small' },
                        { value: 'rounded-xl', label: 'Medium' },
                        { value: 'rounded-3xl', label: 'Large' },
                      ]}
                      onChange={(rounded) => {
                        saveSettings({ rounded });
                      }}
                    />
                  </div>

                  <div>
                    <label>Shadow</label>
                    <Select
                      className="w-full"
                      value={settings.shadow}
                      placeholder="Shadow"
                      options={[
                        { value: 'shadow-none', label: 'None' },
                        { value: 'shadow-lg', label: 'Small' },
                        { value: 'shadow-xl', label: 'Medium' },
                        { value: 'shadow-2xl', label: 'Large' },
                      ]}
                      onChange={(shadow) => {
                        saveSettings({ shadow });
                      }}
                    />
                  </div>
                  <div className="flex w-full border border-gray-300 rounded-md p-2">
                    <div className="w-full flex items-center gap-2 pr-3 justify-between">
                      <label>Position</label>
                      <div className="buttons-list relative grid w-12 h-12 grid-cols-3 p-1 bg-white border border-gray-200 rounded-lg dark:border-gray-700 place-content-around place-items-center aspect-square dark:bg-gray-900 shadow hover:scale-[1.4] duration-300 ease-[cubic-bezier(.75,-0.5,0,1.75)]">
                        {[
                          { value: 'place-items-start', label: 'Top left' },
                          { value: 'place-items-start justify-items-center', label: 'Top center' },
                          { value: 'place-items-start justify-items-end', label: 'Top right' },

                          { value: 'place-items-center justify-items-start', label: 'Center left' },
                          { value: 'place-items-center', label: 'Center' },
                          { value: 'place-items-center justify-items-end', label: 'Center right' },

                          { value: 'place-items-end justify-items-start', label: 'Bottom left' },
                          { value: 'place-items-end justify-items-center', label: 'Bottom center' },
                          { value: 'place-items-end', label: 'Bottom right' },
                        ].map((item, i) => {
                          return (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full cursor-pointer bg-gray-300 hover:bg-gray-500 dark:hover:bg-gray-400 dark:bg-gray-600/50"
                              onClick={() => {
                                saveSettings({ position: item.value });
                              }}
                            ></span>
                          );
                        })}
                      </div>
                    </div>
                    <Divider orientation="vertical" className="h-auto" />
                    <div className="w-full flex items-center gap-2 pl-3 justify-between">
                      <label>Noise</label>
                      <Switch
                        checked={settings.noise}
                        onChange={(noise) => {
                          saveSettings({ noise });
                        }}
                      />
                    </div>
                  </div>
                </Space>
              </Card>
              <Card title="Export" size="small">
                <Space orientation="vertical" className="w-full" size="middle">
                  <div className="flex gap-2">
                    <Button type="primary" icon={<CopyOutlined />} onClick={copyImage} className="flex-1" title="Use Ctrl/Cmd + C to copy the image">
                      Copy
                    </Button>

                    <Button type="default" icon={<DownloadOutlined />} onClick={saveImage} className="flex-1">
                      Save
                    </Button>
                  </div>
                </Space>
              </Card>

              <div className="hidden mx-auto text-sm text-center opacity-50 dark:text-white lg:block">
                <div className="mb-1">
                  Use <span className="px-2 py-px font-mono rounded-lg dark:bg-black/40 bg-white/80">Cmd/Ctrl+C</span> to copy or
                </div>
                <div>
                  <span className="px-2 py-px font-mono rounded-lg bg-white/80 dark:bg-black/40">Cmd/Ctrl+S</span> to save output image
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
