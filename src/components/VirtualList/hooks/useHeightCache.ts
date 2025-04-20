import { useRef, useCallback, useEffect } from 'react';

interface HeightCache {
  [key: number]: number;
}

interface OffsetCache {
  [key: number]: number;
}

interface UpdateQueue {
  index: number;
  height: number;
}

export default function useHeightCache(defaultHeight: number) {
  const heightCache = useRef<HeightCache>({});
  const offsetCache = useRef<OffsetCache>({});
  const lastTotalHeight = useRef<number>(0);
  const lastItemCount = useRef<number>(0);
  const updateQueue = useRef<UpdateQueue[]>([]);
  const updateTimeoutRef = useRef<number | null>(null);

  // 批量处理更新队列
  const processUpdateQueue = useCallback(() => {
    if (updateQueue.current.length === 0) return;

    // 按索引排序确保顺序更新
    updateQueue.current.sort((a, b) => a.index - b.index);

    updateQueue.current.forEach(({ index, height }) => {
      if (heightCache.current[index] !== height) {
        heightCache.current[index] = height;
        // 清除受影响的偏移量缓存
        Object.keys(offsetCache.current).forEach(key => {
          if (Number(key) >= index) {
            delete offsetCache.current[Number(key)];
          }
        });
      }
    });

    // 重置总高度缓存
    lastTotalHeight.current = 0;
    // 清空队列
    updateQueue.current = [];
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current !== null) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const setHeight = useCallback((index: number, height: number) => {
    // 将更新添加到队列
    updateQueue.current.push({ index, height });

    // 清除之前的定时器
    if (updateTimeoutRef.current !== null) {
      clearTimeout(updateTimeoutRef.current);
    }

    // 设置新的定时器，延迟处理更新队列
    updateTimeoutRef.current = window.setTimeout(() => {
      processUpdateQueue();
      updateTimeoutRef.current = null;
    }, 0);
  }, [processUpdateQueue]);

  const getHeight = useCallback((index: number) => {
    return heightCache.current[index] || defaultHeight;
  }, [defaultHeight]);

  const getTotalHeight = useCallback((itemCount: number) => {
    // 如果有未处理的更新，先处理
    if (updateQueue.current.length > 0) {
      processUpdateQueue();
    }

    // 如果项目数量没变且已有缓存，直接返回
    if (itemCount === lastItemCount.current && lastTotalHeight.current > 0) {
      return lastTotalHeight.current;
    }

    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getHeight(i);
    }

    // 更新缓存
    lastTotalHeight.current = total;
    lastItemCount.current = itemCount;
    return total;
  }, [getHeight, processUpdateQueue]);

  const getOffset = useCallback((index: number) => {
    // 如果有未处理的更新，先处理
    if (updateQueue.current.length > 0) {
      processUpdateQueue();
    }

    if (index === 0) return 0;

    // 检查缓存
    if (offsetCache.current[index] !== undefined) {
      return offsetCache.current[index];
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getHeight(i);
    }

    // 存储到缓存
    offsetCache.current[index] = offset;
    return offset;
  }, [getHeight, processUpdateQueue]);

  return {
    setHeight,
    getHeight,
    getTotalHeight,
    getOffset
  };
} 