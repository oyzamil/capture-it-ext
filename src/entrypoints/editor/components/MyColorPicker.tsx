import { EyeDropperIcon } from '@/icons';
import { Button, ColorPicker, Tooltip } from 'antd';
import { Color } from 'antd/es/color-picker';

type ColorValue = {
  color: string;
  percent: number;
};

type MyColorPickerProps = {
  value: string[];
  onChange: (colors: string[]) => void;
  showEyeDropper?: boolean;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  mode?: ('single' | 'gradient')[];
};

const isEyeDropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

export function MyColorPicker({ value, onChange, showEyeDropper = true, mode = ['single', 'gradient'], size = 'large', className = '' }: MyColorPickerProps) {
  const colorValue: ColorValue[] = value.map((c, i) => ({
    color: c,
    percent: i === 0 ? 0 : 100,
  }));

  const handleColorChange = (color: { getColors: () => { color: Color }[] }) => {
    if ('getColors' in color) {
      const colors = color.getColors();
      const canvasColorsHex = colors.map((c) => c.color.toHexString());
      onChange(canvasColorsHex);
    }
  };

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API not in TypeScript yet
      const eyeDropper = new window.EyeDropper();
      const { sRGBHex } = await eyeDropper.open();
      onChange([sRGBHex]);
    } catch (error) {
      // User cancelled or error occurred
      console.error('Eye dropper error:', error);
    }
  };

  return (
    <ColorPicker
      size={size}
      className={`hover-scale flex ${className}`}
      format="hex"
      mode={mode}
      value={colorValue}
      presets={GRADIENT_PRESETS}
      onChangeComplete={handleColorChange}
      panelRender={(panel) => (
        <>
          {showEyeDropper && isEyeDropperSupported && (
            <div className="flex justify-end w-full">
              <Tooltip title="Pick color from page">
                <Button size="small" type="text" onClick={handleEyeDropper}>
                  <EyeDropperIcon />
                </Button>
              </Tooltip>
            </div>
          )}
          {panel}
        </>
      )}
    />
  );
}

{
  /* <ColorPicker
              size="large"
              className="hover-scale flex"
              format="hex"
              mode={['single', 'gradient']}
              value={settings.canvasColors.map((c, i) => ({
                color: c,
                percent: i === 0 ? 0 : 100,
              }))}
              presets={GRADIENT_PRESETS}
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
            /> */
}
