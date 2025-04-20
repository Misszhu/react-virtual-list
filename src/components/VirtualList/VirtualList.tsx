import { forwardRef } from "react";
import useVirtual from './hooks/useVirtual';
import { VirtualListProps } from './types';
import VirtualRow from "./VirtualRow";
import styles from './style.module.css';

// HTMLDivElement 指定了 ref 的类型
// VirtualListProps<unknown>: 泛型参数指定了数据项的类型
const VirtualList = forwardRef<HTMLDivElement, VirtualListProps<unknown>>(
  ({ data, itemHeight, renderItem, overscan = 3, className, style }, ref) => {
    const { visibleItems, totalHeight, containerRef } = useVirtual({
      data,
      itemHeight,
      overscan,
      ref
    });

    return (
      <div
        ref={containerRef}
        className={`${styles.container} ${className || ''}`}
        style={{ ...style, position: 'relative', overflow: 'auto' }}
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {visibleItems.map(({ data, index, offset }) => (
            <VirtualRow
              key={index}
              data={data}
              index={index}
              offset={offset}
              height={itemHeight}
              renderItem={renderItem}
            />
          ))}
        </div>
      </div>
    );
  }
);

// 添加 displayName
VirtualList.displayName = 'VirtualList';

export default VirtualList;
