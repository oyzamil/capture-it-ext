import { CrossIcon, MaximizeIcon, SubtractIcon } from '@/icons';
import { ReactElement, ReactNode } from 'react';

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
        <div className="grid">
          <div className={cn(rounded, 'flex items-center -mb-px w-full px-4 py-2.5 rounded-b-none', light ? 'bg-white' : 'bg-black')}>
            <div className="flex items-center space-x-2">
              {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
              ))}
            </div>
          </div>
          <div className={cn(rounded, 'rounded-t-none overflow-hidden flex-1')}>{children}</div> {/* Add flex-1 */}
        </div>
      );
    },
  },
  {
    name: 'stack',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className="relative flex-center">
          <div className={cn('absolute w-[calc(100%-20%)] h-full -top-4 backdrop-blur-xl z-[-3]', light ? 'bg-white/50' : 'bg-black/50', rounded)}></div>
          <div className={cn('absolute w-[calc(100%-10%)] h-full -top-2 backdrop-blur-xl z-[-2]', light ? 'bg-white/80' : 'bg-black/80', rounded)}></div>
          <div className={cn('relative overflow-hidden', rounded)}>{children}</div>
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
          <div className={cn('relative overflow-hidden', rounded)}>{children}</div>
        </div>
      );
    },
  },
  {
    name: 'window',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className="grid">
          <div className={cn(rounded, 'flex items-center justify-between -mb-px w-full px-4 py-2 rounded-b-none', light ? 'bg-gray-100 text-gray-900' : 'text-gray-100 bg-gray-900')}>
            <div className={cn('text-xs font-medium truncate max-w-[50%]')}>
              Designed by <span className="underline">{i18n.t('appName')}</span> Browser Extension!
            </div>
            <div className="flex items-center gap-5 text-center">
              <span className="text-lg leading-none">
                <SubtractIcon />
              </span>
              <span className="text-base leading-none">
                <MaximizeIcon />
              </span>
              <span className="text-lg leading-none">
                <CrossIcon stroke="1" />
              </span>
            </div>
          </div>
          <div className={cn(rounded, 'rounded-t-none overflow-hidden flex-1')}>{children}</div>
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
