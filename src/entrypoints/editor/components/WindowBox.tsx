import { ReactElement, ReactNode, RefObject } from 'react';
import { settingsType } from '@/app.config';
import Logo from '@/components/Logo';
import {
  ArrowIcon,
  BarsIcon,
  ChevronIcon,
  CrossIcon,
  EditIcon,
  MaximizeIcon,
  PlusIcon,
  ResetIcon,
  StarIcon,
  SubtractIcon,
} from '@/icons';
import LockIcon from '@/icons/LockIcon';
import { TiltConfigItem, TiltLabel } from '@/utils/constants';
import Tilt from 'react-parallax-tilt';

type WindowBoxProps = {
  wrapperRef: RefObject<HTMLElement | null>;
  settings: settingsType;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
};

interface BarConfig {
  name: string;
  code: (props: { children: ReactNode; rounded: string; theme: 'light' | 'dark' }) => ReactElement;
}

const ChromeTab = ({
  children,
  rounded,
  theme,
  device,
}: {
  children: ReactNode;
  rounded: string;
  theme: 'light' | 'dark';
  device: 'mac' | 'windows';
}) => {
  const light = theme === 'light';
  return (
    <div className={cn(rounded, 'overflow-hidden text-gray-400')}>
      <section
        className={cn(
          'flex w-full items-center justify-between px-3 pt-1',
          light ? 'bg-gray-100' : 'bg-gray-800'
        )}
      >
        <div className="flex items-center gap-1">
          {device === 'mac' ? (
            <div className="flex items-center gap-2 p-3 pl-0">
              {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-3 w-3 cursor-pointer rounded-full transition-all duration-150',
                    color
                  )}
                ></div>
              ))}
            </div>
          ) : (
            <div className={cn('rounded-t-lg p-2.5', light ? 'bg-white' : 'bg-black')}>
              <BarsIcon />
            </div>
          )}

          {/* <!-- Active Tab --> */}
          <div
            className={cn(
              'flex items-center gap-2 rounded-t-lg px-3 py-2',
              light ? 'bg-white' : 'bg-black'
            )}
          >
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
      <section
        className={cn(
          'flex w-full items-center gap-3 px-3 py-1.25',
          light ? 'bg-white' : 'bg-black'
        )}
      >
        {/* <!-- Navigation Buttons --> */}
        <div className="flex items-center gap-3">
          <ArrowIcon className={cn('size-4 rotate-0', light ? 'text-black' : 'text-gray-100')} />
          <ArrowIcon className="size-4 rotate-180" />
          <CrossIcon className="mx-1 size-3" />
        </div>

        {/* <!-- URL Bar --> */}
        <div
          className={cn(
            'flex h-full w-full items-center justify-between rounded-full px-2.5 py-1.5',
            light ? 'bg-gray-100' : 'bg-gray-800'
          )}
        >
          <span className="flex items-center gap-2">
            <LockIcon />
            <span className={cn('truncate text-xs', light ? 'opacity-50' : 'opacity-80')}>
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

