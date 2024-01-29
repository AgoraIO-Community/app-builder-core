import {createHook} from 'customization-implementation';
import {createContext, useState} from 'react';

interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  return (
    <chatConfigureContext.Provider value={{open, setOpen}}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
