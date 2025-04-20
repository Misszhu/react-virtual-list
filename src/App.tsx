import VirtualList from './components/VirtualList/VirtualList';

interface Item {
  id: number;
  text: string;
  description: string;
  expanded: boolean;
}

function App() {
  // 生成包含不同内容长度的数据
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`,
    description: `This is a ${i % 3 === 0 ? 'long' : 'short'} description for item ${i + 1}. ${i % 3 === 0
      ? 'It contains multiple lines of text to demonstrate dynamic height rendering. ' +
      'Some items might be taller than others depending on their content.'
      : ''
      }`,
    expanded: false
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Virtual List with Dynamic Heights</h1>
      <VirtualList<Item>
        data={data}
        itemHeight={60} // 最小高度
        overscan={2}
        renderItem={(item) => (
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #eee',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{item.text}</h3>
            <p style={{
              margin: 0,
              lineHeight: '1.5',
              color: '#666',
            }}>
              {item.description}
            </p>
          </div>
        )}
        style={{
          height: 'calc(100vh - 100px)',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'auto'
        }}
      />
    </div>
  );
}

export default App;