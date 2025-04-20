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
  const [isInitialized, setIsInitialized] = useState(false);
  const lastStartRef = useRef(0);
  const lastEndRef = useRef(0);

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
      if (height > 0 && !isInitialized) {
        setIsInitialized(true);
      }
    },
    100
  );

  // 根据滚动位置查找开始索引
  const findStartIndex = useCallback((scrollTop: number): number => {
    let index = 0;
    let currentOffset = 0;

    while (index < data.length) {
      const height = heightCache.getHeight(index);
      if (currentOffset + height > scrollTop) {
        break;
      }
      currentOffset += height;
      index++;
    }

    return Math.max(0, index - overscan);
  }, [data.length, heightCache, overscan]);

  // 根据开始索引和容器高度查找结束索引
  const findEndIndex = useCallback((startIndex: number): number => {
    let index = startIndex;
    let currentOffset = heightCache.getOffset(startIndex);
    const targetOffset = scrollTop + containerHeight;

    while (index < data.length && currentOffset < targetOffset) {
      currentOffset += heightCache.getHeight(index);
      index++;
    }

    return Math.min(data.length, index + overscan);
  }, [data.length, heightCache, containerHeight, scrollTop, overscan]);

  // 计算可见范围
  const calculateVisibleRange = useCallback(() => {
    const start = findStartIndex(scrollTop);
    const end = findEndIndex(start);

    // 如果范围没有变化，使用上一次的范围
    if (start === lastStartRef.current && end === lastEndRef.current) {
      return { start: lastStartRef.current, end: lastEndRef.current };
    }

    lastStartRef.current = start;
    lastEndRef.current = end;
    return { start, end };
  }, [findStartIndex, findEndIndex, scrollTop]);

  // 更新项目高度的回调函数
  const updateItemHeight = useCallback((index: number, height: number) => {
    heightCache.setHeight(index, height);
  }, [heightCache]);

  // 计算可见项目
  const { start, end } = calculateVisibleRange();
  const visibleItems = data.slice(start, end).map((item, index) => {
    const actualIndex = start + index;
    const offset = heightCache.getOffset(actualIndex);
    return {
      data: item,
      index: actualIndex,
      offset,
    };
  });

  // 初始化时预渲染更多项目
  const initialVisibleItems = !isInitialized ? data.slice(0, 10).map((item, index) => ({
    data: item,
    index: index,
    offset: heightCache.getOffset(index),
  })) : visibleItems;

  return {
    visibleItems: isInitialized ? visibleItems : initialVisibleItems,
    containerRef,
    totalHeight: heightCache.getTotalHeight(data.length),
    updateItemHeight,
  };
}