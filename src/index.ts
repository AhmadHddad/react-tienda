import { EventBus, includeKeys, isObject, has, joinObjects } from 'hd-utils';
import React, { useCallback, useMemo, useState } from 'react';

// In case the react version doesn't support useLayoutEffect
const useEffect = React.useLayoutEffect || React.useEffect;

function newObjWithKeys<T>(
  keyList: string[],
  mappedToObj: Record<string, unknown>
) {
  const newObj: Record<string, unknown> = {};

  keyList.forEach((key: string) => {
    newObj[key] = mappedToObj[key];
  });
  return newObj as T;
}

type SetGlobalStateOptions = Partial<{
  override: boolean;
}>;

type SharedConfigs = Partial<{
  shallowCompareOnSetState: boolean;
}>;

type GlobalStoreConfig = Partial<{}> & SharedConfigs;

type HookOptions = {
  resetStoreState: (all?: boolean) => void;
};

type HookConfigs = Partial<{}> & SharedConfigs;

type HookResultOptions<T> = { comparer: (oldState: T, newState: T) => boolean };

type SetState<T> = (
  s: Partial<T> | ((oldState: T) => Partial<T>),
  options?: HookResultOptions<T>
) => void;

type Actions<Y extends string | number | symbol, T> = Record<
  Y,
  (state: T, setStoreState: SetState<T>) => (...args: any) => void
>;

type HookSecond<T, Y extends string | number | symbol> = {
  setStoreState: SetState<T>;
  actions: Record<Y, (...args: any) => void>;
} & HookOptions;

type HookResult<T, Y extends string | number | symbol> = [T, HookSecond<T, Y>];

const UPDATE_STATE_EVENT = 'UPDATE_STATE';

/**
 * @description Will create a global store where state is shared among components that use the returned hook that can be used to set and get the state.
 * @advanced You can enter the global (store scope) state using useStore.getGlobalState() or set the global state useStore.setGlobalState
 * @author https://github.com/AhmadHddad
 * @example export const useStore = createGlobalStore({a:1, b:2});
 * @example export useStore.subscribe((state => {console.log("state is updated", state)})) //subscribe to the store with external callbacks;
 * @returns hook that is used to connect the component with the store.
 * its its really recommended to specify the used store keys in the returned hook (as list of strings) to reduce the component rerendering.
 * @example const Component = () => {
 * const [storeState, setStoreState] = useStore(["a"]);
 *
 * return <button onClick={()=> setStoreState({a:3})}>Click me</button>
 * }
 */
export default function createGlobalStore<
  T extends Record<string, unknown>,
  A extends Actions<string, T>
>(
  initState: T = {} as T,
  actions: A = {} as A,
  storeConfigs?: GlobalStoreConfig
) {
  if (!isObject(initState)) {
    throw new Error('Error: The initial state should be of type object');
  }

  const oldState = { ...initState };

  let storeState = {
    ...initState,
  } as T;

  const storeBus = new EventBus();

  type Keys = keyof typeof storeState;
  type ActionKeys = keyof typeof actions;

  function useStore(
    select?: Keys[],
    hookConfigs?: HookConfigs
  ): HookResult<T, ActionKeys> {
    const { shallowCompareOnSetState } = hookConfigs || {};
    const [componentState, setComponentState] = useState<T>(
      Array.isArray(select)
        ? newObjWithKeys<T>(select as string[], storeState)
        : storeState
    );

    const shallowCompare =
      shallowCompareOnSetState ?? storeConfigs?.shallowCompareOnSetState;

    useEffect(() => {
      const handleStateChange = (updatedState: T) => {
        const newState: Partial<T> = {};

        for (const key in updatedState) {
          if (has(componentState, key)) {
            newState[key] = updatedState[key];
          }
        }

        if (Object.keys(newState).length === 0) {
          return;
        }
        storeState = joinObjects(storeState, newState);

        setComponentState((prev: T) => ({ ...prev, ...newState }));
      };

      storeBus.subscribe(UPDATE_STATE_EVENT, handleStateChange);

      return () => {
        storeBus.unsubscribe(UPDATE_STATE_EVENT, handleStateChange);
      };
    }, []);

    const updateState: SetState<T> = useCallback(
      (newState, options?) => {
        if (typeof newState === 'function') {
          const updatedState = newState(componentState);
          if (!isObject(updatedState)) {
            throw new Error(
              'Error: The return type should be object with the new state'
            );
          }

          storeBus.publish(UPDATE_STATE_EVENT, updatedState);
        } else {
          if (!isObject(newState)) {
            throw new Error(
              'Error: The updated state should be of type object or function'
            );
          }

          const isEqual =
            options?.comparer &&
            options.comparer(componentState, newState as T);

          if (isEqual) {
            return;
          }

          if (shallowCompare) {
            const keyList = select || Object.keys(componentState);
            keyList.forEach(key => {
              if (componentState[key] === newState[key]) {
                delete newState[key];
              }
            });
          }

          storeBus.publish(UPDATE_STATE_EVENT, newState);
        }
      },
      [componentState, select, shallowCompare]
    );

    const resetStoreState: HookOptions['resetStoreState'] = useCallback(
      all => {
        const newState =
          !all && select ? includeKeys(oldState, select as string[]) : oldState;

        storeBus.publish(UPDATE_STATE_EVENT, newState);
      },
      [select]
    );

    const actionsMemo: Record<
      ActionKeys,
      (...args: any[]) => void
    > = useMemo(() => {
      const newActions: any = {};

      for (const actionKey in actions) {
        if (Object.prototype.hasOwnProperty.call(actions, actionKey)) {
          const action = actions[actionKey];
          newActions[actionKey] = action(storeState, updateState);
        }
      }

      return (newActions as unknown) as Record<
        ActionKeys,
        (...args: []) => void
      >;
    }, [actions, updateState]);

    return [
      componentState,
      useMemo(
        () => ({
          setStoreState: updateState,
          actions: actionsMemo,
          resetStoreState,
        }),
        [actionsMemo, resetStoreState]
      ),
    ];
  }

  useStore.setGlobalState = function (
    newState: Partial<T>,
    options?: SetGlobalStateOptions
  ) {
    if (options?.override) {
      storeState = joinObjects(storeState, newState);
    }

    storeBus.publish(UPDATE_STATE_EVENT, newState);
  };

  useStore.getGlobalState = () => storeState;

  useStore.subscribe = (callback: (state: T) => void) => {
    storeBus.subscribe(UPDATE_STATE_EVENT, callback);
  };

  return useStore;
}
