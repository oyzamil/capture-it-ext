import { SETTINGS_TYPE } from '@/app.config';
import { useAntd } from '@/providers/ThemeProvider';
import { Button, Form, Segmented, Slider } from 'antd';
import { debounce } from 'lodash';

type CAPTURE_DIV = (typeof EXT_MESSAGES)['CAPTURE_DIV'];
type CAPTURE_VISIBLE = (typeof EXT_MESSAGES)['CAPTURE_VISIBLE'];
type CAPTURE_CUSTOM = (typeof EXT_MESSAGES)['CAPTURE_CUSTOM'];

function Home() {
  const { message } = useAntd();
  const { settings, saveSettings } = useSettings();
  const [form] = Form.useForm<SETTINGS_TYPE>();

  const debouncedSubmit = useRef(debounce(onSubmit, 500)).current;

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

  const handleCapture = async (CAPTURE_YTPE: CAPTURE_DIV | CAPTURE_VISIBLE | CAPTURE_CUSTOM): Promise<void> => {
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs: Browser.tabs.Tab[]) => {
      const activeTab = tabs[0];

      if (!activeTab || !activeTab.url || activeTab.id === undefined) {
        return;
      }

      const currentUrl: string = activeTab.url;

      const isInternalPage: boolean = currentUrl.startsWith('chrome://') || currentUrl.includes('chromewebstore');

      if (isInternalPage) {
        await sendMessage(EXT_MESSAGES.NOTIFY, { title: 'Internal Page', message: 'This page can not be captured!' });
      } else {
        await sendMessage(CAPTURE_YTPE, undefined, { tabId: activeTab.id });
        window.close();
      }
    });
  };

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
        <Form.Item label="Margin" name="captureMargin" className="w-full" tooltip={'Only effects in element select mode.'} labelCol={labelColumn}>
          <Slider
            min={0}
            max={50}
            onChangeComplete={(captureMargin) => {
              form.setFieldValue('captureMargin', captureMargin);
            }}
            className="w-full"
          />
        </Form.Item>

        <Form.Item name="buttons" layout="vertical" className="w-full">
          <div className="flex flex-col gap-2">
            <Button
              type="primary"
              onClick={() => {
                handleCapture(EXT_MESSAGES.CAPTURE_DIV);
              }}
              block
            >
              Capture Element
            </Button>

            <Button
              type="primary"
              block
              onClick={async () => {
                try {
                  const { screenshotUrl } = await sendMessage(EXT_MESSAGES.CAPTURE_VISIBLE);
                  await saveSettings({ base64Image: screenshotUrl });
                  await sendMessage(EXT_MESSAGES.SHOW_EDITOR);
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              Capture Visible
            </Button>

            {/* Custom Capture */}
            <Button
              type="primary"
              block
              onClick={() => {
                handleCapture(EXT_MESSAGES.CAPTURE_CUSTOM);
              }}
            >
              Custom Capture
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Home;
