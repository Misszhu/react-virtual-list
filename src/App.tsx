import VirtualList from './components/VirtualList/VirtualList';

function App() {
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Item ${i + 1}`
  }));

  return (
    <VirtualList
      data={data}
      itemHeight={50}
      overscan={5}
      renderItem={(item) => (
        <div style={{ height: 50, borderBottom: '1px solid #eee' }}>
          {item.text}
        </div>
      )}
      style={{ height: '100vh' }}
    />
  );
}

export default App;