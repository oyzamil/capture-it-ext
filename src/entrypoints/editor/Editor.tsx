import { useAntd } from '@/providers/ThemeProvider';
import { Button, Divider, Layout, Popconfirm, Select, Switch, Typography } from 'antd';
import { toBlob, toPng } from 'html-to-image';

import WindowBar from '@/components/WindowBar';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { Activity } from 'react';
import { copyImageToClipboard } from '../content/utils';
import Sidebar from './components/Sidebar';
import { getGradientBackground } from './utils';

const { Title, Text } = Typography;
const { Sider, Header, Content, Footer } = Layout;

type BlobState = {
  src: string | null;
  w: number;
  h: number;
};

const Editor: React.FC = () => {
  const { message } = useAntd();
  const { settings, saveSettings, resetSettings } = useSettings();
  const wrapperRef = useRef<HTMLElement | null>(null);
  const [blob, setBlob] = useState<BlobState>({ src: null, w: 0, h: 0 });
  const [options, setOptions] = useStateUpdater({});

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
    <Layout className="flex gap-4">
      <Sider trigger={null} width={350} className="bg-white overflow-auto h-screen sticky top-0 scrollbar:hidden">
        <Watermark className="text-2xl p-2 flex-center gap-2 sticky top-0 z-50 bg-white" />
        <Sidebar className="p-3" onReset={resetSettings} />
      </Sider>
      <Layout className="flex gap-4 mt-4 mr-4 max-h-screen">
        <Content className="preview-area bg-white p-4 rounded-md flex justify-center">
          {blob?.src ? (
            <div
              ref={(el) => {
                wrapperRef.current = el;
              }}
              className="relative overflow-hidden flex justify-center"
            >
              <div
                className={cn('overflow-hidden relative grid', settings.roundedWrapper, settings.padding, settings.position, settings.aspectRatio)}
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
                <WindowBar name={settings.windowBar} rounded={settings.rounded} className={cn(settings.shadow, settings.scale, settings.windowBar === 'none' && `${settings.rounded} overflow-hidden`)}>
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
                </WindowBar>
                <div className="absolute bottom-0 w-full flex justify-center items-center">
                  <Watermark className="pl-1 pr-2 py-2 mb-2 rounded bg-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-white h-full w-full">
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
                <span className="w-6 h-6 mb-2">{PasteIcon}</span>
                <p>Paste your screenshot(Cmd/Ctrl+V)</p>
                <p>or drag and drop your screenshot here</p>
                <p>or click here to add one</p>
              </label>
            </div>
          )}
        </Content>
        <Footer className="sticky bottom-0 w-full bg-white p-4 rounded-md mb-4 mr-4">
          <div className="flex-center gap-3 mb-3">
            <FieldSet label="Format" orientation="horizontal" className="h-[50px]">
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
            <FieldSet label="4K" orientation="horizontal" className="h-[50px]">
              <Switch
                checked={settings.quality === '4k'}
                onChange={(checked) => {
                  saveSettings({ quality: checked ? '4k' : 'normal' });
                }}
              />
            </FieldSet>
            <Divider vertical />
            <Button type="primary" size="large" icon={<CopyOutlined />} onClick={handleCopyImage}>
              Copy Image
            </Button>

            <Button type="default" size="large" icon={<DownloadOutlined />} onClick={handleImageSave}>
              Save Image
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
                <span className="size-4">{ResetIcon}</span>
                Reset
              </Button>
            </Popconfirm>
          </div>
          <Text className="block opacity-50 text-center">
            Use <Text keyboard>⌘/Ctrl+C</Text> to copy or <Text keyboard>⌘/Ctrl+S</Text> to save image
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Editor;
