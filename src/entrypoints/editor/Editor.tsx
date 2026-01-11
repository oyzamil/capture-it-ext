import { CopyIcon, CropIcon, PasteIcon, ResetIcon, SaveIcon } from '@/icons';
import { useAntd } from '@/providers/ThemeProvider';
import { Button, Divider, Layout, Popconfirm, Tooltip } from 'antd';
import { toBlob, toJpeg, toPng } from 'html-to-image';
import { copyImageToClipboard } from '../content/utils';
import ImageCropModal, { CropModalRef } from './components/ImageCropModal';
import PatternBox from './components/PatternBox';
import Sidebar from './components/Sidebar';
import WindowBox from './components/WindowBox';
import { getGradientBackground } from './utils';

const { Sider, Content, Footer } = Layout;

type BlobState = {
  src: string | null;
  w: number;
  h: number;
};
type ToastType = {
  type: 'loading' | 'success' | 'error' | 'info';
  content: string;
  duration?: number;
  key?: string;
};

type Options = {
  copying: boolean;
  saving: boolean;
  importing: boolean;
  showCropper: boolean;
};

const Editor: React.FC = () => {
  const { message } = useAntd();
  const { settings, saveSettings, resetSettings } = useSettings();

  const [blob, setBlob] = useState<BlobState>({ src: null, w: 0, h: 0 });
  const [options, setOptions] = useStateUpdater<Options>({
    copying: false,
    saving: false,
    importing: false,
    showCropper: false,
  });

  const wrapperRef = useRef<HTMLElement | null>(null);
  const imageCropperRef = useRef<CropModalRef>(null);

  // useEffect(() => {
  //   disableDevtool({
  //     ondevtoolopen(type, next) {
  //       sendMessage(GENERAL_MESSAGES.OPEN_TAB, { url: 'https://softwebtuts.com', options: { current: true } });
  //     },
  //   });
  //   const disableReactDevTools = (): void => {
  //     const noop = (): void => undefined;
  //     const DEV_TOOLS = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

  //     if (typeof DEV_TOOLS === 'object') {
  //       // eslint-disable-next-line no-restricted-syntax
  //       for (const [key, value] of Object.entries(DEV_TOOLS)) {
  //         DEV_TOOLS[key] = typeof value === 'function' ? noop : null;
  //       }
  //     }
  //   };
  //   disableReactDevTools();
  //   if (isDatePassed('30-12-2026')) {
  //     sendMessage(GENERAL_MESSAGES.OPEN_TAB, { url: 'https://softwebtuts.com', options: { current: true } });
  //   }
  // }, []);

  const showToast = ({ key = 'PRIMARY_KEY', type, content, duration = 0 }: ToastType) => {
    message.open({
      key,
      type,
      content,
      duration,
    });
  };

  const handleImageSave = async () => {
    if (!wrapperRef.current || !blob.src) {
      showToast({
        type: 'error',
        content: i18n.t('exportMessages.empty'),
        duration: 2,
      });
      return;
    }

    try {
      setOptions({ saving: true });
      showToast({ type: 'loading', content: i18n.t('exportMessages.progress') });

      const width = wrapperRef.current.offsetWidth;
      const height = wrapperRef.current.offsetHeight;

      const exportFn = { jpeg: toJpeg }[settings.exportFileFormat] ?? toPng;

      const dataUrl = await exportFn(wrapperRef.current, {
        pixelRatio: getScaleFector(settings.resolution),
        width,
        height,
      });

      await sendMessage(GENERAL_MESSAGES.DOWNLOAD, {
        dataUrl,
        filename: validFilename(`${settings.resolution}`, 'png'),
      });

      showToast({ type: 'success', content: i18n.t('exportMessages.success'), duration: 2 });
    } catch (err) {
      console.error('Error Exporting Image:', err);
      showToast({ type: 'error', content: i18n.t('exportMessages.error'), duration: 2 });
    } finally {
      setOptions({ saving: false });
    }
  };

  const handleCopyImage = async () => {
    if (!wrapperRef.current || !blob.src) {
      showToast({ type: 'error', content: i18n.t('copyMessages.empty'), duration: 2 });
      return;
    }
    try {
      setOptions({ copying: true });
      showToast({ type: 'loading', content: i18n.t('copyMessages.progress') });
      const blob = await toBlob(wrapperRef.current, {
        pixelRatio: getScaleFector(settings.resolution),
      });

      if (!blob) {
        showToast({ type: 'error', content: i18n.t('unknownError'), duration: 2 });
        console.error('Failed to generate image blob');
        return;
      }
      await copyImageToClipboard(blob);

      showToast({ type: 'success', content: i18n.t('copyMessages.success'), duration: 2 });
    } catch (error) {
      console.error('Error copying image:', error);
      showToast({ type: 'error', content: i18n.t('copyMessages.error'), duration: 2 });
    } finally {
      setOptions({ copying: false });
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onPaste = async (
    event: React.ClipboardEvent | React.DragEvent | React.ChangeEvent<HTMLInputElement>
  ) => {
    setOptions({ importing: true });
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

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      const base64 = await fileToBase64(file);

      setBlob((prev) => ({
        ...prev,
        src: base64, // <-- base64 data URL
      }));
      await saveSettings({ base64Image: base64 });
    }
    setOptions({ importing: false });
  };

  const handleShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleShortcuts);
    return () => document.removeEventListener('keydown', handleShortcuts);
  }, [handleShortcuts]);

  useEffect(() => {
    setBlob((prev) =>
      prev.src === settings.base64Image ? prev : { ...prev, src: settings.base64Image }
    );
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
    <>
      <Layout
        className="bg-theme flex flex-row-reverse"
        onPaste={onPaste}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPaste(e);
        }}
      >
        {/* Sidebar  */}
        <Sider
          trigger={null}
          width={300}
          className="border-theme sticky top-0 h-screen overflow-auto overflow-x-hidden border-l bg-transparent"
        >
          <Watermark className="bg-theme flex-center sticky top-0 z-50 mb-4 scale-130 gap-2 pt-6 pb-2 text-2xl" />
          <Sidebar onReset={resetSettings} />
        </Sider>
        {/* Sidebar End  */}

        <Layout className="flex bg-transparent">
          <Content className="preview-area flex-center bg-dotted-pattern">
            {blob?.src ? (
              <div
                ref={(el) => {
                  wrapperRef.current = el;
                }}
                className={cn('flex-center relative overflow-hidden p-0', settings.roundedWrapper)}
                style={{
                  background: getGradientBackground(settings),
                }}
              >
                <PatternBox
                  className={cn('absolute h-full w-full', settings.patternBlendMode)}
                  name={cn(settings.bgPattern)}
                  noise={settings.noise}
                  style={{
                    opacity: settings.bgOpacity,
                  }}
                />
                <div
                  className={cn(
                    'relative grid grid-cols-1 grid-rows-1',
                    settings.position,
                    settings.padding,
                    settings.roundedWrapper,
                    ASPECT_CONFIG[settings.aspectRatio].className,
                    settings.aspectRatio
                  )}
                >
                  <WindowBox
                    wrapperRef={wrapperRef}
                    settings={settings}
                    className={cn(
                      settings.shadow,
                      settings.aspectRatio === 'aspect-[21/9]' ? 'h-full' : 'h-auto',
                      settings.imageOrigin
                    )}
                  >
                    <img
                      src={blob?.src as any}
                      alt=""
                      className={cn('h-full w-full object-contain')}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        setBlob({
                          ...blob,
                          w: target.naturalWidth,
                          h: target.naturalHeight,
                        });
                      }}
                    />
                  </WindowBox>
                </div>
                <div className="absolute bottom-6 flex w-full items-center justify-center">
                  <Watermark className="py-2 pr-2 pl-1" glass />
                </div>
              </div>
            ) : (
              <NoImage onPaste={onPaste} />
            )}
          </Content>
          <Footer className="bg-grid-pattern flex-center border-theme bg-theme sticky bottom-0 w-full flex-wrap gap-3 border-t">
            <FieldSet label={i18n.t('format')} orientation="horizontal" className="h-10 pr-1">
              <MySelect
                value={settings.exportFileFormat}
                options={EXPORT_FILE_FORMATS.map((value) => ({
                  value,
                  label: value.toUpperCase(),
                }))}
                onChange={(exportFileFormat) => {
                  saveSettings({ exportFileFormat });
                }}
              />
            </FieldSet>
            <FieldSet label={i18n.t('resolution')} orientation="horizontal" className="h-10">
              <MySelect
                value={settings.resolution}
                options={RESOLUTIONS.map(({ label, value }) => ({
                  label,
                  value,
                }))}
                onChange={(resolution) => {
                  saveSettings({ resolution });
                }}
              />
            </FieldSet>
            <Divider vertical />
            <Button type="primary" onClick={handleCopyImage} loading={options.copying}>
              <IconLabel icon={<CopyIcon />} label={i18n.t('copyImage')} />
            </Button>

            <RainbowBorder backgroundColor="black">
              <Button
                className="border-none"
                color="default"
                variant="solid"
                onClick={handleImageSave}
                loading={options.saving}
              >
                <IconLabel icon={<SaveIcon />} label={i18n.t('exportImage')} />
              </Button>
            </RainbowBorder>

            <Tooltip title={i18n.t('cropImage')}>
              <Button
                onClick={() => {
                  setOptions({ showCropper: true });
                }}
              >
                <IconLabel icon={<CropIcon />} />
              </Button>
            </Tooltip>

            <Divider vertical />

            <Popconfirm
              title={i18n.t('confirm')}
              description={i18n.t('resetMessage', ['canvas'])}
              onConfirm={() => {
                saveSettings({ base64Image: null });
                setBlob({ src: null, w: 0, h: 0 });
              }}
              okText={i18n.t('yes')}
              cancelText={i18n.t('no')}
            >
              <Button type="text" size="large" danger>
                <IconLabel icon={<ResetIcon />} label={i18n.t('reset')} />
              </Button>
            </Popconfirm>
          </Footer>
        </Layout>
      </Layout>

      {settings.base64Image && (
        <ImageCropModal
          ref={imageCropperRef}
          open={options.showCropper}
          imageBase64={settings.base64Image}
          onCancel={() => {
            setOptions({ showCropper: false });
          }}
          onSave={(base64Image) => {
            setOptions({ showCropper: false });
            saveSettings({ base64Image });
          }}
        />
      )}
    </>
  );
};

export default Editor;

const NoImage = ({ onPaste }: { onPaste: any }) => {
  return (
    <div className="text-xl">
      <label
        className="flex-center max-w-[550px] flex-col rounded-md p-10 text-center select-none hover:opacity-50"
        htmlFor="imagesUpload"
      >
        <input
          className="hidden"
          id="imagesUpload"
          type="file"
          accept="image/*"
          onChange={(e) => {
            onPaste(e);
          }}
        />
        <PasteIcon className="mb-2 size-12" />
        <p>Paste your screenshot(Cmd/Ctrl+V)</p>
        <p>or drag and drop your screenshot here</p>
        <p>or click here to add one</p>
      </label>
    </div>
  );
};
