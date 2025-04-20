import { useRef, useState } from "react";
import { UseVirtualProps } from "../types";
import { fetVisibleRange } from "../utils/getRange";
import useScroll from "./useScroll";
import useResize from "./useResize";

export default function useVirtual<T>({
  data,
  itemHeight,
  overscan = 3,
  ref
}: UseVirtualProps<T>) {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = typeof ref === 'function' ? localRef : (ref || localRef);
  const [containerHeight, setContainerHeight] = useState(0);

  // 使用 useScroll 管理滚动状态
  const { scrollTop } = useScroll({
    elementRef: containerRef,
  });

  // 监听容器大小变化
  useResize(
    containerRef,
    ({ height }) => {
      setContainerHeight(height);
    },
    100 // 添加100ms防抖时间
  );

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
    setContainerHeight,
  };
}