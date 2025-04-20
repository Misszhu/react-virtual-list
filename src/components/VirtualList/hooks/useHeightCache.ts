import { useRef, useCallback } from 'react';

interface HeightCache {
  [key: number]: number;
}

export default function useHeightCache(defaultHeight: number) {
  const heightCache = useRef<HeightCache>({});
  const totalHeightCache = useRef<number[]>([]);

  const setHeight = useCallback((index: number, height: number) => {
    heightCache.current[index] = height;
    // 重置累计高度缓存
    totalHeightCache.current = [];
  }, []);

  const getHeight = useCallback((index: number) => {
    return heightCache.current[index] || defaultHeight;
  }, [defaultHeight]);

  const getTotalHeight = useCallback((itemCount: number) => {
    // 使用缓存的累计高度
    if (totalHeightCache.current[itemCount - 1] !== undefined) {
      return totalHeightCache.current[itemCount - 1];
    }

    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getHeight(i);
      totalHeightCache.current[i] = total;
    }
    return total;
  }, [getHeight]);

  const getOffset = useCallback((index: number) => {
    if (index === 0) return 0;

    // 使用缓存的累计高度
    if (totalHeightCache.current[index - 1] !== undefined) {
      return totalHeightCache.current[index - 1];
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getHeight(i);
      totalHeightCache.current[i] = offset;
    }
    return offset;
  }, [getHeight]);

  return {
    setHeight,
    getHeight,
    getTotalHeight,
    getOffset
  };
} 