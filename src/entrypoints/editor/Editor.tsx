import { useAntd } from '@/providers/ThemeProvider';
import { Button, Divider, Layout, Popconfirm, Select, Tooltip } from 'antd';
import { toBlob, toPng } from 'html-to-image';

import { CopyIcon, CropIcon, PasteIcon, ResetIcon, SaveIcon } from '@/icons';
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

      const dataUrl = await toPng(wrapperRef.current, {
        pixelRatio: getScaleFector(settings.resolution),
        width: width,
        height: height,
      });

      await sendMessage(GENERAL_MESSAGES.DOWNLOAD, { dataUrl, filename: validFilename(`${settings.resolution}`, 'png') });

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

  const onPaste = async (event: React.ClipboardEvent | React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
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
    <>
      <Layout
        className="flex flex-row-reverse gap-4"
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
        <Sider trigger={null} width={300} className="shadow bg-white overflow-auto h-screen sticky top-0 dark:bg-neutral-900 overflow-x-hidden">
          <Watermark className="scale-130 text-2xl pt-6 pb-2 mb-4 flex-center gap-2 sticky top-0 z-50 bg-white dark:bg-neutral-900" />
          <Sidebar onReset={resetSettings} />
        </Sider>
        {/* Sidebar End  */}

        <Layout className="flex gap-4 mt-4 ml-4">
          <Content className="preview-area shadow bg-white p-4 rounded-md dark:bg-neutral-900 flex-center">
            {blob?.src ? (
              <div
                ref={(el) => {
                  wrapperRef.current = el;
                }}
                className={cn('relative flex-center overflow-hidden p-0', settings.roundedWrapper)}
                style={{
                  background: getGradientBackground(settings),
                }}
              >
                <PatternBox
                  className={cn('w-full h-full absolute', settings.patternBlendMode)}
                  name={cn(settings.bgPattern)}
                  noise={settings.noise}
                  style={{
                    opacity: settings.bgOpacity,
                  }}
                />
                <div
                  className={cn(
                    'relative grid grid-rows-1 grid-cols-1',
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
                    className={cn(settings.shadow, settings.aspectRatio === 'aspect-21/9' ? 'h-full' : 'h-auto', settings.imageOrigin)}
                    style={{
                      scale: settings.scale,
                    }}
                  >
                    <img
                      src={blob?.src as any}
                      alt=""
                      className={cn('w-full h-full object-contain')}
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
                <div className="absolute bottom-6 w-full flex justify-center items-center">
                  <Watermark className="pl-1 pr-2 py-2" glass />
                </div>
              </div>
            ) : (
              <NoImage onPaste={onPaste} />
            )}
          </Content>
          <Footer className="shadow sticky bottom-0 w-full bg-white dark:bg-neutral-900 p-2 rounded-md mr-4 flex-center gap-3 mb-4 flex-wrap">
            <FieldSet label={i18n.t('format')} orientation="horizontal" className="h-10 pr-1">
              <Select
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
              <Select
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

            <Button onClick={handleImageSave} loading={options.saving}>
              <IconLabel icon={<SaveIcon />} label={i18n.t('exportImage')} />
            </Button>

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
      <label className="flex-center flex-col select-none max-w-[550px] rounded-md p-10 text-center hover:opacity-50" htmlFor="imagesUpload">
        <input
          className="hidden"
          id="imagesUpload"
          type="file"
          accept="image/*"
          onChange={(e) => {
            onPaste(e);
          }}
        />
        <PasteIcon className="size-12 mb-2" />
        <p>Paste your screenshot(Cmd/Ctrl+V)</p>
        <p>or drag and drop your screenshot here</p>
        <p>or click here to add one</p>
      </label>
    </div>
  );
};
