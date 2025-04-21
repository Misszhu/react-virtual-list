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
  const rafRef = useRef<number | null>(null);
  const measureAttempts = useRef(0);
  // 最大测量次数
  const MAX_MEASURE_ATTEMPTS = 3;

  // 使用 useLayoutEffect 进行初始测量
  useLayoutEffect(() => {
    if (!rowRef.current || !onHeightChange) return;

    const measure = () => {
      if (!rowRef.current) return;

      const currentHeight = rowRef.current.getBoundingClientRect().height;

      if (currentHeight > 0 && currentHeight !== height) {
        // 高度有效且发生变化，更新高度
        onHeightChange(index, currentHeight);
        measureAttempts.current = 0;
      } else if (measureAttempts.current < MAX_MEASURE_ATTEMPTS) {
        // 如果测量失败或高度为0，且未超过最大重试次数，则在下一帧重试
        measureAttempts.current++;
        // 记录标识，用于取消测量
        rafRef.current = requestAnimationFrame(measure);
      }
    };

    // 开始测量
    rafRef.current = requestAnimationFrame(measure);
    // 清理函数在以下情况执行：
    // 1. 组件卸载
    // 2. 组件重新渲染
    // 3. 组件的依赖项index/height/onHeightChange发生变化
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [index, height, onHeightChange]);

  // 使用 ResizeObserver 监听尺寸变化
  useEffect(() => {
    if (!rowRef.current || !onHeightChange) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const newHeight = entry.contentRect.height;
        if (newHeight > 0 && newHeight !== height) {
          // 使用 requestAnimationFrame 确保在下一帧更新高度
          rafRef.current = requestAnimationFrame(() => {
            onHeightChange(index, newHeight);
          });
        }
      }
    });

    resizeObserver.observe(rowRef.current);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
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