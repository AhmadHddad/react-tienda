# React Tienda - Light Weight Global State Management

React Tienda is a simple, light weight yet powerful tool for managing global state in React applications. It allows you to easily share state between components using hooks, minimizing prop drilling and reducing the complexity of passing data between deeply nested components.

*One of the big advantages is the ease of use, its very similar to using the normal useState.*

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

You can create a global store using the `createGlobalStore` function, which accepts an initial state object.

```js
import createGlobalStore from "react-tienda";

export const useStore = createGlobalStore({ count: 0, name: "Hello" });
```

The `createGlobalStore` function generates a hook (`useStore`) that components can use to connect with the global state.

### Example

```js
// store.js
import createGlobalStore from "react-tienda";

// Create a global store with initial values
export const useStore = createGlobalStore({ count: 0, name: "Hello" });
```

```js
// Component.js
import React from "react";
import { useStore } from "./store";

const Counter = () => {
  const [storeState, setStoreState] = useStore(["count"]); // Specify "count" to optimize rerendering

  return (
    <div>
      <p>Count: {storeState.count}</p>
      <button onClick={() => setStoreState({ count: storeState.count + 1 })}>
        Increment
      </button>
    </div>
  );
};

export default Counter;
```

### Global State Access

For advanced use cases, you can directly access or modify the global state using the following methods:

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

#### `createGlobalStore(initialState)`

- **Description**: Creates a global store where state is shared among components.
- **Parameters**: 
  - `initialState` (*object*): The initial state of the global store.
  
- **Returns**: 
  - A custom hook that allows components to access and update the state.
  
#### **Example**:

```js
export const useStore = createGlobalStore({ a: 1, b: 2 });
```

---

#### `useStore([keys])`

- **Description**: A hook returned from `createGlobalStore`. Use this to access or update the global state.
- **Parameters**: 
  - `keys` (*Array of strings*): A list of keys from the global store that the component cares about, which reduces unnecessary rerenders.
  
- **Returns**: 
  - A tuple: the current state and a setter function to update the state.

#### **Example**:

```js
const Component = () => {
  const [storeState, setStoreState] = useStore(["a"]);

  return (
    <button onClick={() => setStoreState({ a: 3 })}>Click me</button>
  );
};
```

---

### License

This project is licensed under the MIT License.


