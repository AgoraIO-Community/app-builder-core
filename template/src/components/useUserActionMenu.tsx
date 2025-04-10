import React, {createContext, useContext, useState, useEffect} from 'react';
import {
  UidType,
  UserActionMenuItemsConfig,
  DispatchContext,
  useLayout,
} from 'customization-api';
import {
  getGridLayoutName,
  getPinnedLayoutName,
} from '../pages/video-call/DefaultLayouts';

interface UserActionMenuContextType {
  userActionMenuItems: UserActionMenuItemsConfig;
  updateUserActionMenuItems: React.Dispatch<
    React.SetStateAction<UserActionMenuItemsConfig>
  >;
  pinForEveryone: (uid: UidType) => void;
  unPinForEveryone: () => void;
}

const UserActionMenuContext = createContext<UserActionMenuContextType>({
  userActionMenuItems: {},
  updateUserActionMenuItems: () => {},
  pinForEveryone: () => {},
  unPinForEveryone: () => {},
});

export const UserActionMenuProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [userActionMenuItems, updateUserActionMenuItems] =
    useState<UserActionMenuItemsConfig>({});
  const {dispatch} = useContext(DispatchContext);
  const {setLayout} = useLayout();

  const pinForEveryone = (uid: UidType) => {
    dispatch({
      type: 'UserPin',
      value: [uid],
    });
    setLayout(getPinnedLayoutName());
  };

  const unPinForEveryone = () => {
    dispatch({
      type: 'UserPin',
      value: [0],
    });
    setLayout(getGridLayoutName());
  };

  return (
    <UserActionMenuContext.Provider
      value={{
        userActionMenuItems,
        updateUserActionMenuItems,
        pinForEveryone,
        unPinForEveryone,
      }}>
      {children}
    </UserActionMenuContext.Provider>
  );
};

export const useUserActionMenu = () => useContext(UserActionMenuContext);
