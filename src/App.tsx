import VirtualList from './components/VirtualList/VirtualList';

interface Item {
  id: number;
  text: string;
}

function App() {
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`
  }));

  return (
    <VirtualList<Item>
      data={data}
      itemHeight={50}
      overscan={2}
      renderItem={(item) => (
        <div
          style={{
            height: '50px',
            borderBottom: '1px solid #3a3a3a',
            padding: '20px',
            background: '#fff',
            boxSizing: 'border-box',
          }}
        >
          {item.text}
        </div>
      )}
      style={{
        height: '100vh',
        overflow: 'auto'
      }}
    />
  );
}

export default App;