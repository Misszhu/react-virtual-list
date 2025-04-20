import { useRef, useState, useCallback } from "react";
import { UseVirtualProps } from "../types";
import useScroll from "./useScroll";
import useResize from "./useResize";
import useHeightCache from "./useHeightCache";

export default function useVirtual<T>({
  data,
  itemHeight,
  overscan = 3,
  ref
}: UseVirtualProps<T>) {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = typeof ref === 'function' ? localRef : (ref || localRef);
  const [containerHeight, setContainerHeight] = useState(0);

  // 使用高度缓存
  const heightCache = useHeightCache(itemHeight);

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
    100
  );

  // 根据滚动位置估算开始索引
  const estimateStartIndex = Math.floor(scrollTop / itemHeight);

  // 计算可见区域的项目范围
  const start = Math.max(0, estimateStartIndex - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(data.length, estimateStartIndex + visibleCount + overscan);

  // 更新项目高度的回调函数
  const updateItemHeight = useCallback((index: number, height: number) => {
    heightCache.setHeight(index, height);
  }, [heightCache]);

  const visibleItems = data.slice(start, end).map((item, index) => ({
    data: item,
    index: start + index,
    offset: heightCache.getOffset(start + index),
  }));

  return {
    visibleItems,
    containerRef,
    totalHeight: heightCache.getTotalHeight(data.length),
    updateItemHeight,
  };
}