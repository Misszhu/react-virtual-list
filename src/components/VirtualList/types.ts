import { ForwardedRef, CSSProperties, ReactNode, RefObject } from 'react';
import { ScrollDirection, ScrollSpeed } from './hooks/useScroll';

/** 
 * 虚拟列表组件的属性接口
 * @template T - 列表数据项的类型
 */
export interface VirtualListProps<T> {
  /** 要渲染的数据数组 */
  data: T[];
  /** 每个列表项的固定高度（单位：像素） */
  itemHeight: number;
  /** 
   * 列表项渲染函数
   * @param item - 当前数据项
   * @param index - 当前数据项的索引
   * @returns React 节点
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 预加载的列表项数量（上下各预加载的数量）默认值为 3 */
  overscan?: number;
  /** 容器的自定义类名 */
  className?: string;
  /** 容器的行内样式 */
  style?: CSSProperties;
}

/** 
 * 虚拟列表 Hook 的属性接口
 * @template T - 列表数据项的类型
 */
export interface UseVirtualProps<T = unknown> {
  /** 要渲染的数据数组 */
  data: T[];
  /** 每个列表项的固定高度（单位：像素） */
  itemHeight: number;
  /** 预加载的列表项数量（上下各预加载的数量）默认值为 3 */
  overscan?: number;
  /** 虚拟列表容器的 ref 引用 */
  ref?: ForwardedRef<HTMLDivElement>;
}

/** 
 * 计算可视区域范围的参数接口
 */
export interface GetRangeParams {
  /** 滚动容器的垂直滚动距离（单位：像素） */
  scrollTop: number;
  /** 可视区域的高度（单位：像素） */
  height: number;
  /** 每个列表项的固定高度（单位：像素） */
  itemHeight: number;
  /** 列表项的总数量 */
  itemCount: number;
  /** 上下预加载的列表项数量 */
  overscan: number;
}

/** 
 * 虚拟列表行组件的属性接口
 * @template T - 列表项数据的类型
 */
export interface VirtualRowProps<T> {
  /** 列表项数据 */
  data: T;
  /** 列表项索引 */
  index: number;
  /** 垂直方向的偏移量 */
  offset: number;
  /** 列表项高度 */
  height: number;
  /** 渲染列表项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 高度变化回调函数 */
  onHeightChange?: (index: number, height: number) => void;
  /** 可见性变化回调函数 */
  onVisible?: (index: number, visible: boolean) => void;
}

/** 
 * 测量列表项尺寸的接口
 */
export interface MeasureResult {
  /** 元素高度 */
  height: number;
  /** 元素顶部偏移量 */
  top: number;
  /** 元素底部偏移量 */
  bottom: number;
}

/**
 * 测量函数的参数接口
 */
export interface MeasureParams {
  /** 要测量的元素 */
  element: HTMLElement;
  /** 列表项的固定高度 */
  itemHeight?: number;
}

/** 
 * 元素尺寸的接口定义
 */
export interface Size {
  /** 元素宽度 */
  width: number;
  /** 元素高度 */
  height: number;
}

/** 滚动状态接口 */
export interface ScrollState {
  /** 滚动距离 */
  scrollTop: number;
  /** 滚动容器的高度 */
  scrollHeight: number;
  /** 可视区域的高度 */
  clientHeight: number;
  /** 滚动方向 */
  scrollDirection?: ScrollDirection;
  /** 是否正在滚动 */
  isScrolling?: boolean;
  /** 滚动速度 */
  scrollSpeed?: ScrollSpeed;
}

/** useScroll hook 的属性接口 */
export interface UseScrollProps {
  /** 滚动容器的引用 */
  elementRef: React.RefObject<HTMLElement | null>;
  /** 滚动事件的回调函数 */
  onScroll?: (state: ScrollState) => void;
  /** 节流时间（毫秒） */
  throttleMs?: number;
}

// 数据项接口
export interface Item {
  id: string | number;
  [key: string]: any;
}

// renderItem 函数类型
export type RenderItem<T extends Item> = (props: {
  item: T;
  index: number;
  style?: CSSProperties;
}) => ReactNode;

// VirtualList props 接口
export interface VirtualListProps<T extends Item> {
  items: T[];
  height: number;
  itemCount?: number;
  overscan?: number;
  renderItem: RenderItem<T>;
  itemEstimatedHeight?: number;
  onItemsRendered?: (params: {
    startIndex: number;
    endIndex: number;
    visibleStartIndex: number;
    visibleEndIndex: number;
  }) => void;
  className?: string;
  style?: CSSProperties;
}

// useVirtual 返回类型
export interface UseVirtualReturn<T extends Item> {
  virtualItems: Array<{
    item: T;
    index: number;
    offsetTop: number;
    height: number;
  }>;
  totalHeight: number;
  scrollState: ScrollState;
}

// VirtualRow props 接口
export interface VirtualRowProps<T extends Item> {
  index: number;
  item: T;
  offsetTop: number;
  height: number;
  scrollState: ScrollState;
  renderItem: RenderItem<T>;
  measureHeight?: (index: number, height: number) => void;
}

// UseVirtualProps 接口
export interface UseVirtualProps<T extends Item> {
  items: T[];
  scrollElementRef: RefObject<HTMLElement>;
  itemEstimatedHeight?: number;
  overscan?: number;
  onItemsRendered?: (params: {
    startIndex: number;
    endIndex: number;
    visibleStartIndex: number;
    visibleEndIndex: number;
  }) => void;
}

// UseHeightCacheReturn 接口
export interface UseHeightCacheReturn {
  getHeight: (index: number) => number;
  getOffset: (index: number) => number;
  setHeight: (index: number, height: number) => void;
  getTotalHeight: () => number;
  invalidate: (startIndex?: number) => void;
}
