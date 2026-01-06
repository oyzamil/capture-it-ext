import { ReactNode } from 'react';
import { BACKGROUND_PATTERNS } from './../../../../patterns';

// let stylesInjected = false;
// let cachedCSS: string | null = null;
// const patternMap = new Map(patterns.map((p) => [p.name, p.svg]));

// const encodedPatternMap = new Map(patterns.map((p) => [p.name, p.svg ? encodeToDataURI(p.svg) : null]));

// const injectPatternCSS = () => {
//   if (stylesInjected || document.getElementById('pattern-styles')) return;

//   if (!cachedCSS) {
//     cachedCSS = patterns
//       .map((pattern) => {
//         const selector = `.pattern-${pattern.name}`;

//         if (pattern.svg) {
//           return `
// ${selector} {
//   background-image: ${encodedPatternMap.get(pattern.name)};
//   background-repeat: repeat;
//   background-position: var(--pattern-position, center);
//   background-size: var(--pattern-size, auto);
// }`;
//         }

//         if (pattern.css) {
//           const cssProps = Object.entries(pattern.css)
//             .map(([key, value]) => {
//               const kebabKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
//               return `${kebabKey}: ${value};`;
//             })
//             .join('\n  ');

//           return `${selector} {\n  ${cssProps}\n}`;
//         }

//         return '';
//       })
//       .join('\n');
//   }

//   const style = document.createElement('style');
//   style.id = 'pattern-styles';
//   style.textContent = cachedCSS;

//   document.head.appendChild(style);
//   stylesInjected = true;
// };

// export const usePatternInjector = () => {};

type PatternBoxProps = {
  name: string;
  noise?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
};

const PatternBox = ({ name, className = '', children, noise, style }: PatternBoxProps) => {
  const baseClass = `pattern-${name}`;

  return (
    <div className={[baseClass, className].join(' ')} style={style}>
      {noise ? (
        <div className="h-full w-full bg-repeat" style={{ backgroundImage: 'url("/noise.svg")' }}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default PatternBox;

export const BG_PATTERNS = [
  { value: '', label: 'None' },
  ...BACKGROUND_PATTERNS.map(({ name }) => ({
    value: name,
    label: name
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' '),
  })).sort((a, b) => a.label.localeCompare(b.label)),
];
