import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (rowRef.current && onHeightChange) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          onHeightChange(index, entry.contentRect.height);
        }
      });

      resizeObserver.observe(rowRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [index, onHeightChange]);

  return (
    <div
      ref={rowRef}
      style={{
        position: 'absolute',
        top: `${offset}px`,
        width: '100%',
        minHeight: `${height}px`,
      }}
    >
      {renderItem(data, index)}
    </div>
  );
}

export default memo(VirtualRow) as <T>(props: VirtualRowProps<T>) => React.ReactElement;