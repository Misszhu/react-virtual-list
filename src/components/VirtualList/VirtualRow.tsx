import React from 'react';
import { VirtualRowProps } from './types';

function VirtualRow<T>({
  data,
  index,
  offset,
  height,
  renderItem
}: VirtualRowProps<T>) {
  return (
    <div
      style={{
        position: 'absolute',
        top: offset,
        left: 0,
        width: '100%',
        height
      }}
    >
      {renderItem(data, index)}
    </div>
  );
}

// 添加显示名称，便于调试
VirtualRow.displayName = 'VirtualRow';

// 使用 memo 包裹组件并保持泛型
const MemoizedVirtualRow = React.memo(VirtualRow) as typeof VirtualRow;


export default MemoizedVirtualRow;