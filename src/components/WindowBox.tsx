import { ArrowIcon, BarsIcon, ChevronIcon, CrossIcon, EditIcon, MaximizeIcon, PlusIcon, ResetIcon, StarIcon, SubtractIcon } from '@/icons';
import LockIcon from '@/icons/LockIcon';
import { ReactElement, ReactNode } from 'react';
import Logo from './Logo';

type WindowBoxProps = {
  name: string;
  rounded: string;
  theme: 'light' | 'dark';
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
};

interface BarConfig {
  name: string;
  code: (props: { children: ReactNode; rounded: string; theme: 'light' | 'dark' }) => ReactElement;
}

import React from 'react';

const ChromeTab = ({ children, rounded, theme, device }: { children: ReactNode; rounded: string; theme: 'light' | 'dark'; device: 'mac' | 'windows' }) => {
  const light = theme === 'light';
  return (
    <div className={cn(rounded, 'overflow-hidden text-gray-400')}>
      <section className={cn('flex items-center justify-between w-full pt-1 px-3', light ? 'bg-gray-100' : 'bg-gray-800')}>
        <div className="flex items-center gap-1">
          {device === 'mac' ? (
            <div className="flex items-center gap-2 p-3 pl-0">
              {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                <div key={i} className={cn('w-3 h-3 rounded-full transition-all duration-150 cursor-pointer', color)}></div>
              ))}
            </div>
          ) : (
            <div className={cn('p-2.5 rounded-t-lg', light ? 'bg-white' : 'bg-black')}>
              <BarsIcon />
            </div>
          )}

          {/* <!-- Active Tab --> */}
          <div className={cn('flex items-center rounded-t-lg gap-2 py-2 px-3', light ? 'bg-white' : 'bg-black')}>
            <Logo size="size-5" />
            <span className="mr-3 text-sm">{i18n.t('appName')}</span>
            <CrossIcon className="size-3" />
          </div>

          <span className={cn('rounded-lg p-2', light ? 'bg-gray-200/50' : 'bg-black')}>
            <PlusIcon />
          </span>
        </div>
        {device === 'windows' && (
          <div className="flex gap-5">
            <SubtractIcon />
            <MaximizeIcon />
            <CrossIcon stroke="1" />
          </div>
        )}
      </section>

      {/* <!-- URL Section --> */}
      <section className={cn('flex items-center gap-3 w-full px-3 py-1.25', light ? 'bg-white' : 'bg-black')}>
        {/* <!-- Navigation Buttons --> */}
        <div className="flex items-center gap-3">
          <ArrowIcon className={cn('size-4 rotate-0', light ? 'text-black' : 'text-gray-100')} />
          <ArrowIcon className="size-4 rotate-180" />
          <CrossIcon className="size-3 mx-1" />
        </div>

        {/* <!-- URL Bar --> */}
        <div className={cn('flex items-center justify-between w-full h-full rounded-full px-2.5 py-1.5', light ? 'bg-gray-100' : 'bg-gray-800')}>
          <span className="flex items-center gap-2">
            <LockIcon />
            <span className={cn('text-xs', light ? 'opacity-50' : 'opacity-80')}>
              Designed by <span className="underline">{i18n.t('appName')}</span> Browser Extension!
            </span>
          </span>
          <StarIcon />
        </div>

        {/* <!-- User Menu --> */}
        <ResetIcon />
      </section>
      <div>{children}</div>
    </div>
  );
};

const ChromeTabNew = ({ children, rounded, theme, device }: { children: ReactNode; rounded: string; theme: 'light' | 'dark'; device: 'mac' | 'windows' }) => {
  const light = theme === 'light';
  return (
    <div className={cn(rounded, 'overflow-hidden text-gray-400 flex flex-col')}>
      <div className={cn('flex items-center justify-between w-full px-3 py-2', light ? 'bg-white' : 'bg-black')}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-3">
            {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
            ))}
          </div>
          <BarsIcon />
          <ChevronIcon className={cn(light ? 'text-black' : '')} />
          <ChevronIcon className={cn('rotate-180')} />
          <StarIcon className="text-yellow-300" />
        </div>

        <div className={cn('flex items-center justify-between w-full h-full rounded-md px-2.5 py-1.5 max-w-[500px]', light ? 'bg-white border border-gray-200' : 'bg-gray-900 border border-gray-600')}>
          <span className="flex items-center gap-2">
            <LockIcon />
            <span className={cn('text-xs', light ? 'opacity-50' : 'opacity-80')}>
              Designed by <span className="underline">{i18n.t('appName')}</span> Browser Extension!
            </span>
          </span>
          <ResetIcon />
        </div>

        <div className="flex items-center gap-2">
          <EditIcon />
          <PlusIcon />
          <MaximizeIcon />
        </div>
      </div>
      {children}
    </div>
  );
};

