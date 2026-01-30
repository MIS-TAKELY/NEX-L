import { createContext } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const value = {};

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
