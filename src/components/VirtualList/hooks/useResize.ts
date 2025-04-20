import { useEffect, useCallback } from 'react';
import { Size } from '../types';

/**
 * 防抖函数
 */
function debounce(
  fn: (size: Size) => void,
  delay: number
): (size: Size) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (size: Size) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(size), delay);
  };
}

/**
 * 监听元素大小变化的 Hook
 * @param elementRef - 要监听的元素引用
 * @param callback - 大小变化时的回调函数
 * @param debounceMs - 防抖时间（毫秒）
 */
export default function useResize(
  elementRef: React.RefObject<HTMLDivElement | null>, // 直接使用 HTMLDivElement
  callback: (size: Size) => void,
  debounceMs: number = 0
) {
  // 使用 useCallback 缓存回调函数，并应用防抖
  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (debounceMs > 0) {
          // 使用防抖包装回调函数
          const debouncedCallback = debounce(callback, debounceMs);
          debouncedCallback({ width, height });
        } else {
          // 直接调用回调函数
          callback({ width, height });
        }
      }
    },
    [callback, debounceMs]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef, handleResize]);
}