Got it! I'll add the extra method for updating the state using a previous state callback in the documentation. Here's the revised version:

---

# React Tienda - Lightweight Global State Management

<div style="display:flex; justify-content:center; padding-bottom:16px;">
<img src="https://github.com/AhmadHddad/react-tienda/blob/main/icon.jpg?raw=true" alt="react-tienda icon" width="256px" height="256px"/>
</div>

React Tienda is a simple, lightweight yet powerful tool for managing global state in React applications. It allows you to easily share state between components using hooks, minimizing prop drilling and reducing the complexity of passing data between deeply nested components.

*One of the big advantages is the ease of use, as it's very similar to using the normal `useState` hook.*

## Introduction

React Tienda's `createGlobalStore` function helps you create a **global store** where the state is shared across all components that utilize the store. The state is managed using a hook, and you can access or modify the global state with ease.

### Features:
- **Global state**: Create a global store that can be shared among multiple components.
- **State access**: Use hooks to get and set the state in your components.
- **Selective rerendering**: Specify the keys of the store you want to watch to minimize unnecessary component rerenders.
- **Global scope management**: Directly access or modify the global state outside of the React component lifecycle.

## Installation

To get started, install the package using npm or yarn:

```bash
npm install react-tienda
```

or

```bash
yarn add react-tienda
```

## Usage

### Creating a Global Store

You can create a global store using the `createGlobalStore` function, which accepts an initial state object and optional actions.

```js
import createGlobalStore from "react-tienda";

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
```

The `createGlobalStore` function generates a hook (`useStore`) that components can use to connect with the global state.

### Example

```js
// store.js
import createGlobalStore from "react-tienda";

// Create a global store with initial values and actions
export const useStore = createGlobalStore(
  { count: 0, name: "Hello" },
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
```

```js
// Component.js
import React from "react";
import { useStore } from "./store";

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

export default Counter;
```

### Different Methods for Updating State

In this `Counter` component, the global `count` state is updated in three different ways:

1. **Direct state manipulation**:  
   `setStoreState({ count: storeState.count + 1 })` updates the state directly by passing in the updated object.

2. **Using actions**:  
   `actions.increment()` updates the state by dispatching an action, where the action logic is predefined in the global store.

3. **Using a previous state callback**:  
   `setStoreState(prev => ({ count: prev.count + 4 }))` uses a functional update to calculate the next state based on the previous state, which is useful when you need to ensure the update is applied in a race condition-free manner.

### Global State Access - Advanced (Rare Use Cases)

For advanced and rare use cases, you can directly access or modify the global state using the following methods:

- **`useStore.getGlobalState()`**: Get the entire global state outside a React component.
- **`useStore.setGlobalState(updates)`**: Set the global state outside a React component.

```js
// Access the entire global state
const currentState = useStore.getGlobalState();

// Update the global state outside of a component
useStore.setGlobalState({ name: "New Name" });
```

### Optimizing Rerendering

To prevent unnecessary rerendering, it's recommended to specify the store keys that your component is interested in when using the `useStore` hook. This helps React to only rerender components when the relevant pieces of state change.

```js
// Only rerender when "count" changes
const [storeState, setStoreState] = useStore(["count"]);
```

## Advanced Usage

- **Accessing global scope**: Use `useStore.getGlobalState()` to fetch the global state, and `useStore.setGlobalState()` to update it outside of a React component.
- **Minimizing rerenders**: Always pass the keys of the store that your component is concerned with as an array to `useStore`.

---

### API

#### `createGlobalStore(initialState, actions?, storeConfigs?)`

- **Description**: Creates a global store where state is shared among components, with optional actions and configurations.
- **Parameters**: 
  - `initialState` (*object*): The initial state of the global store.
  - `actions?` (*object*): An optional object of actions, where each key is a function to modify the state.
  - `storeConfigs?` (*object*): Optional store configurations.
  
- **Returns**: 
  - A custom hook that allows components to access and update the state, and an object containing the available actions.
  
#### **Example**:

```js
export const useStore = createGlobalStore({ a: 1, b: 2 }, {
  increment: (state, setstate) => () => {
    setstate({ a: state.a + 1 });
  }
});
```

---

#### `useStore([keys])`

- **Description**: A hook returned from `createGlobalStore`. Use this to access or update the global state.
- **Parameters**: 
  - `keys` (*Array of strings*): A list of keys from the global store that the component cares about, which reduces unnecessary rerenders.
  
- **Returns**: 
  - A tuple: the current state, a setter function to update the state, and an object containing any defined actions.

#### **Example**:

```js
const Component = () => {
  const [storeState, { setStoreState, actions }] = useStore(["a"]);

  return (
    <button onClick={() => setStoreState({ a: 3 })}>Click me</button>
  );
};
```

---

### License

This project is licensed under the MIT License.

