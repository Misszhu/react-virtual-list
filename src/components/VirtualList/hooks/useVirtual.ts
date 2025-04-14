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
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = ref || localRef;
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollTop(containerRef.current?.scrollTop || 0);
    }, 16);

    const handleResize = () => {
      setHeight(containerRef.current?.clientHeight || 0);
    };

    containerRef.current?.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // 初始化高度
    handleResize();

    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [])

  const { start, end } = fetVisibleRange({
    scrollTop,
    height,
    itemHeight,
    itemCount: data.length,
    overscan,
  })

  return {
    visibleItems: data.slice(start, end).map((item, index) => ({
      data: item,
      index: start + index,
      offset: (start + index) * itemHeight,
    })),
    containerRef,
    totalHeight: data.length * itemHeight,
  }
}