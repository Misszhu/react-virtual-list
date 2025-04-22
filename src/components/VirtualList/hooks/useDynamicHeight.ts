import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { debounce } from '../utils/debounce';

interface UseDynamicHeightProps {
  elementRef: React.RefObject<HTMLElement | null>;
  currentHeight: number;
  index: number;
  onHeightChange?: (index: number, height: number) => void;
}

export default function useDynamicHeight({
  elementRef,
  currentHeight,
  index,
  onHeightChange
}: UseDynamicHeightProps) {
  const rafRef = useRef<number | null>(null);
  const measureAttempts = useRef(0);
  const MAX_MEASURE_ATTEMPTS = 3;
  const [isInitialized, setIsInitialized] = useState(false);

  // 使用 useRef 来存储防抖函数，避免重复创建
  const debouncedHeightChange = useRef(
    debounce((height: number) => {
      if (height > 0 && height !== currentHeight) {
        onHeightChange?.(index, height);
        setIsInitialized(true);
      }
    }, 100)
  );

  // 初始测量
  useLayoutEffect(() => {
    if (!elementRef.current || !onHeightChange) return;

    const measure = () => {
      if (!elementRef.current) return;

      const height = elementRef.current.getBoundingClientRect().height;

      if (height > 0 && height !== currentHeight) {
        onHeightChange(index, height);
        measureAttempts.current = 0;
        setIsInitialized(true);
      } else if (measureAttempts.current < MAX_MEASURE_ATTEMPTS) {
        measureAttempts.current++;
        rafRef.current = requestAnimationFrame(measure);
      }
    };

    rafRef.current = requestAnimationFrame(measure);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [elementRef, currentHeight, index, onHeightChange]);

  // 监听尺寸变化
  useEffect(() => {
    if (!elementRef.current || !onHeightChange) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const newHeight = entry.contentRect.height;
        debouncedHeightChange.current(newHeight);
      }
    });

    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [elementRef, currentHeight, index, onHeightChange]);

  return { isInitialized };
} 