import { MeasureResult, MeasureParams } from '../types';

/**
 * 测量列表项的尺寸
 * @param params - 测量参数
 * @returns 测量结果
 */
export function measureElement({
  element,
  itemHeight
}: MeasureParams): MeasureResult {
  // 如果提供了固定高度，直接使用
  if (itemHeight) {
    const rect = element.getBoundingClientRect();
    return {
      height: itemHeight,
      top: rect.top,
      bottom: rect.top + itemHeight
    };
  }

  // 否则测量实际尺寸
  const rect = element.getBoundingClientRect();
  return {
    height: rect.height,
    top: rect.top,
    bottom: rect.bottom
  };
}

/**
 * 计算元素在容器中的相对位置
 * @param element - 要计算的元素
 * @param container - 容器元素
 * @returns 相对位置
 */
export function getRelativePosition(
  element: HTMLElement,
  container: HTMLElement
): { top: number; bottom: number } {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    top: elementRect.top - containerRect.top,
    bottom: elementRect.bottom - containerRect.top
  };
}