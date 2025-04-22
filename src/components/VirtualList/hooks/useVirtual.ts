import { useRef, useState, useCallback, useEffect } from "react";
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
  const initializedItemsRef = useRef(new Set<number>());
  const pendingHeightUpdates = useRef<Map<number, number>>(new Map());
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUpdatingRef = useRef(false);
  const prevDataLengthRef = useRef(0);

  // 使用高度缓存
  const heightCache = useHeightCache(itemHeight);

  // 当数据长度变化时重置高度缓存
  useEffect(() => {
    const currentDataLength = data.length;

    // 如果数据长度减少，重置缓存
    if (prevDataLengthRef.current > currentDataLength) {
      heightCache.resetCache();
    }

    // 初始化时预计算所有项的偏移量
    heightCache.recalculateOffsets(currentDataLength);
    prevDataLengthRef.current = currentDataLength;
  }, [data.length, heightCache]);

  // 批量更新高度
  const processPendingUpdates = useCallback(() => {
    if (pendingHeightUpdates.current.size === 0 || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    const updates = Array.from(pendingHeightUpdates.current.entries());
    pendingHeightUpdates.current.clear();

    // 先更新所有高度
    updates.forEach(([index, height]) => {
      heightCache.setHeight(index, height);
    });

    // 再一次性重新计算偏移量
    heightCache.recalculateOffsets(data.length);
    isUpdatingRef.current = false;
  }, [heightCache, data.length]);

  // 使用 useScroll 管理滚动状态
  const { scrollTop, scrollDirection } = useScroll({
    elementRef: containerRef,
  });

  // 确保视口范围内的项目已经初始化
  useEffect(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(data.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + 1);

    // 确保视口内所有项目都被初始化
    for (let i = start; i < end; i++) {
      if (i >= 0 && i < data.length && !initializedItemsRef.current.has(i)) {
        // 如果项目未初始化，使用默认高度初始化它
        initializedItemsRef.current.add(i);
        // 不需要更新高度缓存，因为默认值已经是 itemHeight
      }
    }
  }, [scrollTop, containerHeight, data.length, itemHeight]);

  // 优先处理可视区域内的更新
  useEffect(() => {
    // 安排延迟批处理，确保连续快速滚动时不会频繁更新
    if (updateTimeoutRef.current !== null) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      processPendingUpdates();
      updateTimeoutRef.current = null;
    }, 50); // 50ms批处理间隔

    return () => {
      if (updateTimeoutRef.current !== null) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [scrollTop, processPendingUpdates]);

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

    // 快速查找：从估算位置开始优化
    const estimatedIndex = Math.floor(scrollTop / itemHeight);
    if (estimatedIndex > 0 && estimatedIndex < data.length) {
      index = estimatedIndex;
      currentOffset = heightCache.getOffset(estimatedIndex);
    }

    // 向后查找
    while (index < data.length && currentOffset <= scrollTop) {
      currentOffset += heightCache.getHeight(index);
      index++;
    }

    // 向前调整
    while (index > 0 && currentOffset > scrollTop) {
      index--;
      currentOffset -= heightCache.getHeight(index);
    }

    // 向上滚动时额外向前渲染一些项，防止偏移量计算错误导致空白
    const extraOffset = scrollDirection === 'up' ? overscan * 2 : overscan;
    return Math.max(0, index - extraOffset);
  }, [data.length, heightCache, itemHeight, overscan, scrollDirection]);

  // 根据开始索引和容器高度查找结束索引
  const findEndIndex = useCallback((startIndex: number): number => {
    let index = startIndex;
    let currentOffset = heightCache.getOffset(startIndex);

    // 向上滚动时增加额外的视口高度，确保缓存足够的项
    const extraHeight = scrollDirection === 'up' ? containerHeight * 1.5 : containerHeight * 0.5;
    const targetOffset = scrollTop + containerHeight + extraHeight;

    // 从开始索引累加高度直到超过目标偏移量
    while (index < data.length && currentOffset < targetOffset) {
      currentOffset += heightCache.getHeight(index);
      index++;
    }

    // 向上滚动时多渲染一些项，防止偏移量计算错误导致空白
    const extraItemsForUpScroll = scrollDirection === 'up' ? overscan * 2 : overscan;
    return Math.min(data.length, index + extraItemsForUpScroll);
  }, [data.length, heightCache, containerHeight, scrollTop, overscan, scrollDirection]);

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
    // 如果已经初始化且高度没有变化，直接返回
    if (initializedItemsRef.current.has(index) && heightCache.getHeight(index) === height) {
      return;
    }

    // 将高度更新添加到待处理队列
    pendingHeightUpdates.current.set(index, height);

    // 立即更新已初始化状态
    if (!initializedItemsRef.current.has(index)) {
      initializedItemsRef.current.add(index);
    }

    // 如果队列中只有一个项目，立即处理；否则等待批处理
    if (pendingHeightUpdates.current.size === 1 && !isUpdatingRef.current) {
      processPendingUpdates();
    }
  }, [heightCache, processPendingUpdates]);

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
  const initialItems = Math.min(10, data.length);
  const initialVisibleItems = !isInitialized ? data.slice(0, initialItems).map((item, index) => ({
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