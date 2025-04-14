import { ForwardedRef, RefObject } from 'react';

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
}

/** 
 * 虚拟列表 Hook 的属性接口
 */
export interface UseVirtualProps {
  /** 要渲染的数据数组 */
  data: any[];
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