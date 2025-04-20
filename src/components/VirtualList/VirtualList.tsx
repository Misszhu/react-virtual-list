import { forwardRef } from "react";
import useVirtual from './hooks/useVirtual';
import { VirtualListProps } from './types';
import VirtualRow from "./VirtualRow";
import styles from './style.module.css';

function VirtualListInner<T>(
  { data, itemHeight, renderItem, overscan = 3, className, style }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { visibleItems, totalHeight, containerRef, updateItemHeight } = useVirtual({
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
            onHeightChange={updateItemHeight}
          />
        ))}
      </div>
    </div>
  );
}

VirtualListInner.displayName = 'VirtualList';

const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

export default VirtualList;
