import React from 'react';
import ReactDOM from 'react-dom/client';
import createGlobalStore from '../src/index';

export const useStore = createGlobalStore(
  { count: 0, name: 'Hello' },
  {
    increment: (state, setstate) => (name: string) => {
      if (name === 'foo') {
        setstate({ count: state.count + 4 });
      } else {
        setstate({ count: state.count + 2 });
      }
    },
  }
);

const Counter = () => {
  const [storeState, { setStoreState, actions }] = useStore(['count']); // Specify "count" to optimize rerendering

  return (
    <div>
      <p>Count: {storeState.count}</p>
      <button onClick={() => setStoreState({ count: storeState.count + 1 })}>
        Increment
      </button>
      <br />
      <button onClick={() => actions.increment()}>increment by action</button>
      <br />
      <button
        onClick={() => setStoreState(prev => ({ count: prev.count + 4 }))}
      >
        increment by prev
      </button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Counter />
  </React.StrictMode>
);
