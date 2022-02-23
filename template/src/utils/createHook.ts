import React, {useContext} from 'react';

type contextDataType = React.Context<any>;

const createHook = (context: contextDataType)=> {
  return (selector: (data: contextDataType) => Partial<contextDataType>) => {
    return selector(useContext(context));
  }
}
export default createHook;