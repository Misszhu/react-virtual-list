import { forwardRef, useCallback } from "react";
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

  // 处理可见性变化
  const handleVisible = useCallback((index: number, visible: boolean) => {
    // 可以在这里处理可见性变化，例如：
    // - 加载数据
    // - 更新状态
    // - 触发回调
    console.log(`Item ${index} is ${visible ? 'visible' : 'hidden'}`);
  }, []);

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
            onVisible={handleVisible}
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
