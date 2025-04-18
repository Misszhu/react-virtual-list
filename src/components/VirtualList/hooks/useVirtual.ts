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

  // 防止每次渲染都创建新的函数引用
  const handleScroll = useCallback(() => {
    if (containerRef?.current) {
      setScrollTop(containerRef.current?.scrollTop || 0);
    }
  }, []);

  // 使用 ResizeObserver 监听容器大小变化
  useEffect(() => {
    if (!containerRef?.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height > 0) {
        setContainerHeight(height);
      }
    });

    // 监听容器大小变化
    resizeObserver.observe(containerRef.current);
    // 监听滚动事件
    containerRef.current.addEventListener("scroll", handleScroll);

    // 初始化高度
    setContainerHeight(containerRef.current.clientHeight);

    // 组件卸载时清理
    // 取消 ResizeObserver 和 滚动事件的监听
    return () => {
      resizeObserver.disconnect();

      containerRef?.current?.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]); // handleScroll 变化时需要重新绑定事件监听器

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
  };
}