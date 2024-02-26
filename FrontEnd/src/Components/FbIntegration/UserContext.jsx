// UserContext.js
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [fetchedUserInfo, setFetchedUserInfo] = useState({
    userFacebookId: "",
    accessToken: "",
  });

  return (
    <UserContext.Provider value={{ fetchedUserInfo, setFetchedUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
