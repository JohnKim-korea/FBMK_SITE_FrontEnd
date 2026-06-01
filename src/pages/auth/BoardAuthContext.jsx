import { createContext, useContext, useMemo, useState, useEffect } from "react";


const AllBoardAuthProvider = createContext(null);

export function BoardAuthProvider({ children }) {
  const [authBoardMap, setAuthBoardMap] = useState({});
  

  const value = useMemo(() => {
    return {
      authBoardMap,
      setAuthBoardMap,
    };
  }, [authBoardMap]);


  return (
    <AllBoardAuthProvider.Provider value={value}>
      {children}
    </AllBoardAuthProvider.Provider>
  );
}

export const useBoardAuth = () => useContext(AllBoardAuthProvider);