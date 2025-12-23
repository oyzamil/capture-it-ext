import { SETTINGS_TYPE } from '@/app.config';
import { useAntd } from '@/providers/ThemeProvider';
import { Button, Form, Segmented } from 'antd';
import { debounce } from 'lodash';

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

  const handleCapture = (captureType: EXT_MESSAGES_TYPE): void => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs: Browser.tabs.Tab[]) => {
      const activeTab = tabs[0];

      if (!activeTab || !activeTab.url || activeTab.id === undefined) {
        return;
      }

      const currentUrl: string = activeTab.url;

      const isInternalPage: boolean = currentUrl.startsWith('chrome://') || currentUrl.includes('chromewebstore');

      if (isInternalPage) {
        browser.runtime.sendMessage({
          action: EXT_MESSAGES.INTERNAL_PAGE,
        });
      } else {
        browser.tabs.sendMessage(activeTab.id, {
          action: captureType,
        });
        window.close();
      }
    });
  };

  return (
    <div className="p-3!">
      <Form
        form={form}
        initialValues={settings}
        onValuesChange={(_, allValues) => {
          debouncedSubmit(allValues);
        }}
        layout="inline"
        labelCol={{ flex: '125px' }}
      >
        <Form.Item label="Theme" name="theme">
          <Segmented
            onChange={(value) => {
              form.setFieldValue('theme', value);
            }}
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'System', value: 'system' },
            ]}
          />
        </Form.Item>
      </Form>
      <div className="flex flex-col gap-2">
        {/* Capture Div */}
        <Button
          type="primary"
          onClick={() => {
            handleCapture(EXT_MESSAGES.CAPTURE_DIV);
          }}
        >
          Capture Element
        </Button>

        <Button
          type="primary"
          onClick={() => {
            handleCapture(EXT_MESSAGES.CAPTURE_VISIBLE);
          }}
        >
          Capture Visible
        </Button>

        {/* Custom Capture */}
        <Button
          type="primary"
          onClick={() => {
            handleCapture(EXT_MESSAGES.CAPTURE_CUSTOM);
          }}
        >
          Custom Capture
        </Button>
      </div>
      {/* <div className={cn('flex-center flex-col gap-4')}>
        <Text className="glass block text-center">
          This is a starter template for building{' '}
          <Button
            type="text"
            className="underline"
            onClick={() => {
              sendMessage('OPEN_BUILDER', {});
            }}
          >
            Chrome extensions
          </Button>
          with React, TypeScript, Tailwind CSS, and Ant Design. You can customize it to fit your needs.
        </Text>
      </div> */}
    </div>
  );
}

export default Home;
