import React, {createContext, useContext, useState, useEffect} from 'react';
import {UserActionMenuItemsConfig} from 'customization-api';

interface UserActionMenuContextType {
  userActionMenuItems: UserActionMenuItemsConfig;
  updateUserActionMenuItems: React.Dispatch<
    React.SetStateAction<UserActionMenuItemsConfig>
  >;
}

const UserActionMenuContext = createContext<UserActionMenuContextType>({
  userActionMenuItems: {},
  updateUserActionMenuItems: () => {},
});

export const UserActionMenuProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [userActionMenuItems, updateUserActionMenuItems] =
    useState<UserActionMenuItemsConfig>({});

  return (
    <UserActionMenuContext.Provider
      value={{userActionMenuItems, updateUserActionMenuItems}}>
      {children}
    </UserActionMenuContext.Provider>
  );
};

export const useUserActionMenu = () => useContext(UserActionMenuContext);
