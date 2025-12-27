import { useAntd } from '@/providers/ThemeProvider';
import { ArrowLeftIcon, Bars3Icon, ChatBubbleLeftIcon, KeyIcon, StarIcon } from '@heroicons/react/24/outline';
import { Button, Dropdown, Typography } from 'antd';
import React from 'react';
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
  const { message } = useAntd();
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = ![ROUTES.LOGIN, ROUTES.HOME].includes(location.pathname);
  const { Title, Text } = Typography;

  const items = [
    {
      key: 'activation',
      label: settings?.isLicensed ? 'Activated' : 'Activate',
      icon: settings?.isLicensed ? <StarIcon className="size-4" /> : <KeyIcon className="size-4" />,
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
        message.success('Mail Sent!');
      },
      icon: <ChatBubbleLeftIcon className="size-4" />,
    },
  ];

  return (
    <>
      <header className={'bg-app-300 z-51 -mt-0.5 flex w-full items-center border-b border-app-300 dark:border-black/90 px-2 py-3 dark:bg-zinc-900'}>
        <Watermark className="text-2xl w-full" />
        <div className="flex items-center justify-center gap-1">
          {showBackButton && <Button type="primary" onClick={() => navigate(-1)} icon={<ArrowLeftIcon className="size-4" />} />}
          <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
            <Button icon={<Bars3Icon className="size-5 text-white" />} type="text" />
          </Dropdown>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const { Text } = Typography;
  return (
    <>
      <div className="mb-0.5 flex items-center justify-start gap-2">
        <Text title="Version" keyboard>
          v{browser.runtime.getManifest().version}
        </Text>
      </div>
    </>
  );
}
