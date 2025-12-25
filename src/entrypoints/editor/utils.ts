import { SETTINGS_TYPE } from '@/app.config';

export const getGradientBackground = (settings: SETTINGS_TYPE) => {
  const { canvasColors, backgroundAngle = 180, gradientType } = settings;

  if (!canvasColors || canvasColors.length === 0) return 'transparent';

  if (canvasColors.length === 1) return canvasColors[0];
  const colorStops = canvasColors.map((c, i) => {
    const percent = Math.round((i / (canvasColors.length - 1)) * 100);
    return `${c} ${percent}%`;
  });

  if (gradientType === 'linear') {
    return `linear-gradient(${backgroundAngle}, ${colorStops.join(', ')})`;
  } else if (gradientType === 'radial') {
    return `radial-gradient(circle, ${colorStops.join(', ')})`;
  } else if (gradientType === 'conic') {
    return `conic-gradient(${colorStops.join(', ')})`;
  }

  return 'transparent';
};
