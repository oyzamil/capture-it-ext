import React, { ReactElement } from 'react';

type StackDirection = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom' | 'top' | 'left' | 'right';

type Props = {
  children: ReactElement;
  layers?: number;
  scaleStep?: number;
  offset?: number;
  direction?: StackDirection;
  blur?: number;
  shade?: string;
  minTranslate?: number;
  maxTranslate?: number;
  className?: string;
  rootClassName?: string;
};

const getTransform = (multiplier: number, scaleValue: number, offset: number, direction: string, minTranslate = -50, maxTranslate = 50): string => {
  const scaleOffset = (1 - scaleValue) * 50;

  let dx = multiplier * offset + scaleOffset;
  let dy = multiplier * offset + scaleOffset;

  dx = Math.max(minTranslate, Math.min(maxTranslate, dx));
  dy = Math.max(minTranslate, Math.min(maxTranslate, dy));

  switch (direction) {
    case 'bottom-right':
      return `translate(${dx}px, ${dy}px) scale(${scaleValue})`;
    case 'bottom-left':
      return `translate(${-dx}px, ${dy}px) scale(${scaleValue})`;
    case 'top-right':
      return `translate(${dx}px, ${-dy}px) scale(${scaleValue})`;
    case 'top-left':
      return `translate(${-dx}px, ${-dy}px) scale(${scaleValue})`;
    case 'bottom':
      return `translate(0px, ${dy}px) scale(${scaleValue})`;
    case 'top':
      return `translate(0px, ${-dy}px) scale(${scaleValue})`;
    case 'left':
      return `translate(${-dx}px, 0px) scale(${scaleValue})`;
    case 'right':
      return `translate(${dx}px, 0px) scale(${scaleValue})`;
    default:
      return `translate(${dx}px, ${dy}px) scale(${scaleValue})`;
  }
};

const StackEffect: React.FC<Props> = ({
  children,
  layers = 3,
  scaleStep = 0.1,
  offset = 20,
  direction = 'top',
  blur = 0,
  shade = '#ffffff',
  minTranslate = -50,
  maxTranslate = 50,
  className,
  rootClassName,
}) => {
  const layerStyles = useMemo(() => {
    const clampedLayers = Math.max(1, Math.min(layers, 10)); // limit to 10 for performance
    return Array.from({ length: clampedLayers - 1 }).map((_, index) => {
      const scaleValue = 1 - (index + 1) * scaleStep;
      const opacityValue = 1 - (index + 1) / clampedLayers;
      return {
        transform: getTransform(index + 1, scaleValue, offset, direction, minTranslate, maxTranslate),
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
        zIndex: -(index + 1),
        opacity: opacityValue,
      };
    });
  }, [layers, scaleStep, offset, direction, blur, minTranslate, maxTranslate]);

  return (
    <div className={cn('relative inline-block', rootClassName)}>
      {/* Background layers */}
      {layerStyles.map((style, index) => (
        <div
          key={index}
          className={cn('absolute inset-0 pointer-events-none', className)}
          style={{
            ...style,
            backgroundColor: shade,
            willChange: 'transform, opacity', // GPU acceleration hint
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default StackEffect;
