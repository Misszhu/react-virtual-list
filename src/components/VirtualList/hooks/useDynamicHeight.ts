import { useLayoutEffect, useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from '../utils/debounce';

interface UseDynamicHeightProps {
  elementRef: React.RefObject<HTMLElement | null>;
  currentHeight: number;
  index: number;
  onHeightChange?: (index: number, height: number) => void;
}

export default function useDynamicHeight({
  elementRef,
  currentHeight: initialHeight,
  index,
  onHeightChange
}: UseDynamicHeightProps) {
  const rafRef = useRef<number | null>(null);
  const measureAttempts = useRef(0);
  const MAX_MEASURE_ATTEMPTS = 5;
  const [isInitialized, setIsInitialized] = useState(false);
  const lastMeasuredHeight = useRef<number>(initialHeight);
  const hasMeasured = useRef(false);

  // 测量元素高度
  const measureHeight = useCallback(() => {
    if (!elementRef.current) return 0;

    const element = elementRef.current;
    // 获取所有子元素的高度
    const children = Array.from(element.children);
    let maxHeight = 0;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      maxHeight = Math.max(maxHeight, rect.height);
    }

    // 如果没有子元素或子元素高度为0，使用元素自身的高度
    if (maxHeight === 0) {
      const rect = element.getBoundingClientRect();
      maxHeight = rect.height;
    }

    // 确保高度至少为初始高度
    return Math.max(Math.ceil(maxHeight), initialHeight);
  }, [initialHeight]);

  // 使用 useRef 来存储防抖函数，避免重复创建
  const debouncedHeightChange = useRef(
    debounce((height: number) => {
      if (height > 0) {
        onHeightChange?.(index, height);
        lastMeasuredHeight.current = height;
        hasMeasured.current = true;
        setIsInitialized(true);
      }
    }, 16) // 降低防抖时间到一帧
  );

  // 初始测量
  useLayoutEffect(() => {
    if (!elementRef.current) return;

    // 即使未能测量高度也在一定时间后标记为初始化完成
    const initTimeoutId = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 500);

    const measure = () => {
      const height = measureHeight();

      if (height > 0) {
        onHeightChange?.(index, height);
        lastMeasuredHeight.current = height;
        hasMeasured.current = true;
        measureAttempts.current = 0;
        setIsInitialized(true);
      } else if (measureAttempts.current < MAX_MEASURE_ATTEMPTS) {
        measureAttempts.current++;
        rafRef.current = requestAnimationFrame(measure);
      } else {
        // 如果多次尝试后仍未测量到有效高度，使用初始高度
        onHeightChange?.(index, initialHeight);
        setIsInitialized(true);
      }
    };

    rafRef.current = requestAnimationFrame(measure);

    return () => {
      clearTimeout(initTimeoutId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [elementRef, index, onHeightChange, measureHeight, initialHeight, isInitialized]);

  // 监听尺寸变化
  useEffect(() => {
    if (!elementRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const height = measureHeight();
        if (height > 0) {
          debouncedHeightChange.current(height);
        }
      }
    });

    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
      debouncedHeightChange.current.cancel();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [elementRef, index, measureHeight]);

  // 确保组件挂载后一段时间内设置为初始化状态，避免长时间显示骨架屏
  useEffect(() => {
    if (!isInitialized) {
      const timeoutId = setTimeout(() => {
        setIsInitialized(true);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized]);

  return { isInitialized };
} 