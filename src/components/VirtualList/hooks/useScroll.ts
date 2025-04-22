import { useCallback, useEffect, useState, useRef } from 'react';
import { ScrollState, UseScrollProps } from '../types';
import { throttle } from '../utils/throttle';

export type ScrollDirection = 'up' | 'down' | 'none';
export type ScrollSpeed = 'normal' | 'fast';

/**
 * 管理滚动状态的 Hook
 * @param elementRef - 滚动容器的引用
 * @param onScroll - 滚动事件的回调函数
 * @param throttleMs - 节流时间（毫秒）
 * @returns 滚动状态和滚动信息
 */
export default function useScroll({
  elementRef,
  onScroll,
  throttleMs = 16 // 默认 16ms，约等于 60fps
}: UseScrollProps): ScrollState & {
  scrollDirection: ScrollDirection;
  isScrolling: boolean;
  scrollSpeed: ScrollSpeed;
} {
  // 初始化滚动状态
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0
  });

  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<ScrollSpeed>('normal');

  const prevScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollTimeRef = useRef(Date.now());
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // 计算滚动速度
  const updateScrollVelocity = useCallback((newScrollTop: number) => {
    const now = Date.now();
    const elapsed = now - lastScrollTimeRef.current;

    if (elapsed > 0) {
      const prevScrollTop = prevScrollTopRef.current;
      const scrollDiff = Math.abs(newScrollTop - prevScrollTop);
      const newVelocity = scrollDiff / elapsed * 1000; // px/s

      // 平滑速度计算 (简单指数移动平均)
      velocityRef.current = velocityRef.current * 0.7 + newVelocity * 0.3;

      // 更新滚动速度状态
      setScrollSpeed(velocityRef.current > 700 ? 'fast' : 'normal');

      lastScrollTimeRef.current = now;
    }
  }, []);

  // 使用 requestAnimationFrame 进行滚动帧率限制
  const updateScrollState = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // 取消之前的帧请求
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // 通过 RAF 限制滚动更新频率
    rafRef.current = requestAnimationFrame(() => {
      const newScrollTop = element.scrollTop;
      const prevScrollTop = prevScrollTopRef.current;

      // 检测滚动方向
      let direction: ScrollDirection = 'none';
      if (newScrollTop > prevScrollTop) {
        direction = 'down';
      } else if (newScrollTop < prevScrollTop) {
        direction = 'up';
      }

      // 标记正在滚动
      setIsScrolling(true);

      // 更新滚动速度
      updateScrollVelocity(newScrollTop);

      // 清除之前的滚动超时
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 设置滚动停止检测超时
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        velocityRef.current = 0;
        setScrollSpeed('normal');
      }, 150);

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

      rafRef.current = null;
    });
  }, [elementRef, onScroll, updateScrollVelocity]);

  // 使用 useRef 来存储节流函数，避免重复创建
  const throttledHandleScroll = useRef(
    throttle(() => {
      updateScrollState();
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
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);

      // 清理
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [elementRef, handleScroll]);

  return {
    ...scrollState,
    scrollDirection,
    isScrolling,
    scrollSpeed
  };
}