import { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollState, UseScrollProps } from '../types';
import { throttle } from '../utils/throttle';

export type ScrollDirection = 'up' | 'down' | 'none';

/**
 * 管理滚动状态的 Hook
 * @param elementRef - 滚动容器的引用
 * @param onScroll - 滚动事件的回调函数
 * @param throttleMs - 节流时间（毫秒）
 * @returns 滚动状态和方向
 */
export default function useScroll({
  elementRef,
  onScroll,
  throttleMs = 16 // 默认 16ms，约等于 60fps
}: UseScrollProps): ScrollState & { scrollDirection: ScrollDirection } {
  // 初始化滚动状态
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0
  });

  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  const prevScrollTopRef = useRef(0);

  // 使用 useRef 来存储节流函数，避免重复创建
  const throttledHandleScroll = useRef(
    throttle(() => {
      const element = elementRef.current;
      if (!element) return;

      const newScrollTop = element.scrollTop;
      const prevScrollTop = prevScrollTopRef.current;

      // 检测滚动方向
      let direction: ScrollDirection = 'none';
      if (newScrollTop > prevScrollTop) {
        direction = 'down';
      } else if (newScrollTop < prevScrollTop) {
        direction = 'up';
      }

      prevScrollTopRef.current = newScrollTop;

      if (direction !== 'none') {
        setScrollDirection(direction);
      }

      const newState = {
        scrollTop: newScrollTop,
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

  return { ...scrollState, scrollDirection };
}