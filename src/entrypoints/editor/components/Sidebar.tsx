import { WINDOW_BARS } from '@/components/WindowBox';
import { EyeDropperIcon, ResetIcon, TriangleIcon } from '@/icons';
import { Button, Collapse, CollapseProps, ColorPicker, Popconfirm, Slider, Switch, Tooltip } from 'antd';

interface Sidebar {
  onReset: () => void;
}

export const ASPECT_CONFIG = {
  'aspect-auto': {
    label: 'Auto',
    className: 'w-full h-auto',
  },
  'aspect-square': {
    label: '1:1 — Square',
    className: 'w-[640px] h-[640px]',
  },
  'aspect-video': {
    label: '16:9 — Video',
    className: 'w-[1138px] h-[640px]',
  },
  'aspect-[9/16]': {
    label: '9:16 — Mobile / Story',
    className: 'w-[360px] h-[640px]',
  },
  'aspect-[1280/800]': {
    label: 'Extension Thumbnail',
    className: 'w-[1024px] h-[640px]',
  },
  'aspect-[440/280]': {
    label: 'Chrome Promo Tile',
    className: 'w-[1006px] h-[640px]',
  },
  'aspect-[4/5]': {
    label: '4:5 — Instagram Portrait',
    className: 'w-[512px] h-[640px]',
  },
  'aspect-[4/3]': {
    label: '4:3 — Classic',
    className: 'w-[853px] h-[640px]',
  },
  'aspect-[3/2]': {
    label: '3:2 — Photography',
    className: 'w-[960px] h-[640px]',
  },
  'aspect-21/9': {
    label: '21:9 — Ultrawide',
    className: 'max-w-[1493px] max-h-[640px] w-full h-full',
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

const isEyeDropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

export default function Sidebar({ onReset }: Sidebar) {
  const { settings, saveSettings } = useSettings();

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: <Title title="Canvas Options" />,
      children: (
        <div className="space-y-2">
          <FieldSet label="Aspect Ratio">
            <MySelect
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
            <MySelect
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
                value={settings.canvasColors.map((c, i) => ({
                  color: c,
                  percent: i === 0 ? 0 : 100,
                }))}
                presets={gradientPresets}
                onChangeComplete={(color) => {
                  const colors = color.getColors();
                  const canvasColorsHex = colors.map((c) => c.color.toHexString());
                  saveSettings({ canvasColors: canvasColorsHex });
                }}
                panelRender={(panel) => (
                  <>
                    {isEyeDropperSupported && (
                      <div className="flex justify-end w-full">
                        <Tooltip title="Pick color from page">
                          <Button
                            size="small"
                            type="text"
                            onClick={async () => {
                              try {
                                // @ts-expect-error
                                const eyeDropper = new window.EyeDropper();
                                const { sRGBHex } = await eyeDropper.open();
                                saveSettings({ canvasColors: [sRGBHex] }); // <-- now preview updates
                              } catch {}
                            }}
                          >
                            <EyeDropperIcon />
                          </Button>
                        </Tooltip>
                      </div>
                    )}

                    {panel}
                  </>
                )}
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
                      <div
                        style={{
                          transform: `rotate(${angle - 90}deg)`,
                        }}
                      >
                        <TriangleIcon className="size-3" />
                      </div>
                    </Button>
                  );
                })}
              </div>
            </FieldSet>
          </div>

          <FieldSet label="Gradient Type">
            <MySelect
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
            <MySelect
              className="w-full"
              value={settings.bgPattern}
              placeholder="Pattern"
              options={BG_PATTERNS}
              onChange={(bgPattern) => {
                saveSettings({ bgPattern });
              }}
            />
          </FieldSet>
          <FieldSet label="Background Blend Mode">
            <MySelect
              className="w-full"
              value={settings.patternBlendMode}
              placeholder="Blend Mode"
              options={[
                { value: 'mix-blend-normal', label: 'Normal' },
                { value: 'mix-blend-multiply', label: 'Multiply' },
                { value: 'mix-blend-screen', label: 'Screen' },
                { value: 'mix-blend-overlay', label: 'Overlay' },
                { value: 'mix-blend-darken', label: 'Darken' },
                { value: 'mix-blend-lighten', label: 'Lighten' },
                { value: 'mix-blend-color-dodge', label: 'Color Dodge' },
                { value: 'mix-blend-color-burn', label: 'Color Burn' },
                { value: 'mix-blend-hard-light', label: 'Hard Light' },
                { value: 'mix-blend-soft-light', label: 'Soft Light' },
                { value: 'mix-blend-difference', label: 'Difference' },
                { value: 'mix-blend-exclusion', label: 'Exclusion' },
                { value: 'mix-blend-hue', label: 'Hue' },
                { value: 'mix-blend-saturation', label: 'Saturation' },
                { value: 'mix-blend-color', label: 'Color' },
                { value: 'mix-blend-luminosity', label: 'Luminosity' },
              ]}
              onChange={(patternBlendMode) => saveSettings({ patternBlendMode })}
            />
          </FieldSet>
        </div>
      ),
      extra: (
        <Popconfirm title="Confirm" description="Are you sure to reset the settings?" onConfirm={onReset} okText="Yes" cancelText="No">
          <Button type="text" icon={<ResetIcon className="size-4" />} size="small" danger>
            Reset Settings
          </Button>
        </Popconfirm>
      ),
    },
    {
      key: '2',
      label: <Title title="Screenshot Options" />,
      children: (
        <div className="space-y-2">
          <FieldSet label="Window Bar">
            <MySelect
              className="w-full"
              value={settings.windowBar}
              placeholder="Window Bar"
              options={WINDOW_BARS}
              onChange={(windowBar) => {
                saveSettings({ windowBar });
              }}
            />
          </FieldSet>

          <FieldSet label="Window Theme">
            <MySelect
              className="w-full"
              value={settings.windowTheme}
              placeholder="Window Theme"
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              onChange={(windowTheme) => {
                saveSettings({ windowTheme });
              }}
            />
          </FieldSet>

          <FieldSet label="Scale">
            <Slider
              min={0}
              max={2}
              step={0.05}
              defaultValue={settings.scale}
              keyboard
              onChangeComplete={(scale) => {
                saveSettings({ scale });
              }}
            />
          </FieldSet>

          <FieldSet label="Spacing">
            <MySelect
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
            <MySelect
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
            <MySelect
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
                  // Top
                  { label: 'Top left', align: 'place-items-start justify-items-start', origin: 'origin-top-left' },
                  { label: 'Top center', align: 'place-items-start justify-items-center', origin: 'origin-top' },
                  { label: 'Top right', align: 'place-items-start justify-items-end', origin: 'origin-top-right' },

                  // Center
                  { label: 'Center left', align: 'place-items-center justify-items-start', origin: 'origin-left' },
                  { label: 'Center', align: 'place-items-center', origin: 'origin-center' },
                  { label: 'Center right', align: 'place-items-center justify-items-end', origin: 'origin-right' },

                  // Bottom
                  { label: 'Bottom left', align: 'place-items-end justify-items-start', origin: 'origin-bottom-left' },
                  { label: 'Bottom center', align: 'place-items-end justify-items-center', origin: 'origin-bottom' },
                  { label: 'Bottom right', align: 'place-items-end justify-items-end', origin: 'origin-bottom-right' },
                ].map((item, i) => {
                  return (
                    <span
                      key={i}
                      title={item.label}
                      className={cn(
                        'w-2 h-2 rounded-full cursor-pointer bg-gray-300 dark:bg-neutral-900',
                        settings.position === item.align ? 'bg-black dark:bg-white/60' : 'hover:bg-neutral-500 dark:hover:bg-neutral-800 '
                      )}
                      onClick={() => {
                        saveSettings({ position: item.align, imageOrigin: item.origin });
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
        </div>
      ),
    },
  ];

  return (
    <Collapse
      items={items}
      expandIcon={({ isActive }) => (
        <div
          style={{
            transform: `rotate(${isActive ? 90 : 0}deg)`,
          }}
        >
          <TriangleIcon />
        </div>
      )}
      defaultActiveKey={['1', '2']}
      className={cn('rounded-none')}
    />
  );
}

const Title = ({ title, className }: { title: string; className?: string }) => {
  return <div className={cn('font-semibold', className)}>{title}</div>;
};
