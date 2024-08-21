import { useMemo, useRef } from 'react';

function useDebounceFn(callback: any, delay: number) {
  const debouncedCallback = useRef<any>(callback);

  const debounceFn = useMemo(() => {
    // console.log('debouncedCallback.current', debouncedCallback.current);
    return debounce(debouncedCallback.current, delay);
  }, []);

  return debounceFn;
}

function debounce(fn: any, delay: number) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let startTime = Date.now();
  return function(...args: any[]) {
    if (Date.now() - startTime <= delay) {
      debounceTimer && clearTimeout(debounceTimer);
    }
    startTime = Date.now();
    debounceTimer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export default useDebounceFn;
