import { ResetIcon, TriangleIcon } from '@/icons';
import { ASPECT_CONFIG } from '@/utils/constants';
import { Button, Collapse, CollapseProps, Popconfirm, Slider, Switch } from 'antd';
import { MyColorPicker } from './MyColorPicker';
import { BG_PATTERNS } from './PatternBox';
import { WINDOW_BARS } from './WindowBox';

interface Sidebar {
  onReset: () => void;
}
const gridClass = 'grid grid-cols-2 gap-4 divide-x divide-theme';
export default function Sidebar({ onReset }: Sidebar) {
  const { settings, saveSettings } = useSettings();

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: <Title title={i18n.t('canvasOptions')} />,
      extra: (
        <Popconfirm
          title={i18n.t('confirm')}
          description={i18n.t('resetMessage', ['settings'])}
          onConfirm={onReset}
          okText={i18n.t('yes')}
          cancelText={i18n.t('no')}
        >
          <Button type="text" icon={<ResetIcon className="size-4" />} size="small" danger>
            {i18n.t('reset')}
          </Button>
        </Popconfirm>
      ),
      children: (
        <div className="divide-theme divide-y">
          <FieldSet label={i18n.t('aspectRatio')}>
            <MySelect
              className="w-full"
              value={settings.aspectRatio}
              options={Object.entries(ASPECT_CONFIG).map(([value, config]) => ({
                value: value,
                label: config.label,
              }))}
              onChange={(aspectRatio) => {
                saveSettings({ aspectRatio });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('roundedCorners')}>
            <MySelect
              className="w-full"
              value={settings.roundedWrapper}
              options={ROUNDED_SIZES}
              onChange={(roundedWrapper) => {
                saveSettings({ roundedWrapper });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('background')} orientation="horizontal" className="py-0">
            <MyColorPicker
              value={settings.canvasColors}
              onChange={(colors) => saveSettings({ canvasColors: colors })}
            />
          </FieldSet>

          <FieldSet label={i18n.t('gradientAngle')} orientation="horizontal" className="py-0">
            <div className="hover-scale">
              {BACKGROUND_GRADIENT_ANGLES.map(({ direction, angle, disabled }, i) => {
                return (
                  <Button
                    key={i}
                    size="small"
                    title={direction}
                    onClick={() => saveSettings({ backgroundAngle: `${angle}deg` })}
                    className={cn(
                      'size-3 p-0',
                      settings.backgroundAngle === `${angle}deg`
                        ? 'bg-theme-inverse text-theme-inverse'
                        : 'bg-theme text-theme',
                      disabled ? 'cursor-auto opacity-0' : ''
                    )}
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

          <FieldSet label={i18n.t('gradientType')}>
            <MySelect
              className="w-full"
              value={settings.gradientType}
              options={BACKGROUND_GRADIENT_TYPES}
              onChange={(gradientType) => {
                saveSettings({ gradientType });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('backgroundPattern')}>
            <MySelect
              className="w-full"
              value={settings.bgPattern}
              options={BG_PATTERNS}
              onChange={(bgPattern) => {
                saveSettings({ bgPattern });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('backgroundBlendMode')}>
            <MySelect
              className="w-full"
              value={settings.patternBlendMode}
              options={BACKGROUND_BLEND_MODES}
              onChange={(patternBlendMode) => saveSettings({ patternBlendMode })}
            />
          </FieldSet>

          <FieldSet label={i18n.t('patternOpacity')} className="py-0.5">
            <Slider
              className="w-full"
              min={0}
              max={1}
              step={0.05}
              defaultValue={settings.bgOpacity}
              keyboard
              onChange={(bgOpacity) => {
                saveSettings({ bgOpacity });
              }}
            />
          </FieldSet>
        </div>
      ),
    },
    {
      key: '2',
      label: <Title title={i18n.t('screenshotOptions')} />,
      children: (
        <div className="divide-theme divide-y">
          <FieldSet label={i18n.t('windowBar')}>
            <MySelect
              className="w-full"
              value={settings.windowBar}
              options={WINDOW_BARS}
              onChange={(windowBar) => {
                saveSettings({ windowBar });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('windowTheme')}>
            <MySelect
              className="w-full"
              value={settings.windowTheme}
              options={WINDOW_THEMES}
              onChange={(windowTheme) => {
                saveSettings({ windowTheme });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('margin')}>
            <MySelect
              className="w-full"
              value={settings.padding}
              options={PADDING_SIZES}
              onChange={(padding) => {
                saveSettings({ padding });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('roundedCorners')}>
            <MySelect
              className="w-full"
              value={settings.rounded}
              options={ROUNDED_SIZES}
              onChange={(rounded) => {
                saveSettings({ rounded });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('shadow')}>
            <MySelect
              className="w-full"
              value={settings.shadow}
              options={SHADOWS}
              onChange={(shadow) => {
                saveSettings({ shadow });
              }}
            />
          </FieldSet>
          <FieldSet label={i18n.t('zoom')} className="py-0.5">
            <Slider
              className="w-full"
              min={0}
              max={2}
              step={0.05}
              defaultValue={settings.scale}
              onChange={(scale) => {
                saveSettings({ scale });
              }}
            />
          </FieldSet>
          <div className={gridClass}>
            <FieldSet label={i18n.t('position')} orientation="horizontal" className="py-0 pr-0">
              <div className="hover-scale">
                {POSITIONS_CONFIG.map((item, i) => {
                  return (
                    <span
                      key={i}
                      title={item.label}
                      className={cn(
                        'size-2.5 cursor-pointer rounded-full bg-[#edebeb] dark:bg-neutral-800',
                        settings.position === item.align
                          ? 'bg-black dark:bg-white'
                          : 'hover:bg-gray-300 dark:hover:bg-neutral-900'
                      )}
                      onClick={() => {
                        saveSettings({ position: item.align, imageOrigin: item.origin });
                      }}
                    ></span>
                  );
                })}
              </div>
            </FieldSet>
            <FieldSet label={i18n.t('tilt')} className="py-0">
              <div className="hover-scale">
                {TILT_CONFIG.map((item, i) => {
                  return (
                    <span
                      key={i}
                      title={item.label}
                      className={cn(
                        'size-2.5 cursor-pointer rounded-full bg-[#edebeb] dark:bg-neutral-800',
                        settings.tilt === item.label
                          ? 'bg-black dark:bg-white'
                          : 'hover:bg-gray-300 dark:hover:bg-neutral-900'
                      )}
                      onClick={() => {
                        saveSettings({
                          tilt: item.label,
                        });
                      }}
                    ></span>
                  );
                })}
              </div>
            </FieldSet>
          </div>
          <FieldSet label={i18n.t('noise')} orientation="horizontal">
            <Switch
              checked={settings.noise}
              onChange={(noise) => {
                saveSettings({ noise });
              }}
            />
          </FieldSet>
        </div>
      ),
    },
    {
      key: '3',
      label: <Title title={i18n.t('windowBorder')} />,
      children: (
        <div className="divide-theme divide-y">
          <div className={gridClass}>
            <FieldSet label={i18n.t('visible')}>
              <Switch
                checked={settings.borderMask.visible}
                onChange={(visible) => {
                  saveSettings({ borderMask: { visible } });
                }}
              />
            </FieldSet>
            <FieldSet label={i18n.t('masked')}>
              <Switch
                checked={settings.borderMask.masked}
                onChange={(masked) => {
                  saveSettings({ borderMask: { masked } });
                }}
              />
            </FieldSet>
          </div>
          <div className={gridClass}>
            <FieldSet label={i18n.t('restricted')} className="py-0">
              <Switch
                checked={settings.borderMask.windowRestricted}
                onChange={(windowRestricted) => {
                  saveSettings({ borderMask: { windowRestricted } });
                }}
              />
            </FieldSet>
            <FieldSet label={i18n.t('color')} className="py-0">
              <MyColorPicker
                value={settings.borderMask.color}
                mode={['single']}
                onChange={(color) => saveSettings({ borderMask: { color } })}
              />
            </FieldSet>
          </div>

          <FieldSet label={i18n.t('borderType')}>
            <MySelect
              className="w-full"
              value={settings.borderMask.borderType}
              options={BORDER_TYPES.map((value) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1),
              }))}
              onChange={(borderType) => {
                saveSettings({ borderMask: { borderType } });
              }}
            />
          </FieldSet>

          <FieldSet label={i18n.t('inset')} className="py-0.5">
            <Slider
              className="w-full"
              min={0}
              max={100}
              defaultValue={settings.borderMask.inset}
              keyboard
              onChange={(inset) => {
                saveSettings({ borderMask: { inset } });
              }}
            />
          </FieldSet>
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
      defaultActiveKey={['1', '2', '3']}
      className={cn('rounded-none border-x-0 dark:bg-black')}
      styles={{
        body: {
          padding: 0,
        },
      }}
    />
  );
}

const Title = ({ title, className }: { title: string; className?: string }) => {
  return <div className={cn('font-semibold', className)}>{title}</div>;
};
