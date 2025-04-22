import { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollState, UseScrollProps } from '../types';

/**
 * 节流函数
 */
// TODO 调试性能
function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      performance.mark('throttle-start');
      fn(...args);
      performance.mark('throttle-end');
      performance.measure('throttle-execution', 'throttle-start', 'throttle-end');
    }
  };
}

/**
 * 管理滚动状态的 Hook
 * @param elementRef - 滚动容器的引用
 * @param onScroll - 滚动事件的回调函数
 * @param throttleMs - 节流时间（毫秒）
 * @returns 滚动状态
 */
export default function useScroll({
  elementRef,
  onScroll,
  throttleMs = 16 // 默认 16ms，约等于 60fps
}: UseScrollProps): ScrollState {
  // 初始化滚动状态
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0
  });

  // 使用 useRef 来存储节流函数，避免重复创建
  const throttledHandleScroll = useRef(
    throttle(() => {
      const element = elementRef.current;
      if (!element) return;

      const newState = {
        scrollTop: element.scrollTop,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight
      };

      setScrollState(newState);
      onScroll?.(newState);
    }, throttleMs)
  );

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    throttledHandleScroll.current();
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 初始化滚动状态
    handleScroll();

    // 添加滚动事件监听
    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef, handleScroll]);

  return scrollState;
}