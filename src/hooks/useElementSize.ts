import { RefObject, useEffect, useRef, useState } from 'react';

export function useElementSize<T extends HTMLElement = HTMLDivElement>(externalRef?: RefObject<T | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const internalRef = useRef<T>(null);
  const ref = externalRef || internalRef;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;

      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return { size, ref: internalRef };
}