const ChromeTabNew = ({
  children,
  rounded,
  theme,
  device,
}: {
  children: ReactNode;
  rounded: string;
  theme: 'light' | 'dark';
  device: 'mac' | 'windows';
}) => {
  const light = theme === 'light';
  return (
    <div className={cn(rounded, 'flex flex-col overflow-hidden text-gray-400')}>
      <div
        className={cn(
          'flex w-full items-center justify-between gap-x-1 px-3 py-2',
          light ? 'bg-white' : 'bg-black'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="mr-3 flex items-center gap-2">
            {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
              <div key={i} className={cn('h-3 w-3 rounded-full', color)}></div>
            ))}
          </div>
          <BarsIcon />
          <ChevronIcon className={cn(light ? 'text-black' : '')} />
          <ChevronIcon className={cn('rotate-180')} />
          <StarIcon className="text-yellow-300" />
        </div>

        <div
          className={cn(
            'flex h-full items-center justify-between gap-x-2 rounded-md px-2.5 py-1.5',
            light ? 'border border-gray-200 bg-white' : 'border border-gray-600 bg-gray-900'
          )}
        >
          <span className="flex items-center gap-2">
            <LockIcon />
            <span className={cn('truncate text-xs', light ? 'opacity-50' : 'opacity-80')}>
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
    code: ({ children, rounded }) => (
      <div className={cn(rounded, 'overflow-hidden')}>{children}</div>
    ),
  },
  {
    name: 'mac',
    code: ({ children, rounded, theme }) => {
      const light = theme === 'light';
      return (
        <div className={cn(rounded, 'flex flex-col overflow-hidden')}>
          <div
            className={cn(
              '-mb-px flex w-full items-center px-4 py-2.5',
              light ? 'bg-white' : 'bg-black'
            )}
          >
            <div className="flex items-center space-x-2">
              {['bg-red-400', 'bg-yellow-300', 'bg-green-500'].map((color, i) => (
                <div key={i} className={cn('h-3 w-3 rounded-full', color)}></div>
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
        <div className="flex-center relative flex-col">
          <div
            className={cn(
              'absolute -top-4 z-[-3] h-5 w-[calc(100%-20%)] backdrop-blur-xl',
              light ? 'bg-white/50' : 'bg-black/50',
              rounded
            )}
          ></div>
          <div
            className={cn(
              'absolute -top-2 z-[-2] h-5 w-[calc(100%-10%)] backdrop-blur-xl',
              light ? 'bg-white/80' : 'bg-black/80',
              rounded
            )}
          ></div>
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
        <div className={cn(rounded, 'flex flex-col overflow-hidden')}>
          <div
            className={cn(
              '-mb-px flex w-full items-center justify-between px-4 py-2',
              light ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-gray-100'
            )}
          >
            <div className={cn('max-w-[50%] truncate text-xs font-medium')}>
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
const barsMap = new Map<
  string,
  (props: { children: ReactNode; rounded: string; theme: 'light' | 'dark' }) => ReactElement
>(Bars.map((p) => [p.name, p.code]));

function getTiltConfig(label: TiltLabel, fallback: TiltLabel = 'Center'): TiltConfigItem {
  return (
    TILT_CONFIG.find((i) => i.label === label) ?? TILT_CONFIG.find((i) => i.label === fallback)!
  );
}

const WindowBox = ({ wrapperRef, className = '', children, settings, style }: WindowBoxProps) => {
  const { size: windowSize, ref: windowBoxRef } = useElementSize();
  const { size: wrapperSize } = useElementSize(wrapperRef);

  const { windowBar, windowTheme, borderMask, rounded, captureMargin, tilt, scale } = settings;
  const { visible, masked, windowRestricted, borderType, color, inset } = borderMask;

  const barComponent = barsMap.get(windowBar);

  const finalBoxHeight = windowRestricted ? '100%' : wrapperSize?.height;
  const finalBoxWidth = windowRestricted ? '100%' : wrapperSize?.width;
  const maskSize = 25;

  const getMaskImages = (direction: 'right' | 'bottom') => {
    const gradient =
      direction === 'right'
        ? `linear-gradient(to right, transparent 0%, black ${maskSize}%, black ${100 - maskSize}%, transparent 100%)`
        : `linear-gradient(to bottom, transparent 0%, black ${maskSize}%, black ${100 - maskSize}%, transparent 100%)`;

    return {
      maskImage: gradient,
      WebkitMaskImage: gradient,
    };
  };

  const verticalEdges = ['top', 'bottom'];
  const horizontalEdges = ['left', 'right'];

  const tiltConfig = getTiltConfig(tilt);
  return (
    <>
      <Tilt
        tiltAngleXManual={tiltConfig.x}
        tiltAngleYManual={tiltConfig.y}
        style={{
          scale,
        }}
        className="flex-center"
      >
        {visible && (
          <div
            className="absolute overflow-visible"
            style={{
              height: windowSize?.height + inset,
              width: windowSize?.width + inset,
            }}
          >
            {[...verticalEdges, ...horizontalEdges].map((pos) => (
              <div
                key={pos}
                className={cn('absolute')}
                style={{
                  [`border${pos.charAt(0).toUpperCase() + pos.slice(1)}`]: `2px ${borderType} ${color}`,
                  background: 'transparent',
                  [pos]: -6,

                  ...(verticalEdges.includes(pos) && {
                    width: finalBoxWidth,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    ...(masked && getMaskImages('right')),
                  }),

                  ...(horizontalEdges.includes(pos) && {
                    height: finalBoxHeight,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    ...(masked && getMaskImages('bottom')),
                  }),
                }}
              />
            ))}
          </div>
        )}

        <div ref={windowBoxRef} className={cn(`bar-${windowBar} grid`, className)}>
          {barComponent ? barComponent({ children, rounded, theme: windowTheme }) : children}
        </div>
      </Tilt>
    </>
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
