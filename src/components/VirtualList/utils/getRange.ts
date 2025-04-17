import { GetRangeParams } from '../types';

export const fetVisibleRange = ({
  scrollTop,
  height,
  itemHeight,
  itemCount,
  overscan,
}: GetRangeParams) => {
  // 确保容器高度有效
  if (height <= 0) {
    return {
      start: 0,
      end: 0
    };
  }

  // 计算当前可见区域的起始索引
  const startIndex = Math.floor(scrollTop / itemHeight);

  // 计算当前可见区域能显示的项目数量
  const visibleCount = Math.ceil(height / itemHeight);

  // // 计算当前可视区域的开始和结束索引
  // const startIdx = Math.max(Math.floor(scrollTop / itemHeight) - overscan, 0);
  // const endIdx = Math.min(
  //   itemCount - 1,
  //   Math.floor((scrollTop + height) / itemHeight) + overscan
  // )

  // 计算实际渲染范围
  const start = Math.max(0, startIndex - overscan);
  const end = Math.min(itemCount - 1, startIndex + visibleCount + overscan);

  return {
    start,
    end,
  };
};