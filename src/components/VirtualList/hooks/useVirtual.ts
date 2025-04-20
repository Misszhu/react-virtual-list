import { useCallback, useEffect, useRef, useState } from "react";
import { UseVirtualProps } from "../types";
import { fetVisibleRange } from "../utils/getRange";

export default function useVirtual<T>({
  data,
  itemHeight,
  overscan = 3,
  ref
}: UseVirtualProps<T>) {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = typeof ref === 'function' ? localRef : (ref || localRef);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 滚动事件监听
  const handleScroll = useCallback(() => {
    if (containerRef?.current) {
      setScrollTop(containerRef.current?.scrollTop || 0);
    }
  }, []);

  useEffect(() => {
    const currentRef = containerRef?.current;
    if (!currentRef) return;

    // 监听滚动事件
    currentRef.addEventListener("scroll", handleScroll);

    return () => {
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

  const visibleItems = data.slice(start, end).map((item, index) => ({
    data: item,
    index: start + index,
    offset: (start + index) * itemHeight,
  }));

  return {
    visibleItems,
    containerRef,
    totalHeight: data.length * itemHeight,
    setContainerHeight, // 导出此方法供 useResize 使用
  };
}