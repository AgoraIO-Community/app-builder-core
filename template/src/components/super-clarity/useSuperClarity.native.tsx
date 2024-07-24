import React from 'react';
import {createHook} from 'customization-implementation';

type SuperClarityContextValue = {
  superClarityOn: boolean;
  setSuperClarityOn: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SuperClarityContext =
  React.createContext<SuperClarityContextValue>({
    superClarityOn: false,
    setSuperClarityOn: () => {},
  });

const SuperClarityProvider: React.FC = ({children}) => {
  const [superClarityOn, setSuperClarityOn] = React.useState<boolean>(false);
  return (
    <SuperClarityContext.Provider value={{superClarityOn, setSuperClarityOn}}>
      {children}
    </SuperClarityContext.Provider>
  );
};

const useSuperClarity = createHook(SuperClarityContext);

export {SuperClarityProvider, useSuperClarity};
