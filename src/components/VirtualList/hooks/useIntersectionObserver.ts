import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverProps {
  onIntersect: (entry: IntersectionObserverEntry) => void;
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
}

export default function useIntersectionObserver({
  onIntersect,
  threshold = 0.1,
  rootMargin = '0px',
  root = null
}: UseIntersectionObserverProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 创建观察器
  const createObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          onIntersect(entry);
        });
      },
      {
        threshold,
        rootMargin,
        root
      }
    );
  }, [onIntersect, threshold, rootMargin, root]);

  // 观察元素
  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  // 取消观察
  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  // 清理
  useEffect(() => {
    createObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [createObserver]);

  return {
    observe,
    unobserve
  };
} 