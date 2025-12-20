import React, { ReactElement } from 'react';

type StackDirection = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom' | 'top' | 'left' | 'right';

interface StackEffectProps {
  children: ReactElement;
  layers?: number;
  offset?: number;
  shade?: string;
  blur?: number;
  direction?: StackDirection;
  scaleStep?: number;
  className?: string;
  rootClassName?: string;
}

const StackEffect: React.FC<StackEffectProps> = ({ children, layers = 3, offset = 20, shade = '#ffffff', blur = 0, direction = 'top', scaleStep = 0.1, className = '', rootClassName = '' }) => {
  const getTransform = (multiplier: number, scaleValue: number): string => {
    // As scale decreases, we need to compensate the position more
    const scaleOffset = (1 - scaleValue) * 50; // Additional offset based on scale reduction
    const dx = multiplier * offset + scaleOffset;
    const dy = multiplier * offset + scaleOffset;

    let translate = '';
    switch (direction) {
      case 'bottom-right':
        translate = `translate(${dx}px, ${dy}px)`;
        break;
      case 'bottom-left':
        translate = `translate(${-dx}px, ${dy}px)`;
        break;
      case 'top-right':
        translate = `translate(${dx}px, ${-dy}px)`;
        break;
      case 'top-left':
        translate = `translate(${-dx}px, ${-dy}px)`;
        break;
      case 'bottom':
        translate = `translate(0px, ${dy}px)`;
        break;
      case 'top':
        translate = `translate(0px, ${-dy}px)`;
        break;
      case 'left':
        translate = `translate(${-dx}px, 0px)`;
        break;
      case 'right':
        translate = `translate(${dx}px, 0px)`;
        break;
      default:
        translate = `translate(${dx}px, ${dy}px)`;
    }

    return `${translate} scale(${scaleValue})`;
  };
  return (
    <div className={cn('relative inline-block', rootClassName)}>
      {/* Background layers */}
      {Array.from({ length: layers - 1 }).map((_, index) => {
        const scaleValue = 1 - (index + 1) * scaleStep;
        const opacityValue = 1 - (index + 1) / layers;

        return (
          <div
            key={index}
            className={cn('absolute inset-0 pointer-events-none', className)}
            style={{
              transform: getTransform(index + 1, scaleValue),
              filter: blur > 0 ? `blur(${blur}px)` : 'none',
              zIndex: -(index + 1),
              backgroundColor: shade,
              opacity: opacityValue,
            }}
          />
        );
      })}

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default StackEffect;
