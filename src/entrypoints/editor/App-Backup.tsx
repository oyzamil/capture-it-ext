import { BG_PATTERNS } from '@/components/PatternBox';
import { useAntd } from '@/providers/ThemeProvider';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, ColorPicker, Divider, Popconfirm, Row, Select, Space, Switch, Typography } from 'antd';
import { toBlob, toPng } from 'html-to-image';

import React, { Activity } from 'react';
import { copyImageToClipboard } from '../content/utils';
import { getGradientBackground } from './utils';

const { Title } = Typography;

type BlobState = {
  src: string | null;
  w: number;
  h: number;
};

const ThumbnailGenerator: React.FC = () => {
  const { message } = useAntd();
  const { settings, saveSettings, resetSettings } = useSettings();
  const wrapperRef = useRef<HTMLElement | null>(null);
  const [blob, setBlob] = useState<BlobState>({ src: null, w: 0, h: 0 });

  const showToast = (type: 'loading' | 'success' | 'error' | 'info', content: string, duration: number = 0, key = 'PRIMARY_TOAST') => {
    message.open({
      key,
      type,
      content,
      duration,
    });
  };

  const handleImageSave = async () => {
    if (!wrapperRef.current || !blob.src) {
      showToast('error', t('copyMessages.empty'), 2);
      return;
    }

    try {
      showToast('loading', t('exportMessages.progress'));

      const width = wrapperRef.current.offsetWidth;
      const height = wrapperRef.current.offsetHeight;

      const dataUrl = await toPng(wrapperRef.current, {
        pixelRatio: getResolution(settings.quality),
        width: width,
        height: height,
      });

      await sendMessage(EXT_MESSAGES.DOWNLOAD, { dataUrl, filename: validFilename(`${settings.quality}`, 'png') });

      showToast('success', t('exportMessages.success'), 2);
    } catch (err) {
      console.error('Error Exporting Image:', err);
      showToast('error', t('exportMessages.error'), 2);
    }
  };

  const handleCopyImage = async () => {
    if (!wrapperRef.current || !blob.src) {
      showToast('error', t('copyMessages.empty'), 2);
      return;
    }
    try {
      showToast('loading', t('copyMessages.progress'));
      const blob = await toBlob(wrapperRef.current, {
        pixelRatio: getResolution(settings.quality),
      });

      if (!blob) {
        showToast('error', t('unknownError'), 2);
        console.error('Failed to generate image blob');
        return;
      }
      await copyImageToClipboard(blob);

      showToast('success', t('copyMessages.success'), 2);
    } catch (error) {
      console.error('Error copying image:', error);
      showToast('error', t('copyMessages.error'), 2);
    }
  };

  const onPaste = (event: React.ClipboardEvent | React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    let files: File[] = [];

    if ('clipboardData' in event && event.clipboardData) {
      files = Array.from(event.clipboardData.items)
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter(Boolean) as File[];
    } else if ('dataTransfer' in event && event.dataTransfer) {
      files = Array.from(event.dataTransfer.files);
    } else if (event.target instanceof HTMLInputElement && event.target.files) {
      files = Array.from(event.target.files);
    }

    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const objectUrl = URL.createObjectURL(file);

      setBlob((prev) => {
        if (typeof prev.src === 'string' && prev.src.startsWith('blob:') && prev.src !== objectUrl) {
          URL.revokeObjectURL(prev.src);
        }

        return { ...prev, src: objectUrl };
      });
    });
  };

  const handleShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCopyImage();
      }

      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleImageSave();
      }
    },
    [handleCopyImage, handleImageSave]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleShortcuts);
    return () => document.removeEventListener('keydown', handleShortcuts);
  }, [handleShortcuts]);

  useEffect(() => {
    if (settings.base64Image) {
      setBlob((prev) => (prev.src === settings.base64Image ? prev : { ...prev, src: settings.base64Image }));
    }
  }, [settings.base64Image]);

  useEffect(() => {
    return () => {
      setBlob((prev) => {
        if (typeof prev.src === 'string' && prev.src.startsWith('blob:')) {
          URL.revokeObjectURL(prev.src);
        }
        return prev;
      });
    };
  }, [blob.src]);

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
          <Watermark className="text-2xl" />
        </Title>

        <Row gutter={[30, 12]} className="justify-center">
          {/* Sticky Preview Panel */}
          <Col xs={12}>
            <div className="sticky top-4">
              <Card
                title="Preview"
                classNames={{
                  body: '',
                }}
                extra={
                  <Popconfirm
                    title="Confirm"
                    description="Are you sure to reset the canvas?"
                    onConfirm={() => {
                      saveSettings({ base64Image: null });
                      setBlob({ src: null, w: 0, h: 0 });
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger>
                      <span className="size-4">{ResetIcon}</span>
                      Reset Canvas
                    </Button>
                  </Popconfirm>
                }
              >
                {blob?.src ? (
                  <div
                    ref={(el) => {
                      wrapperRef.current = el;
                    }}
                    className="preview-area relative w-full h-full overflow-hidden flex justify-center"
                  >
                    <div
                      className={cn('overflow-hidden relative grid max-h-screen', settings.aspectRatio, settings.roundedWrapper, settings.padding, settings.position)}
                      style={{
                        background: getGradientBackground(settings),
                        boxSizing: 'border-box',
                      }}
                    >
                      <PatternBox className="w-full h-full absolute mix-blend-soft-light inset-0" name={cn(settings.bgPattern)} />
                      <Activity mode={settings.noise ? 'visible' : 'hidden'}>
                        <div
                          style={{ backgroundImage: `url("/noise.svg")` }}
                          className={`absolute inset-0 w-full h-full bg-repeat opacity-80 ${settings.rounded} ${settings.windowBar !== 'none' ? 'rounded-t-none' : ''}`}
                        />
                      </Activity>
                      <StackEffect className={settings.rounded} rootClassName={cn('grid', settings.scale)} shade={settings.windowBar === 'sinmple-dark' ? '#000000' : '#ffffff'}>
                        <div className={cn('relative overflow-hidden', settings.rounded, settings.shadow)}>
                          {/* Browser Bar  */}
                          <Activity mode={settings.windowBar === 'none' ? 'hidden' : 'visible'}>
                            <div
                              className={cn(settings.rounded, 'flex items-center w-full px-4 py-2.5 rounded-b-none z-10', settings.windowBar === 'simple-light' ? 'bg-white' : 'bg-black')}
                              // style={imageStyle}
                            >
                              <div className="flex items-center space-x-2">
                                {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                                  <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
                                ))}
                              </div>
                            </div>
                          </Activity>

                          <img
                            src={blob?.src as any}
                            alt=""
                            className={cn('relative w-full', settings.rounded, settings.windowBar === 'none' ? '' : 'rounded-t-none')}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              setBlob({
                                ...blob,
                                w: target.naturalWidth,
                                h: target.naturalHeight,
                              });
                            }}
                          />

                          {/* <div
                            aria-label="Generated Image"
                            style={{
                              // ...imageStyle,
                              backgroundImage: `url(${blob?.src})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                              backgroundSize: 'contain',
                              // aspectRatio: `${blob?.w} / ${blob?.h}`,
                            }}
                            className={cn('relative w-full', settings.rounded, settings.aspectRatio, settings.windowBar === 'hidden' ? '' : 'rounded-t-none')}
                          >
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
                          </div> */}
                        </div>
                        {/* {[0.7, 0.8, 0.9].reverse().map((opacity, i) => (
                          <div
                            key={i}
                            className={cn(settings.rounded, 'stack-item ')}
                            style={{
                              backgroundColor: settings.windowBar === 'dark' ? hexToRgba('#000000', opacity) : hexToRgba('#ffffff', opacity),
                            }}
                          ></div>
                        ))} */}
                      </StackEffect>
                    </div>
                    <div className="absolute bottom-0 w-full flex justify-center items-center">
                      <Watermark className="pl-1 pr-2 py-2 mb-2 rounded bg-white" />
                    </div>
                  </div>
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
                  <Popconfirm title="Confirm" description="Are you sure to reset the settings?" onConfirm={resetSettings} okText="Yes" cancelText="No">
                    <Button type="text" danger>
                      <span className="size-4">{ResetIcon}</span>
                      Reset Settings
                    </Button>
                  </Popconfirm>
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
                        size="large"
                        className="hover-scale flex"
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
                      <div className="hover-scale">
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
                              className={cn('p-0 rounded-lg size-3', settings.backgroundAngle === `${angle}deg` ? 'bg-black text-white border-black' : '', disabled ? 'opacity-0 cursor-auto' : '')}
                              disabled={disabled}
                            >
                              <svg
                                style={{
                                  transform: `rotate(${angle - 90}deg)`,
                                  fontSize: '10px',
                                }}
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className=""
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M9 6c0 -.852 .986 -1.297 1.623 -.783l.084 .076l6 6a1 1 0 0 1 .083 1.32l-.083 .094l-6 6l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002l-.059 -.002l-.058 -.005l-.06 -.009l-.052 -.01l-.108 -.032l-.067 -.027l-.132 -.07l-.09 -.065l-.081 -.073l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057l-.002 -12.059z" />
                              </svg>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label>Gradient Type</label>
                    <Select
                      className="w-full"
                      value={settings.gradientType}
                      placeholder="Gradient Type"
                      options={[
                        { value: 'linear', label: 'Linear' },
                        { value: 'radial', label: 'Radial' },
                        { value: 'conic', label: 'Conic' },
                      ]}
                      onChange={(gradientType) => {
                        saveSettings({ gradientType });
                      }}
                    />
                  </div>

                  <div>
                    <label>Background Pattern</label>
                    <Select
                      className="w-full"
                      value={settings.bgPattern}
                      placeholder="Pattern"
                      options={BG_PATTERNS}
                      // showSearch={true}
                      onInputKeyDown={(e) => {
                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                          e.preventDefault();

                          const currentIndex = BG_PATTERNS.findIndex((o) => o.value === settings.bgPattern);

                          const nextIndex = e.key === 'ArrowDown' ? Math.min(currentIndex + 1, BG_PATTERNS.length - 1) : Math.max(currentIndex - 1, 0);

                          saveSettings({
                            bgPattern: BG_PATTERNS[nextIndex].value,
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
                      value={settings.windowBar}
                      placeholder="Browser Bar"
                      options={[
                        { value: 'hidden', label: 'None' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                      ]}
                      onChange={(windowBar) => {
                        saveSettings({ windowBar });
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
                      <div className="hover-scale">
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
                              title={item.label}
                              className={cn('w-2 h-2 rounded-full cursor-pointer bg-gray-300', settings.position === item.value ? 'bg-black' : 'hover:bg-gray-500')}
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
                  <div className="flex w-full border border-gray-300 rounded-md p-2">
                    <div className="w-full flex items-center gap-2 pr-3 justify-between">
                      <label>Format</label>
                      <Select
                        className="w-full"
                        value={settings.fileFormat}
                        placeholder="Shadow"
                        options={[
                          { value: 'png', label: 'PNG' },
                          { value: 'jpeg', label: 'JPEG' },
                        ]}
                        onChange={(fileFormat) => {
                          saveSettings({ fileFormat });
                        }}
                      />
                    </div>
                    <Divider orientation="vertical" className="h-auto" />
                    <div className="w-full flex items-center gap-2 pl-3 justify-between">
                      <label>4K</label>
                      <Switch
                        checked={settings.quality === '4k'}
                        onChange={(checked) => {
                          saveSettings({ quality: checked ? '4k' : 'normal' });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="primary" icon={<CopyOutlined />} onClick={handleCopyImage} className="flex-1" title="Use Ctrl/Cmd + C to copy the image">
                      Copy
                    </Button>

                    <Button type="default" icon={<DownloadOutlined />} onClick={handleImageSave} className="flex-1">
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
