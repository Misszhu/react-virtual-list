import { useCallback, useEffect, useRef, useState } from "react";
import { UseVirtualProps } from "../types";
import { fetVisibleRange } from "../utils/getRange";

export default function useVirtual({
  data,
  itemHeight,
  overscan = 3,
  ref
}: UseVirtualProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = typeof ref === 'function' ? localRef : (ref || localRef);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 使用 useCallback 优化滚动处理函数
  const handleScroll = useCallback(() => {
    if (containerRef && 'current' in containerRef) {
      setScrollTop(containerRef.current?.scrollTop || 0);
    }
  }, []);

  // 使用 ResizeObserver 监听容器大小变化
  useEffect(() => {
    const currentRef = containerRef && 'current' in containerRef ? containerRef.current : null;
    if (!currentRef) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height > 0) {
        setContainerHeight(height);
      }
    });

    resizeObserver.observe(currentRef);
    currentRef.addEventListener("scroll", handleScroll);

    // 初始化高度
    setContainerHeight(currentRef.clientHeight);

    return () => {
      resizeObserver.disconnect();
      currentRef.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const { start, end } = fetVisibleRange({
    scrollTop,
    height: containerHeight,
    itemHeight,
    itemCount: data.length,
    overscan,
  });

  console.log('start', start, 'end', end);


  const visibleItems = data.slice(start, end).map((item, index) => ({
    data: item,
    index: start + index,
    offset: (start + index) * itemHeight,
  }));

  return {
    visibleItems,
    containerRef,
    totalHeight: data.length * itemHeight,
  };
}