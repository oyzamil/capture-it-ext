import { ReactElement, ReactNode } from 'react';

type WindowBoxProps = {
  name: string;
  rounded: string;
  className?: string;
  children?: ReactNode;
};

interface BarConfig {
  name: string;
  code: (props: { children: ReactNode; rounded: string }) => ReactElement;
}

const Bars: BarConfig[] = [
  {
    name: 'simple-light',
    code: ({ children, rounded }) => (
      <>
        <div className={cn(rounded, 'flex items-center w-full px-4 py-2.5 rounded-b-none bg-white')}>
          <div className="flex items-center space-x-2">
            {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
            ))}
          </div>
        </div>
        <div className={cn(rounded, 'rounded-t-none overflow-hidden')}>{children}</div>
      </>
    ),
  },
  {
    name: 'simple-dark',
    code: ({ children, rounded }) => (
      <>
        <div className={cn(rounded, 'flex items-center w-full px-4 py-2.5 rounded-b-none bg-black')}>
          <div className="flex items-center space-x-2">
            {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
              <div key={i} className={cn('w-3 h-3 rounded-full', color)}></div>
            ))}
          </div>
        </div>
        <div className={cn(rounded, 'rounded-t-none overflow-hidden')}>{children}</div>
      </>
    ),
  },
  {
    name: 'stack-light',
    code: ({ children, rounded }) => (
      <div className="relative flex justify-center">
        <div className={cn('absolute w-[calc(100%-20%)] h-full -top-4 backdrop-blur-xl z-[-3]  bg-white/50', rounded)}></div>
        <div className={cn('absolute w-[calc(100%-10%)] h-full -top-2 backdrop-blur-xl z-[-2] bg-white/80', rounded)}></div>
        <div className={cn('relative overflow-hidden', rounded)}>{children}</div>
      </div>
    ),
  },
  {
    name: 'stack-dark',
    code: ({ children, rounded }) => (
      <div className="relative flex justify-center">
        <div className={cn('absolute w-[calc(100%-20%)] h-full -top-4 backdrop-blur-xl z-[-3]  bg-black/50', rounded)}></div>
        <div className={cn('absolute w-[calc(100%-10%)] h-full -top-2 backdrop-blur-xl z-[-2] bg-black/80', rounded)}></div>
        <div className={cn('relative overflow-hidden', rounded)}>{children}</div>
      </div>
    ),
  },
  {
    name: 'lined-border',
    code: ({ children, rounded }) => (
      <div className={cn('lined-border p-2', rounded)}>
        <div className={cn('relative overflow-hidden', rounded)}>{children}</div>
      </div>
    ),
  },
  {
    name: 'lined-border-dark',
    code: ({ children, rounded }) => (
      <div className={cn('lined-border-dark p-2', rounded)}>
        <div className={cn('relative overflow-hidden', rounded)}>{children}</div>
      </div>
    ),
  },
];

// Create a Map for quick lookup
const barsMap = new Map<string, (props: { children: ReactNode; rounded: string }) => ReactElement>(Bars.map((p) => [p.name, p.code]));

const WindowBox = ({ name, className = '', children, rounded }: WindowBoxProps) => {
  const barComponent = barsMap.get(name);

  if (!name || !barComponent) {
    return <div className={cn(`bar-${name}`, className)}>{children}</div>;
  }

  return <div className={cn(`bar-${name}`, className)}>{barComponent({ children, rounded })}</div>;
};

export default WindowBox;

export const WINDOW_BARS = [
  { value: 'none', label: 'None' },
  ...Bars.map(({ name }) => ({
    value: name,
    label: name
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' '),
  })).sort((a, b) => a.label.localeCompare(b.label)),
];