const Bars: BarConfig[] = [
  {
    name: 'none',
    code: ({ children, rounded }) => <div className={cn(rounded, 'overflow-hidden')}>{children}</div>,
  },
  {
    name: 'mac',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className={cn(rounded, 'overflow-hidden flex flex-col')}>
          <div className={cn('flex items-center -mb-px w-full px-4 py-2.5', light ? 'bg-white' : 'bg-black')}>
            <div className="flex items-center space-x-2">
              {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
              ))}
            </div>
          </div>
          {children}
        </div>
      );
    },
  },
  {
    name: 'stack',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className="relative flex-center flex-col">
          <div className={cn('absolute w-[calc(100%-20%)] h-5 -top-4 backdrop-blur-xl z-[-3]', light ? 'bg-white/50' : 'bg-black/50', rounded)}></div>
          <div className={cn('absolute w-[calc(100%-10%)] h-5 -top-2 backdrop-blur-xl z-[-2]', light ? 'bg-white/80' : 'bg-black/80', rounded)}></div>
          <div className={cn('overflow-hidden', rounded)}>{children}</div>
        </div>
      );
    },
  },
  {
    name: 'lined-border',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className={cn('p-2', light ? 'lined-border' : 'lined-border-dark', rounded)}>
          <div className={cn('overflow-hidden', rounded)}>{children}</div>
        </div>
      );
    },
  },
  {
    name: 'chrome-mac',
    code: ({ children, rounded, theme }) => {
      return <ChromeTab theme={theme} rounded={rounded} children={children} device="mac" />;
    },
  },
  {
    name: 'chrome-windows',
    code: ({ children, rounded, theme }) => {
      return <ChromeTab theme={theme} rounded={rounded} children={children} device="windows" />;
    },
  },
  {
    name: 'chrome',
    code: ({ children, rounded, theme }) => {
      return <ChromeTabNew theme={theme} rounded={rounded} children={children} device="windows" />;
    },
  },
  {
    name: 'window',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className={cn(rounded, 'overflow-hidden flex flex-col')}>
          <div className={cn('flex items-center justify-between -mb-px w-full px-4 py-2', light ? 'bg-gray-100 text-gray-900' : 'text-gray-100 bg-gray-900')}>
            <div className={cn('text-xs font-medium truncate max-w-[50%]')}>
              Designed by <span className="underline">{i18n.t('appName')}</span> Browser Extension!
            </div>
            <div className="flex items-center gap-5">
              <SubtractIcon />
              <MaximizeIcon />
              <CrossIcon stroke="1" />
            </div>
          </div>
          {children}
        </div>
      );
    },
  },
];

// Create a Map for quick lookup
const barsMap = new Map<string, (props: { children: ReactNode; rounded: string; theme: 'light' | 'dark' }) => ReactElement>(Bars.map((p) => [p.name, p.code]));

const WindowBox = ({ name, className = '', children, rounded, theme, style }: WindowBoxProps) => {
  const barComponent = barsMap.get(name);

  if (!name || !barComponent) {
    return (
      <div className={cn(`bar-${name}`, className)} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn(`bar-${name} flex justify-center`, className)} style={style}>
      {barComponent({ children, rounded, theme })}
    </div>
  );
};

export default WindowBox;

export const WINDOW_BARS = [
  // map original Bars
  ...Bars.map(({ name }) => ({
    value: name,
    label: name
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' '),
  }))
    // sort alphabetically by label
    .sort((a, b) => a.label.localeCompare(b.label))
    // ensure "none" is first
    .sort((a) => (a.value === 'none' ? -1 : 0)),
];
