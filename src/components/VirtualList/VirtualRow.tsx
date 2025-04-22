import { useRef, useEffect, useState } from 'react';
import { memo } from 'react';
import { VirtualRowProps } from './types';
import useDynamicHeight from './hooks/useDynamicHeight';
import useIntersectionObserver from './hooks/useIntersectionObserver';
import styles from './style.module.css';

function VirtualRow<T>({
  data,
  index,
  offset,
  height,
  renderItem,
  onHeightChange,
  onVisible
}: VirtualRowProps<T>) {
  const rowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 使用 useDynamicHeight 处理高度测量
  const { isInitialized } = useDynamicHeight({
    elementRef: contentRef,
    currentHeight: height,
    index,
    onHeightChange
  });

  // 使用 IntersectionObserver 处理可见性
  const { observe, unobserve } = useIntersectionObserver({
    onIntersect: (entry) => {
      const visible = entry.isIntersecting;
      setIsVisible(visible);
      onVisible?.(index, visible);
    },
    threshold: 0.1,
    rootMargin: '200px 0px' // 增加预加载距离
  });

  // 观察元素可见性
  useEffect(() => {
    if (rowRef.current) {
      observe(rowRef.current);
    }
    return () => {
      if (rowRef.current) {
        unobserve(rowRef.current);
      }
    };
  }, [observe, unobserve]);

  // 一旦可见就开始渲染内容，即使 isInitialized 为 false
  const shouldRenderContent = isVisible || isInitialized;

  return (
    <div
      ref={rowRef}
      style={{
        position: 'absolute',
        top: `${offset}px`,
        left: 0,
        right: 0,
        minHeight: `${height}px`,
        boxSizing: 'border-box',
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      <div
        ref={contentRef}
        style={{
          opacity: isInitialized ? 1 : 0.3, // 未初始化时半透明显示
          transition: 'opacity 0.2s ease-in-out',
          minHeight: `${height}px`
        }}
      >
        {shouldRenderContent ? (
          renderItem(data, index)
        ) : (
          <div
            className={styles.placeholder}
            style={{
              minHeight: `${height}px`,
              height: '100%'
            }}
          />
        )}
      </div>
    </div>
  );
}

export default memo(VirtualRow) as <T>(props: VirtualRowProps<T>) => React.ReactElement;