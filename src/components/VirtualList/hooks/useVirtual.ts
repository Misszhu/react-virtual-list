import { useEffect, useRef, useState } from "react";
import throttle from "lodash.throttle";
import { UseVirtualProps } from "../types";
import { fetVisibleRange } from "../utils/getRange";

export default function useVirtual({
  data,
  itemHeight,
  overscan = 0,
  ref
}: UseVirtualProps) {
  // 使用本地 ref 引用
  const localRef = useRef<HTMLDivElement>(null);
  // 如果传入的 ref 是函数形式，使用本地 ref，否则使用传入的 ref
  const containerRef = typeof ref === 'function' ? localRef : (ref || localRef);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (containerRef && 'current' in containerRef) {
        setScrollTop(containerRef.current?.scrollTop || 0);
      }
    }, 16);

    const handleResize = () => {
      if (containerRef && 'current' in containerRef) {
        setHeight(containerRef.current?.clientHeight || 0);
      }
    };

    if (containerRef && 'current' in containerRef && containerRef.current) {
      containerRef.current.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("resize", handleResize);

    // 初始化高度
    handleResize();

    return () => {
      if (containerRef && 'current' in containerRef && containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { start, end } = fetVisibleRange({
    scrollTop,
    height,
    itemHeight,
    itemCount: data.length,
    overscan,
  });

  return {
    visibleItems: data.slice(start, end).map((item, index) => ({
      data: item,
      index: start + index,
      offset: (start + index) * itemHeight,
    })),
    containerRef,
    totalHeight: data.length * itemHeight,
  };
}