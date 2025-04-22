import { useEffect, useCallback, useRef } from 'react';
import { Size } from '../types';
import { debounce } from '../utils/debounce';

/**
 * 监听元素大小变化的 Hook
 * @param elementRef - 要监听的元素引用
 * @param callback - 大小变化时的回调函数
 * @param debounceMs - 防抖时间（毫秒）
 */
export default function useResize(
  elementRef: React.RefObject<HTMLDivElement | null>,
  callback: (size: Size) => void,
  debounceMs: number = 100
) {
  // 使用 useRef 来存储防抖函数，避免重复创建
  const debouncedCallback = useRef(
    debounce((size: Size) => {
      callback(size);
    }, debounceMs)
  );

  // 使用 useCallback 缓存回调函数
  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        debouncedCallback.current({ width, height });
      }
    },
    []
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