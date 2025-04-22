import { useRef, useCallback } from 'react';

/** 高度缓存 */
interface HeightCache {
  [key: number]: number;
}

/** 偏移缓存 */
interface OffsetCache {
  [key: number]: number;
}

export default function useHeightCache(defaultHeight: number) {
  // 高度缓存
  const heightCache = useRef<HeightCache>({});
  // 偏移缓存
  const offsetCache = useRef<OffsetCache>({});
  // 总高度
  const totalHeightRef = useRef<number>(0);
  // 最后计算的项目数量
  const lastItemCountRef = useRef<number>(0);
  // 缓存是否已初始化
  const isInitializedRef = useRef<boolean>(false);
  // 缓存是否已失效
  const isInvalidatedRef = useRef<boolean>(false);

  /**
   * 计算从0到指定索引的所有项目的偏移量
   * 这是一个内部方法，不依赖缓存
   */
  const calculateOffset = useCallback((index: number): number => {
    if (index <= 0) return 0;

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += heightCache.current[i] || defaultHeight;
    }

    return offset;
  }, [defaultHeight]);

  /**
   * 重新计算所有偏移量并更新缓存
   */
  const recalculateOffsets = useCallback((itemCount: number): number => {
    if (itemCount <= 0) return 0;

    console.log('heightCache', { ...heightCache.current });

    // 清空偏移缓存
    offsetCache.current = {};
    let currentOffset = 0;

    // 计算所有项目的偏移量
    for (let index = 0; index < itemCount; index++) {
      offsetCache.current[index] = currentOffset;
      const height = heightCache.current[index] || defaultHeight;
      currentOffset += height;
    }

    // 更新状态
    lastItemCountRef.current = itemCount;
    totalHeightRef.current = currentOffset;
    isInitializedRef.current = true;
    isInvalidatedRef.current = false;

    console.log('offsetCache', { ...offsetCache.current });
    console.log('totalHeight', totalHeightRef.current);

    return currentOffset;
  }, [defaultHeight]);

  /**
   * 设置项目高度并标记缓存为失效
   */
  const setHeight = useCallback((index: number, height: number): void => {
    // 如果高度没有变化，直接返回
    if (heightCache.current[index] === height) {
      return;
    }

    // 更新高度缓存
    heightCache.current[index] = height;
    // 标记缓存为失效
    isInvalidatedRef.current = true;
  }, []);

  /**
   * 获取项目高度
   */
  const getHeight = useCallback((index: number): number => {
    // 如果索引无效，返回默认高度
    if (index < 0) return defaultHeight;
    // 如果缓存中有值，返回缓存值，否则返回默认高度
    return heightCache.current[index] || defaultHeight;
  }, [defaultHeight]);

  /**
   * 获取总高度
   */
  const getTotalHeight = useCallback((itemCount: number): number => {
    // 如果缓存未初始化、数量不匹配或缓存已失效，重新计算
    if (!isInitializedRef.current ||
      itemCount !== lastItemCountRef.current ||
      isInvalidatedRef.current) {
      return recalculateOffsets(itemCount);
    }

    // 直接返回缓存的总高度
    return totalHeightRef.current;
  }, [recalculateOffsets]);

  /**
   * 获取项目偏移量
   */
  const getOffset = useCallback((index: number): number => {
    // 如果索引无效，返回0
    if (index <= 0) return 0;

    // 如果缓存已失效，重新计算所有偏移量
    if (isInvalidatedRef.current) {
      recalculateOffsets(lastItemCountRef.current);
    }

    // 如果缓存中有值，返回缓存值
    if (offsetCache.current[index] !== undefined) {
      return offsetCache.current[index];
    }

    // 从0计算到当前索引的偏移量
    const offset = calculateOffset(index);
    // 缓存计算结果
    offsetCache.current[index] = offset;

    return offset;
  }, [recalculateOffsets, calculateOffset]);

  /**
   * 重置缓存
   */
  const resetCache = useCallback((): void => {
    heightCache.current = {};
    offsetCache.current = {};
    totalHeightRef.current = 0;
    lastItemCountRef.current = 0;
    isInitializedRef.current = false;
    isInvalidatedRef.current = true;
  }, []);

  return {
    setHeight,
    getHeight,
    getOffset,
    getTotalHeight,
    recalculateOffsets,
    resetCache
  };
} 