import { useLayoutEffect, useRef, useEffect } from 'react';
import { memo } from 'react';
import { VirtualRowProps } from './types';

function VirtualRow<T>({
  data,
  index,
  offset,
  height,
  renderItem,
  onHeightChange
}: VirtualRowProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureTimeoutRef = useRef<number | null>(null);

  // TODO 使用 requestAnimationFrame 优化
  // 使用 useLayoutEffect 进行初始测量
  useLayoutEffect(() => {
    if (!rowRef.current || !onHeightChange) return;
    // 如果实际高度不等于初始高度，则更新高度
    const currentHeight = rowRef.current.getBoundingClientRect().height;
    if (currentHeight > 0 && currentHeight !== height) {
      onHeightChange(index, currentHeight);
    } else {
      // 如果初始测量失败，设置一个短暂的延时重试
      measureTimeoutRef.current = window.setTimeout(() => {
        if (rowRef.current) {
          const retryHeight = rowRef.current.getBoundingClientRect().height;
          if (retryHeight > 0 && retryHeight !== height) {
            onHeightChange(index, retryHeight);
          }
        }
      }, 0);
    }
  }, [index, height, onHeightChange]);

  // 使用 useEffect 监听尺寸变化
  useEffect(() => {
    if (!rowRef.current || !onHeightChange) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // 如果实际高度不等于初始高度，则更新高度
        const newHeight = entry.contentRect.height;
        if (newHeight > 0 && newHeight !== height) {
          onHeightChange(index, newHeight);
        }
      }
    });

    resizeObserver.observe(rowRef.current);

    return () => {
      resizeObserver.disconnect();
      if (measureTimeoutRef.current !== null) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, [index, height, onHeightChange]);

  return (
    <div
      ref={rowRef}
      style={{
        position: 'absolute',
        top: `${offset}px`,
        width: '100%',
        minHeight: `${height}px`,
        boxSizing: 'border-box'
      }}
    >
      {renderItem(data, index)}
    </div>
  );
}

export default memo(VirtualRow) as <T>(props: VirtualRowProps<T>) => React.ReactElement;