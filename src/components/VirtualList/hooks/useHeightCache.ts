import { useRef, useCallback } from 'react';

interface HeightCache {
  [key: number]: number;
}

interface OffsetCache {
  [key: number]: number;
}

export default function useHeightCache(defaultHeight: number) {
  const heightCache = useRef<HeightCache>({});
  const offsetCache = useRef<OffsetCache>({});
  const lastTotalHeight = useRef<number>(0);
  const lastItemCount = useRef<number>(0);

  // 重新计算所有 offset
  const recalculateOffsets = useCallback((itemCount?: number) => {
    offsetCache.current = {};
    let currentOffset = 0;

    // 使用传入的 itemCount 或者已知的最大索引来确定循环范围
    const maxCachedIndex = Math.max(...Object.keys(heightCache.current).map(Number), -1);
    const maxIndex = itemCount !== undefined ? itemCount - 1 : maxCachedIndex;

    // 从 0 开始逐个计算 offset
    for (let index = 0; index <= maxIndex; index++) {
      offsetCache.current[index] = currentOffset;
      const height = heightCache.current[index] || defaultHeight;
      currentOffset += height;
    }

    return currentOffset;
  }, [defaultHeight]);

  const setHeight = useCallback((index: number, height: number) => {
    if (heightCache.current[index] === height) {
      return; // 如果高度没有变化，直接返回
    }

    heightCache.current[index] = height;
    // 重新计算所有 offset，传入 lastItemCount 确保计算所有项的 offset
    const totalHeight = recalculateOffsets(lastItemCount.current);
    lastTotalHeight.current = totalHeight;
  }, [recalculateOffsets]);

  const getHeight = useCallback((index: number) => {
    return heightCache.current[index] || defaultHeight;
  }, [defaultHeight]);

  const getTotalHeight = useCallback((itemCount: number) => {
    if (itemCount === lastItemCount.current && lastTotalHeight.current > 0) {
      return lastTotalHeight.current;
    }

    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getHeight(i);
    }

    lastTotalHeight.current = total;
    lastItemCount.current = itemCount;
    return total;
  }, [getHeight]);

  const getOffset = useCallback((index: number) => {
    if (index === 0) return 0;

    if (offsetCache.current[index] !== undefined) {
      return offsetCache.current[index];
    }

    // 如果没有缓存，重新计算所有 offset，使用 lastItemCount 确保计算所有项的 offset
    recalculateOffsets(lastItemCount.current);
    return offsetCache.current[index] || 0;
  }, [recalculateOffsets]);

  return {
    setHeight,
    getHeight,
    getTotalHeight,
    getOffset,
    recalculateOffsets
  };
} 