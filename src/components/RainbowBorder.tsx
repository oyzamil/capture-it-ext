import React, { ReactNode } from 'react';

interface RainbowBorderProps {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
}

const RainbowBorder: React.FC<RainbowBorderProps> = ({ children, className = '', backgroundColor = '#ffffff' }) => {
  // Inject keyframes if not already present
  React.useEffect(() => {
    const styleId = 'rainbow-animation-keyframes';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = `
        @keyframes rainbow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const rainbowGradient = 'linear-gradient(90deg, #ff4242, #a1ff42, #42a1ff, #42d0ff, #a142ff)';

  const style: React.CSSProperties = {
    background: `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${backgroundColor} 30%, rgba(0,0,0,0)), ${rainbowGradient}`,
    backgroundSize: '100%, 100%, 200%',
    backgroundClip: 'padding-box, border-box, border-box',
    backgroundOrigin: 'border-box',
    animation: 'rainbow 3s linear infinite',
  };

  const glowStyle: React.CSSProperties = {
    background: rainbowGradient,
    backgroundSize: '200%',
    animation: 'rainbow 3s linear infinite',
    filter: 'blur(10px)',
  };

  const baseClasses = `
    relative inline-flex items-center justify-center
    rounded-md border-2 border-transparent
    transition-colors
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={`${baseClasses} ${className}`} style={style}>
      <div className="absolute bottom-[-20%] left-0 h-[20%] w-full -z-10 pointer-events-none" style={glowStyle} />
      {children}
    </div>
  );
};

export default RainbowBorder;
