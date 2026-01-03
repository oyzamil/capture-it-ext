import { ArrowIcon, BarsIcon, ChatIcon, KeyIcon, StarIcon } from '@/icons';
import { Button, Dropdown, Space, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { ROUTES } = useAppConfig();

export default function Body({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-y-auto p-2 h-full">{children}</main>
      <Footer />
      <LicenseModal />
    </>
  );
}

export function Header() {
  const { settings, saveSettings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = ![ROUTES.LOGIN, ROUTES.HOME].includes(location.pathname);

  const items = [
    {
      key: 'activation',
      label: settings?.isLicensed ? 'Activated' : 'Activate',
      icon: settings?.isLicensed ? <StarIcon className="size-4 mr-2" /> : <KeyIcon className="size-4  mr-2" />,
      onClick: async () => {
        saveSettings({
          licenseModalVisible: true,
        });
      },
    },
    {
      key: 'support',
      label: 'Support',
      onClick: () => {
        sendMessage(GENERAL_MESSAGES.OPEN_TAB, { url: 'https://wa.me/923038088869' });
      },
      icon: <ChatIcon className="size-4 mr-2" />,
    },
  ];

  return (
    <>
      <header className={'bg-app-500 z-51 flex w-full items-center px-2 py-3 dark:bg-black'}>
        <Watermark className="text-2xl w-full" />
        <div className="flex items-center justify-center gap-1">
          <Space.Compact block>
            {showBackButton && (
              <Button title="Back" type="text" onClick={() => navigate(-1)} className="px-1">
                <ArrowIcon className="size-6 text-white rotate-270" />
              </Button>
            )}
            <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
              <Button type="text" className="px-1">
                <IconLabel icon={<BarsIcon className=" text-white size-5" />} />
              </Button>
            </Dropdown>
          </Space.Compact>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const { Text } = Typography;
  return (
    <Text title="Version" className="text-xs mb-1" keyboard>
      v{browser.runtime.getManifest().version}
    </Text>
  );
}
