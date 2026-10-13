import { createContext, useContext, useMemo, useState, useEffect } from "react";


const AllBoardAuthProvider = createContext(null);

export function BoardAuthProvider({ children }) {
  const [authBoardMap, setAuthBoardMap] = useState({});
  const [authStudyMap, setAuthStudyMap] = useState({});// 신규추가
  

  const value = useMemo(() => {
    return {
      authBoardMap,
      setAuthBoardMap,
      authStudyMap,
      setAuthStudyMap,
    };
  }, [authBoardMap, authStudyMap]);


  return (
    <AllBoardAuthProvider.Provider value={value}>
      {children}
    </AllBoardAuthProvider.Provider>
  );
}

export const useBoardAuth = () => useContext(AllBoardAuthProvider);