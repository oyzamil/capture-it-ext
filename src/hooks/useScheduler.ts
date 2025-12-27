import { useEffect, useMemo, useRef } from 'react';

type AnyFn = (...args: any[]) => any;

type SchedulerOptions = {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
  mode?: 'timeout' | 'raf';
};

type Scheduled<T extends AnyFn> = T & {
  cancel: () => void;
  flush: () => void;
};

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export function useScheduler<T extends AnyFn>(fn: T, { wait = 300, leading = false, trailing = true, maxWait, mode = 'timeout' }: SchedulerOptions = {}): Scheduled<T> {
  const fnRef = useLatest(fn);

  const scheduler = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | number | undefined;
    let lastCallTime = 0;
    let lastInvokeTime = 0;
    let lastArgs: Parameters<T> | undefined;

    const now = () => Date.now();

    const invoke = (time: number) => {
      lastInvokeTime = time;
      fnRef.current(...lastArgs!);
      lastArgs = undefined;
    };

    const startTimer = (delay: number) => {
      if (mode === 'raf') {
        timer = requestAnimationFrame(() => {
          timer = undefined;
          invoke(now());
        });
      } else {
        timer = setTimeout(() => {
          timer = undefined;
          if (trailing && lastArgs) invoke(now());
        }, delay);
      }
    };

    const shouldInvoke = (time: number) => {
      const sinceLastCall = time - lastCallTime;
      const sinceLastInvoke = time - lastInvokeTime;

      return lastCallTime === 0 || sinceLastCall >= wait || sinceLastCall < 0 || (maxWait !== undefined && sinceLastInvoke >= maxWait);
    };

    const scheduled = ((...args: Parameters<T>) => {
      const time = now();
      lastArgs = args;
      lastCallTime = time;

      if (shouldInvoke(time)) {
        if (!timer) {
          if (leading) invoke(time);
          if (trailing) startTimer(wait);
        }
      } else if (!timer) {
        startTimer(wait);
      }
    }) as Scheduled<T>;

    scheduled.cancel = () => {
      if (timer) {
        mode === 'raf' ? cancelAnimationFrame(timer as number) : clearTimeout(timer as ReturnType<typeof setTimeout>);
      }
      timer = lastArgs = undefined;
      lastCallTime = lastInvokeTime = 0;
    };

    scheduled.flush = () => {
      if (!timer || !lastArgs) return;
      scheduled.cancel();
      invoke(now());
    };

    return scheduled;
  }, [wait, leading, trailing, maxWait, mode]);

  useEffect(() => () => scheduler.cancel(), [scheduler]);

  return scheduler;
}

export function useDebounce<T extends AnyFn>(fn: T, wait = 300, options?: { leading?: boolean; trailing?: boolean }) {
  return useScheduler(fn, {
    wait,
    leading: options?.leading ?? false,
    trailing: options?.trailing ?? true,
  });
}

export function useThrottle<T extends AnyFn>(fn: T, wait = 300) {
  return useScheduler(fn, {
    wait,
    leading: true,
    trailing: true,
    maxWait: wait,
  });
}

// Best for Resizing
export function useThrottleRAF<T extends AnyFn>(fn: T) {
  return useScheduler(fn, {
    mode: 'raf',
    leading: true,
    trailing: false,
  });
}

// ? Examples

// ! Debounced input
/*
const onSearch = useDebounce((q: string) => {
  fetch(`/api?q=${q}`);
}, 400);
*/

// ! Throttled scroll
/*
const onScroll = useThrottle(() => {
  console.log(window.scrollY);
}, 100);
*/

// !RAF-perfect animation sync
/*const onMouseMove = useThrottleRAF((e: MouseEvent) => {
  setPos({ x: e.clientX, y: e.clientY });
});
*/
