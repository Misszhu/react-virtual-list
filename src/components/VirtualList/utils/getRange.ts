import { GetRangeParams } from '../types';

export const fetVisibleRange = ({
  scrollTop,
  height,
  itemHeight,
  itemCount,
  overscan,
}: GetRangeParams) => {
  // 计算当前可视区域的开始和结束索引
  const startIdx = Math.max(Math.floor(scrollTop / itemHeight) - overscan, 0);
  const endIdx = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  )
  return {
    start: startIdx,
    end: endIdx,
  }
}