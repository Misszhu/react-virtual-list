import { forwardRef } from "react";
import useVirtual from './hooks/useVirtual';
import styles from './style.module.css';
import { VirtualListProps } from './types';

const VirtualList = forwardRef<HTMLDivElement, VirtualListProps<any>>(
  ({ data, itemHeight, renderItem, overscan = 3, className }, ref) => {
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
      >
        <div style={{ height: `${totalHeight}px` }}>
          {visibleItems.map(({ data, index, offset }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${offset}px`,
                width: '100%'
              }}
            >
              {renderItem(data, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

// 添加 displayName
VirtualList.displayName = 'VirtualList';

export default VirtualList;
