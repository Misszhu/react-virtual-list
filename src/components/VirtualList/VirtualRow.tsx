import { useRef } from 'react';
import { memo } from 'react';
import { VirtualRowProps } from './types';
import useDynamicHeight from './hooks/useDynamicHeight';

function VirtualRow<T>({
  data,
  index,
  offset,
  height,
  renderItem,
  onHeightChange
}: VirtualRowProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);

  // 使用 useDynamicHeight 处理高度测量
  useDynamicHeight({
    elementRef: rowRef,
    currentHeight: height,
    index,
    onHeightChange
  });

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