import { useAntd } from '@/providers/ThemeProvider';
import { Button, Divider, Layout, Popconfirm, Select, Switch } from 'antd';
import DisableDevtool from 'disable-devtool';
import { toBlob, toPng } from 'html-to-image';

import { CopyIcon, PasteIcon, ResetIcon, SaveIcon } from '@/icons';
import { Activity } from 'react';
import { copyImageToClipboard } from '../content/utils';
import Sidebar, { ASPECT_CONFIG } from './components/Sidebar';
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

const Editor: React.FC = () => {
  const { message } = useAntd();
  const { settings, saveSettings, resetSettings } = useSettings();
  const wrapperRef = useRef<HTMLElement | null>(null);
  const [blob, setBlob] = useState<BlobState>({ src: null, w: 0, h: 0 });

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      DisableDevtool({
        ondevtoolopen(type, next) {
          sendMessage(EXT_MESSAGES.OPEN_TAB, { url: 'https://softwebtuts.com', options: { current: true } });
        },
      });
      const disableReactDevTools = (): void => {
        const noop = (): void => undefined;
        const DEV_TOOLS = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

        if (typeof DEV_TOOLS === 'object') {
          // eslint-disable-next-line no-restricted-syntax
          for (const [key, value] of Object.entries(DEV_TOOLS)) {
            DEV_TOOLS[key] = typeof value === 'function' ? noop : null;
          }
        }
      };
      disableReactDevTools();
    }
    console.log(isDateNotPassed('10-10-2024'));
  }, []);

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
        content: i18n.t('copyMessages.empty'),
        duration: 2,
      });
      return;
    }

    try {
      showToast({ type: 'loading', content: i18n.t('exportMessages.progress') });

      const width = wrapperRef.current.offsetWidth;
      const height = wrapperRef.current.offsetHeight;

      const dataUrl = await toPng(wrapperRef.current, {
        pixelRatio: getResolution(settings.quality),
        width: width,
        height: height,
      });

      await sendMessage(EXT_MESSAGES.DOWNLOAD, { dataUrl, filename: validFilename(`${settings.quality}`, 'png') });

      showToast({ type: 'success', content: i18n.t('exportMessages.success'), duration: 2 });
    } catch (err) {
      console.error('Error Exporting Image:', err);
      showToast({ type: 'error', content: i18n.t('exportMessages.error'), duration: 2 });
    }
  };

  const handleCopyImage = async () => {
    if (!wrapperRef.current || !blob.src) {
      showToast({ type: 'error', content: i18n.t('copyMessages.empty'), duration: 2 });
      return;
    }
    try {
      showToast({ type: 'loading', content: i18n.t('copyMessages.progress') });
      const blob = await toBlob(wrapperRef.current, {
        pixelRatio: getResolution(settings.quality),
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
    <Layout className="flex flex-row-reverse gap-4">
      <Sider trigger={null} width={350} className="shadow bg-white overflow-auto h-screen sticky top-0 scrollbar:hidden dark:bg-neutral-900">
        <Watermark className="scale-150 text-2xl pt-6 pb-2 mb-4 flex-center gap-2 sticky top-0 z-50 bg-white dark:bg-neutral-900" />
        <Sidebar className="p-3" onReset={resetSettings} />
      </Sider>
      <Layout className="flex gap-4 mt-4 ml-4">
        <Content className="preview-area shadow bg-white p-4 rounded-md flex justify-center dark:bg-neutral-900">
          {blob?.src ? (
            <div
              ref={(el) => {
                wrapperRef.current = el;
              }}
              className={cn('relative flex justify-center items-center', settings.roundedWrapper)}
            >
              <div
                className={cn('overflow-hidden relative grid', settings.roundedWrapper, settings.padding, settings.position, settings.aspectRatio, ASPECT_CONFIG[settings.aspectRatio].className)}
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

                {/* Browser Bar  */}
                <WindowBox
                  name={settings.windowBar}
                  rounded={settings.rounded}
                  className={cn('flex flex-col max-h-full', settings.shadow, settings.scale, settings.windowBar === 'none' && `${settings.rounded} overflow-hidden`)}
                >
                  <img
                    src={blob?.src as any}
                    alt=""
                    className={cn('relative object-contain')}
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
                <div className="absolute bottom-6 w-full flex justify-center items-center">
                  <Watermark className="pl-1 pr-2 py-2" glass />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-white h-full w-full dark:bg-neutral-900">
              <label
                className="flex flex-col items-center justify-center text-md opacity-30 select-none max-w-[550px] rounded-md p-10 text-center cursor-pointer border-2 border-dashed border-gray-400 hover:opacity-50 duration-300"
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
                <span className="w-6 h-6 mb-2">
                  <PasteIcon />
                </span>
                <p>Paste your screenshot(Cmd/Ctrl+V)</p>
                <p>or drag and drop your screenshot here</p>
                <p>or click here to add one</p>
              </label>
            </div>
          )}
        </Content>
        <Footer className="shadow sticky bottom-0 w-full bg-white dark:bg-neutral-900 p-2 rounded-md mr-4 flex-center gap-3 mb-4 flex-wrap">
          <FieldSet label="Format" orientation="horizontal" className="h-10 pr-1">
            <Select
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
          </FieldSet>
          <FieldSet label="4K" orientation="horizontal" className="h-10">
            <Switch
              checked={settings.quality === '4k'}
              onChange={(checked) => {
                saveSettings({ quality: checked ? '4k' : 'normal' });
              }}
            />
          </FieldSet>
          <Divider vertical />
          <Button type="primary" onClick={handleCopyImage}>
            <IconLabel icon={<CopyIcon />} label="Copy Image" />
          </Button>

          <Button onClick={handleImageSave}>
            <IconLabel icon={<SaveIcon />} label="Save Image" />
          </Button>

          <Divider vertical />

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
            <Button type="text" size="large" danger>
              <IconLabel icon={<ResetIcon />} label="Reset Canvas" />
            </Button>
          </Popconfirm>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Editor;
