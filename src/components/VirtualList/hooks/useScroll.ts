import { useCallback, useEffect, useState } from 'react';
import { ScrollState, UseScrollProps } from '../types';

/**
 * 管理滚动状态的 Hook
 * @param elementRef - 滚动容器的引用
 * @param onScroll - 滚动事件的回调函数
 * @returns 滚动状态
 */
export default function useScroll({ elementRef, onScroll }: UseScrollProps): ScrollState {
  // 初始化滚动状态
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0
  });

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const newState = {
      scrollTop: element.scrollTop,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight
    };

    setScrollState(newState);
    onScroll?.(newState);
  }, [elementRef, onScroll]);

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