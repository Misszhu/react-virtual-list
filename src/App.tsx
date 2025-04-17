import VirtualList from './components/VirtualList/VirtualList';

function App() {
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`
  }));

  return (
    <VirtualList
      data={data}
      itemHeight={200}
      overscan={2}
      renderItem={(item) => (
        <div
          style={{
            height: '200px',
            borderBottom: '1px solid #eee',
            padding: '20px',
            background: '#fff'
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