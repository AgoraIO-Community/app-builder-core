import React, {useContext} from 'react';

function createHook<T>(context: React.Context<T>){ 
  function useContextWithSelector<U>(contextSelector:(data: T) => U): U ;
  function useContextWithSelector(): T;
  function useContextWithSelector<U>(contextSelector?:(data: T) => U): U | T { 
    const data = useContext(context);
    return contextSelector ? contextSelector(data) : data
  }
  return useContextWithSelector;
}
export default createHook