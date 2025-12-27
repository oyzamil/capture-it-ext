import { WINDOW_BARS } from '@/components/WindowBox';
import { ResetIcon } from '@/icons';
import { Button, Card, ColorPicker, Popconfirm, Select, Space, Switch } from 'antd';

interface Sidebar {
  className?: string;
  onReset: () => void;
}

export const ASPECT_CONFIG = {
  'aspect-auto': {
    label: 'Auto',
    className: 'max-w-full max-h-auto',
  },
  'aspect-square': {
    label: '1:1 — Square',
    className: 'max-w-[640px] max-h-[640px]',
  },
  'aspect-video': {
    label: '16:9 — Video',
    className: 'max-w-[1138px] max-h-[640px]',
  },
  'aspect-[9/16]': {
    label: '9:16 — Mobile / Story',
    className: 'max-w-[360px] max-h-[640px]',
  },
  'aspect-[1280/800]': {
    label: 'Extension Thumbnail',
    className: 'max-w-[1024px] max-h-[640px]',
  },
  'aspect-[440/280]': {
    label: 'Chrome Promo Tile',
    className: 'max-w-[1006px] max-h-[640px]',
  },
  'aspect-[4/5]': {
    label: '4:5 — Instagram Portrait',
    className: 'max-w-[512px] max-h-[640px]',
  },
  'aspect-[4/3]': {
    label: '4:3 — Classic',
    className: 'max-w-[853px] max-h-[640px]',
  },
  'aspect-[3/2]': {
    label: '3:2 — Photography',
    className: 'max-w-[960px] max-h-[640px]',
  },
  'aspect-[21/9]': {
    label: '21:9 — Ultrawide',
    className: 'max-w-[1493px] max-h-[640px]',
  },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_CONFIG;

export const aspectRatios = [
  // { value: 'aspect-none', label: 'None' },
  ...(Object.entries(ASPECT_CONFIG) as [AspectRatioKey, (typeof ASPECT_CONFIG)[AspectRatioKey]][]).map(([key, config]) => ({
    value: key,
    label: config.label,
  })),
];

export default function Sidebar({ className, onReset }: Sidebar) {
  const { settings, saveSettings } = useSettings();
  return (
    <div className={cn('space-y-6', className)}>
      <Card
        title="Canvas Options"
        size="small"
        extra={
          <Popconfirm title="Confirm" description="Are you sure to reset the settings?" onConfirm={onReset} okText="Yes" cancelText="No">
            <Button type="text" danger>
              <span className="size-4">
                <ResetIcon />
              </span>
              Reset Settings
            </Button>
          </Popconfirm>
        }
      >
        <Space orientation="vertical" className="w-full" size="middle">
          <FieldSet label="Aspect Ratio">
            <Select
              className="w-full"
              value={settings.aspectRatio}
              placeholder="Aspect Ratio"
              options={aspectRatios}
              onChange={(aspectRatio) => {
                saveSettings({ aspectRatio });
              }}
            />
          </FieldSet>

          <FieldSet label="Rounded Corners">
            <Select
              className="w-full"
              value={settings.roundedWrapper}
              placeholder="Rounded Corners"
              options={[
                { value: 'rounded-none', label: 'None' },
                { value: 'rounded-lg', label: 'Small' },
                { value: 'rounded-xl', label: 'Medium' },
                { value: 'rounded-3xl', label: 'Large' },
              ]}
              onChange={(roundedWrapper) => {
                saveSettings({ roundedWrapper });
              }}
            />
          </FieldSet>

          <div className="flex-center gap-4 w-full">
            <FieldSet label="Background" orientation="horizontal" className="p-0 flex-1">
              <ColorPicker
                size="large"
                className="hover-scale flex"
                format="hex"
                mode={['single', 'gradient']}
                defaultValue={[
                  {
                    color: settings.canvasColors[0],
                    percent: 0,
                  },
                  {
                    color: settings.canvasColors[1],
                    percent: 100,
                  },
                ]}
                presets={gradientPresets}
                onChangeComplete={(color) => {
                  const colors = color.getColors();
                  const canvasColorsHex = colors.map((c) => c.color.toHexString());

                  saveSettings({ canvasColors: canvasColorsHex });
                }}
              />
            </FieldSet>
            <FieldSet label="Angle" orientation="horizontal" className="p-0 flex-1 gap-5">
              <div className="hover-scale ">
                {[
                  { direction: 'To top left', angle: 315 },
                  { direction: 'To top', angle: 0 },
                  { direction: 'To top right', angle: 45 },

                  { direction: 'To left', angle: 270 },
                  { direction: 'Center', angle: 0, disabled: true },
                  { direction: 'To right', angle: 90 },

                  { direction: 'To bottom left', angle: 225 },
                  { direction: 'To bottom', angle: 180 },
                  { direction: 'To bottom right', angle: 135 },
                ].map(({ direction, angle, disabled }, i) => {
                  return (
                    <Button
                      key={i}
                      size="small"
                      title={direction}
                      onClick={() => saveSettings({ backgroundAngle: `${angle}deg` })}
                      className={cn('p-0 rounded-lg size-3', settings.backgroundAngle === `${angle}deg` ? 'bg-black text-white border-black' : '', disabled ? 'opacity-0 cursor-auto' : '')}
                      disabled={disabled}
                    >
                      <svg
                        style={{
                          transform: `rotate(${angle - 90}deg)`,
                          fontSize: '10px',
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className=""
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M9 6c0 -.852 .986 -1.297 1.623 -.783l.084 .076l6 6a1 1 0 0 1 .083 1.32l-.083 .094l-6 6l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002l-.059 -.002l-.058 -.005l-.06 -.009l-.052 -.01l-.108 -.032l-.067 -.027l-.132 -.07l-.09 -.065l-.081 -.073l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057l-.002 -12.059z" />
                      </svg>
                    </Button>
                  );
                })}
              </div>
            </FieldSet>
          </div>

          <FieldSet label="Gradient Type">
            <Select
              className="w-full"
              value={settings.gradientType}
              placeholder="Gradient Type"
              options={[
                { value: 'linear', label: 'Linear' },
                { value: 'radial', label: 'Radial' },
                { value: 'conic', label: 'Conic' },
              ]}
              onChange={(gradientType) => {
                saveSettings({ gradientType });
              }}
            />
          </FieldSet>

          <FieldSet label="Background Pattern">
            <Select
              className="w-full"
              value={settings.bgPattern}
              placeholder="Pattern"
              options={BG_PATTERNS}
              // showSearch={true}
              onInputKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();

                  const currentIndex = BG_PATTERNS.findIndex((o) => o.value === settings.bgPattern);

                  const nextIndex = e.key === 'ArrowDown' ? Math.min(currentIndex + 1, BG_PATTERNS.length - 1) : Math.max(currentIndex - 1, 0);

                  saveSettings({
                    bgPattern: BG_PATTERNS[nextIndex].value,
                  });
                }
              }}
              onChange={(bgPattern) => {
                saveSettings({ bgPattern });
              }}
            />
          </FieldSet>
        </Space>
      </Card>

      <Card title="Screenshot Options" size="small">
        <Space orientation="vertical" className="w-full" size="middle">
          <FieldSet label="Browser Bar">
            <Select
              className="w-full"
              value={settings.windowBar}
              placeholder="Browser Bar"
              options={WINDOW_BARS}
              onChange={(windowBar) => {
                saveSettings({ windowBar });
              }}
            />
          </FieldSet>
          <FieldSet label="Scale">
            <Select
              className="w-full"
              value={settings.scale}
              placeholder="Scale"
              options={[
                { value: 'scale-0', label: '0' },
                { value: 'scale-50', label: '0.5' },
                { value: 'scale-75', label: '0.75' },
                { value: 'scale-90', label: '0.9' },
                { value: 'scale-95', label: '0.95' },
                { value: 'scale-100', label: '1' },
                { value: 'scale-105', label: '1.05' },
                { value: 'scale-110', label: '1.1' },
                { value: 'scale-125', label: '1.25' },
                { value: 'scale-150', label: '1.5' },
                { value: 'scale-200', label: '2' },
              ]}
              onChange={(scale) => {
                saveSettings({ scale });
              }}
            />
          </FieldSet>

          <FieldSet label="Spacing">
            <Select
              className="w-full"
              value={settings.padding}
              placeholder="Spacing"
              options={[
                { value: 'p-0', label: 'None' },
                { value: 'p-10', label: 'Small' },
                { value: 'p-20', label: 'Medium' },
                { value: 'p-32', label: 'Large' },
              ]}
              onChange={(padding) => {
                saveSettings({ padding });
              }}
            />
          </FieldSet>

          <FieldSet label="Rounded">
            <Select
              className="w-full"
              value={settings.rounded}
              placeholder="Rounded"
              options={[
                { value: 'rounded-none', label: 'None' },
                { value: 'rounded-lg', label: 'Small' },
                { value: 'rounded-xl', label: 'Medium' },
                { value: 'rounded-3xl', label: 'Large' },
                { value: 'rounded-full', label: 'Circle' },
              ]}
              onChange={(rounded) => {
                saveSettings({ rounded });
              }}
            />
          </FieldSet>

          <FieldSet label="Shadow">
            <Select
              className="w-full"
              value={settings.shadow}
              placeholder="Shadow"
              options={[
                { value: 'shadow-none', label: 'None' },
                { value: 'shadow-lg', label: 'Small' },
                { value: 'shadow-xl', label: 'Medium' },
                { value: 'shadow-2xl', label: 'Large' },
              ]}
              onChange={(shadow) => {
                saveSettings({ shadow });
              }}
            />
          </FieldSet>
          <div className="flex-center gap-4 w-full">
            <FieldSet label="Position" orientation="horizontal" className="p-0 flex-1 gap-6">
              <div className="hover-scale">
                {[
                  { value: 'place-items-start', label: 'Top left' },
                  { value: 'place-items-start justify-items-center', label: 'Top center' },
                  { value: 'place-items-start justify-items-end', label: 'Top right' },

                  { value: 'place-items-center justify-items-start', label: 'Center left' },
                  { value: 'place-items-center', label: 'Center' },
                  { value: 'place-items-center justify-items-end', label: 'Center right' },

                  { value: 'place-items-end justify-items-start', label: 'Bottom left' },
                  { value: 'place-items-end justify-items-center', label: 'Bottom center' },
                  { value: 'place-items-end', label: 'Bottom right' },
                ].map((item, i) => {
                  return (
                    <span
                      key={i}
                      title={item.label}
                      className={cn(
                        'w-2 h-2 rounded-full cursor-pointer bg-gray-300 dark:bg-neutral-900',
                        settings.position === item.value ? 'bg-black dark:bg-white/60' : 'hover:bg-neutral-500 dark:hover:bg-neutral-800 '
                      )}
                      onClick={() => {
                        saveSettings({ position: item.value });
                      }}
                    ></span>
                  );
                })}
              </div>
            </FieldSet>
            <FieldSet label="Noise" orientation="horizontal" className="p-0 h-12.5 flex-1 gap-5">
              <Switch
                checked={settings.noise}
                onChange={(noise) => {
                  saveSettings({ noise });
                }}
              />
            </FieldSet>
          </div>
        </Space>
      </Card>
    </div>
  );
}
