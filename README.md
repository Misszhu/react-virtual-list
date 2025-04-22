# 虚拟列表组件使用说明

## 简介

虚拟列表是一种高效渲染大量数据的解决方案，它只渲染可视区域内的数据项，而不是一次性渲染所有数据。这种方式可以显著提高长列表的渲染性能，减少内存占用，优化用户体验。

## 实现原理

虚拟列表的核心原理是只渲染用户视口中可见的列表项，同时使用数学计算来模拟完整列表的滚动效果。主要实现技术包括：

1. **高度计算与位置管理**：

   - 根据列表项的高度和总数计算整体内容高度
   - 创建一个与总高度一致的空容器，确保滚动条的比例正确
   - 通过绝对定位，将可见项放置在正确的位置

2. **可见项计算**：

   - 根据当前滚动位置(`scrollTop`)和容器高度计算可见范围
   - 利用二分查找或直接计算确定起始和结束索引
   - 适当添加上下缓冲区(overscan)以优化滚动体验

3. **滚动性能优化**：

   - 使用`requestAnimationFrame`进行滚动事件节流
   - 采用绝对定位避免 DOM 重排
   - 采用硬件加速技术提高渲染性能
   - 高效的列表项回收和复用策略

4. **动态高度支持**：
   - 维护项目高度缓存
   - 提供高度测量和更新机制
   - 实现高效的高度更新和偏移量重新计算

## 基本用法

```jsx
import React from "react";
import VirtualList from "./components/VirtualList/VirtualList";

function App() {
  // 准备数据
  const data = Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    text: `项目 ${index + 1}`,
    description: `这是项目 ${index + 1} 的描述`,
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h1>虚拟列表示例</h1>
      <VirtualList
        data={data}
        itemHeight={60} // 每项的固定高度
        overscan={3} // 预渲染的项数
        renderItem={(item, index) => (
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #eee",
              background: index % 2 ? "#f9f9f9" : "#fff",
              boxSizing: "border-box",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>{item.text}</h3>
            <p style={{ margin: 0 }}>{item.description}</p>
          </div>
        )}
        style={{
          height: "500px", // 容器高度
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "auto",
        }}
      />
    </div>
  );
}

export default App;
```

## API 参考

### VirtualList 组件属性

| 属性       | 类型                                  | 必填 | 默认值 | 描述                   |
| ---------- | ------------------------------------- | ---- | ------ | ---------------------- |
| data       | Array<T>                              | 是   | -      | 要渲染的数据数组       |
| itemHeight | number                                | 是   | -      | 列表项的固定高度(像素) |
| renderItem | (item: T, index: number) => ReactNode | 是   | -      | 列表项的渲染函数       |
| overscan   | number                                | 否   | 3      | 视口外预渲染的项数     |
| className  | string                                | 否   | -      | 容器的 CSS 类名        |
| style      | CSSProperties                         | 否   | -      | 容器的内联样式         |

### 高级用法：动态高度

虽然基本使用时需要指定固定的`itemHeight`，但组件内部支持运行时调整高度。可以在渲染后通过 onHeightChange 回调更新实际高度。

```jsx
import React, { useCallback, useRef, useEffect } from "react";
import VirtualList from "./components/VirtualList/VirtualList";

function DynamicHeightExample() {
  const data = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
    description:
      i % 3 === 0
        ? "这是一个较长的描述，包含多行文本内容。".repeat(
            Math.floor(Math.random() * 3) + 1
          )
        : "简短描述",
  }));

  // 自定义列表项组件示例
  const CustomItem = useCallback(({ data, index, onHeightChange }) => {
    const ref = useRef(null);

    useEffect(() => {
      if (ref.current) {
        // 测量并更新实际高度
        const height = ref.current.getBoundingClientRect().height;
        onHeightChange(index, height);
      }
    }, [index, onHeightChange]);

    return (
      <div
        ref={ref}
        style={{
          padding: "16px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h3>{data.text}</h3>
        <p>{data.description}</p>
      </div>
    );
  }, []);

  return (
    <VirtualList
      data={data}
      itemHeight={50} // 初始估计高度
      renderItem={(item, index, { onHeightChange }) => (
        <CustomItem data={item} index={index} onHeightChange={onHeightChange} />
      )}
      style={{ height: "600px", overflow: "auto" }}
    />
  );
}
```

## 常见场景

### 1. 无限滚动加载

```jsx
function InfiniteScrollExample() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    // 模拟API请求
    const newItems = await fetchMoreData(data.length, 20);

    setTimeout(() => {
      setData((prev) => [...prev, ...newItems]);
      setLoading(false);
      setHasMore(newItems.length > 0);
    }, 1000);
  }, [data.length, loading, hasMore]);

  const handleScroll = useCallback(
    ({ scrollTop, scrollHeight, clientHeight }) => {
      // 当滚动到距离底部100px时加载更多
      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        !loading &&
        hasMore
      ) {
        loadMoreItems();
      }
    },
    [loadMoreItems, loading, hasMore]
  );

  return (
    <VirtualList
      data={data}
      itemHeight={80}
      onScroll={handleScroll}
      renderItem={(item, index) => <div>{/* 渲染列表项 */}</div>}
      style={{ height: "600px" }}
    />
  );
}
```

### 2. 分组列表

```jsx
function GroupedListExample() {
  // 包含分组信息的数据
  const groupedData = [
    { type: "header", id: "group1", title: "分组1" },
    { type: "item", id: 1, text: "项目1-1" },
    { type: "item", id: 2, text: "项目1-2" },
    { type: "header", id: "group2", title: "分组2" },
    { type: "item", id: 3, text: "项目2-1" },
    // ...更多分组和项目
  ];

  return (
    <VirtualList
      data={groupedData}
      itemHeight={(item) => (item.type === "header" ? 40 : 60)} // 根据类型动态设置高度
      renderItem={(item, index) =>
        item.type === "header" ? (
          <div className="group-header">{item.title}</div>
        ) : (
          <div className="list-item">{item.text}</div>
        )
      }
      style={{ height: "600px" }}
    />
  );
}
```

## 常见问题解答

### Q: 为什么我的列表项没有正确渲染？

A: 确保设置了正确的容器高度，并且`itemHeight`属性值合理。同时检查`renderItem`函数是否正确返回了 React 节点。

### Q: 滚动时出现白屏怎么办？

A: 增加`overscan`的值，让组件在视口外渲染更多项目。通常设置为 5-10 比较合适。

### Q: 如何提高滚动流畅度？

A: 优化列表项的渲染复杂度，使用`React.memo`包装列表项组件，避免不必要的重渲染。考虑使用 CSS 硬件加速属性如`transform: translateZ(0)`。

## 注意事项

1. VirtualList 组件容器必须具有固定高度或可计算的高度。
2. 对于复杂的布局或高度变化频繁的场景，建议使用动态高度模式。
3. 滚动性能与列表项复杂度和数量直接相关。
4. 避免在滚动时执行复杂计算或频繁状态更新。
