import { SETTINGS_TYPE } from '@/app.config';
import { useAntd } from '@/providers/ThemeProvider';
import { CAPTURE_TYPE } from '@/utils/messaging';
import { Button, Divider, Form, Segmented, Slider, Space } from 'antd';

function Home() {
  const { message } = useAntd();
  const { settings, saveSettings } = useSettings();
  const [form] = Form.useForm<SETTINGS_TYPE>();
  const [notAllowed, setNotAllowed] = useState(true);

  const debouncedSubmit = useDebounce(onSubmit, 500);

  async function onSubmit(settings: SETTINGS_TYPE) {
    message.open({
      key: 'saving',
      type: 'loading',
      content: 'Saving...',
      duration: 0,
    });
    try {
      await saveSettings(settings);
      message.success({ key: 'saving', content: 'Settings saved' });
    } catch (error) {
      message.error({
        key: 'saving',
        content: 'Saving failed, please try again',
      });
    }
  }

  const handleCapture = async (CAPTURE_TYPE: CAPTURE_TYPE): Promise<void> => {
    try {
      const [activeTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Send message FIRST
      await sendMessage(CAPTURE_TYPE, undefined, {
        tabId: activeTab.id!,
      });

      // Close popup AFTER async finishes
      setTimeout(() => window.close(), 100);
    } catch (error) {
      console.error('Capture failed:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const [activeTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab.url || !activeTab.id) {
        console.warn('Invalid active tab');
        return;
      }

      const currentUrl = activeTab.url;

      const isInternalPage =
        currentUrl.startsWith('chrome://') || currentUrl.startsWith('chrome-extension://') || currentUrl.startsWith('edge://') || currentUrl.includes('chromewebstore') || currentUrl === 'about:blank';

      if (isInternalPage) {
        await sendMessage(GENERAL_MESSAGES.NOTIFY, {
          title: 'Internal Page',
          message: 'This page cannot be captured!',
        });
        return;
      } else {
        setNotAllowed(false);
      }
    })();
  }, []);

  const labelColumn = { flex: '80px' };
  return (
    <div className="p-3!">
      <Form
        form={form}
        initialValues={settings}
        onValuesChange={(_, allValues) => {
          debouncedSubmit(allValues);
        }}
        layout="inline"
      >
        <Form.Item label="Theme" name="theme" className="w-full" labelCol={labelColumn}>
          <Segmented
            onChange={(theme) => {
              form.setFieldValue('theme', theme);
            }}
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'System', value: 'system' },
            ]}
            block
          />
        </Form.Item>
        <Form.Item
          label="Margin"
          name="captureMargin"
          className="w-full"
          tooltip={'The spaceing that will be added to the selected element. Only effects in element select mode.'}
          labelCol={labelColumn}
        >
          <Slider
            min={0}
            max={50}
            onChangeComplete={(captureMargin) => {
              form.setFieldValue('captureMargin', captureMargin);
            }}
            className="w-full"
          />
        </Form.Item>

        <Form.Item layout="vertical" className="bg-white dark:bg-black dark:border-black w-full border border-gray-200 border-t-0 rounded-md mt-2 -mb-3">
          <Divider children={<span className="px-2 text-app-500 font-semibold dark:text-white">Capture</span>} className="-mt-3 mb-2" />
          <div className="p-2 space-y-2">
            <Space.Compact block>
              <Button
                type="primary"
                block
                onClick={() => {
                  handleCapture(CAPTURE_MESSAGES.CAPTURE_DIV);
                }}
                disabled={notAllowed}
              >
                Element
              </Button>

              {/* Custom Capture */}
              <Button
                type="primary"
                block
                onClick={() => {
                  handleCapture(CAPTURE_MESSAGES.CAPTURE_CUSTOM);
                }}
                disabled={notAllowed}
              >
                Custom
              </Button>
              <Button
                type="primary"
                block
                onClick={async () => {
                  try {
                    window.close();
                    await sendMessage(GENERAL_MESSAGES.CREATE_OFFSCREEN);
                  } catch (error) {
                    message.error('Unable to capture current tab!');
                    console.error(error);
                  }
                }}
              >
                Full Screen
              </Button>
            </Space.Compact>
            <Space.Compact block>
              <Button
                type="primary"
                block
                onClick={async () => {
                  try {
                    const { dataUrl } = await sendMessage(CAPTURE_MESSAGES.CAPTURE_TAB);
                    await saveSettings({ base64Image: dataUrl });
                    await sendMessage(GENERAL_MESSAGES.SHOW_EDITOR);
                  } catch (error) {
                    message.error('Unable to capture current tab!');
                    console.error(error);
                  }
                }}
              >
                Current Page
              </Button>
              <Button
                type="primary"
                block
                onClick={async () => {
                  const [activeTab] = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                  });
                  await sendMessage(CAPTURE_MESSAGES.CAPTURE_FULL_TAB, { format: 'png', scaleFactor: window.devicePixelRatio, tabId: activeTab.id });
                  window.close();
                }}
                disabled={notAllowed}
              >
                Full Page
              </Button>
            </Space.Compact>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Home;
