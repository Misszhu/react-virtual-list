import { forwardRef } from "react";
import useVirtual from './hooks/useVirtual';
import useResize from './hooks/useResize';
import useScroll from "./hooks/useScroll";
import { VirtualListProps } from './types';
import VirtualRow from "./VirtualRow";
import styles from './style.module.css';

// HTMLDivElement 指定了 ref 的类型
// VirtualListProps<any>: 泛型参数指定了数据项的类型
const VirtualList = forwardRef<HTMLDivElement, VirtualListProps<any>>(
  ({ data, itemHeight, renderItem, overscan = 3, className, style }, ref) => {
    const { visibleItems, totalHeight, containerRef, setContainerHeight } = useVirtual({
      data,
      itemHeight,
      overscan,
      ref
    });

    // 应用 useResize 监听容器大小变化
    useResize(
      containerRef,
      ({ height }) => {
        setContainerHeight(height);
      },
      100 // 添加100ms防抖时间
    );

    // 应用 useScroll 监听滚动状态
    const scrollState = useScroll({
      elementRef: containerRef,
      onScroll: ({ scrollTop }) => {
        // 可以在这里处理滚动事件
        console.log('当前滚动位置:', scrollTop);
      }
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
