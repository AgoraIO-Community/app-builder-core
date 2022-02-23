import React, { useContext } from 'react';
import { FpeApiInterface } from './typeDef';
import fpeConfig from 'test-fpe';
import { usePreCall } from '../src/components/precall/usePreCall';
import { useVideoCall } from '../src/pages/VideoCall/index';

const FpeContext: React.Context<FpeApiInterface> = React.createContext(fpeConfig);
//TODO:hari update any type
const useFpe = (selector: (fpeConfig: FpeApiInterface) => Partial<FpeApiInterface>) => {
  const fpe = useContext(FpeContext);
  return selector(fpe);
}

export {
  useFpe,
  usePreCall,
  useVideoCall
}
