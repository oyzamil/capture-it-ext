type ThrottleFn<T extends (...args: any[]) => void> = (fn: T, limit: number) => T;

export const throttle: ThrottleFn<any> = (fn, limit) => {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: any[]) {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeout) return;

      timeout = setTimeout(
        () => {
          lastCall = Date.now();
          timeout = null;
          fn(...args);
        },
        limit - (now - lastCall)
      );
    }
  };
};
