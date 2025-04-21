import { useLayoutEffect, useEffect, useRef } from 'react';

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

  // 初始测量
  useLayoutEffect(() => {
    if (!elementRef.current || !onHeightChange) return;

    const measure = () => {
      if (!elementRef.current) return;

      const height = elementRef.current.getBoundingClientRect().height;

      if (height > 0 && height !== currentHeight) {
        onHeightChange(index, height);
        measureAttempts.current = 0;
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
        if (newHeight > 0 && newHeight !== currentHeight) {
          rafRef.current = requestAnimationFrame(() => {
            onHeightChange(index, newHeight);
          });
        }
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
} 