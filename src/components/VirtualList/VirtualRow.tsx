import { useRef } from 'react';
import { memo } from 'react';
import { VirtualRowProps } from './types';
import useDynamicHeight from './hooks/useDynamicHeight';
import styles from './style.module.css';

function VirtualRow<T>({
  data,
  index,
  offset,
  height,
  renderItem,
  onHeightChange
}: VirtualRowProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 使用 useDynamicHeight 处理高度测量
  const { isInitialized } = useDynamicHeight({
    elementRef: contentRef,
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
      <div
        ref={contentRef}
        style={{
          opacity: isInitialized ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          willChange: 'opacity'
        }}
      >
        {renderItem(data, index)}
      </div>
      {!isInitialized && (
        <div
          className={styles.placeholder}
          style={{
            height: `${height}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
    </div>
  );
}

export default memo(VirtualRow) as <T>(props: VirtualRowProps<T>) => React.ReactElement;