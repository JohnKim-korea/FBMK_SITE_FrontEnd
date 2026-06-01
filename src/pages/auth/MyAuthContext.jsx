import { createContext, useContext, useMemo, useState, useEffect } from "react";


/*
  전역 인증 상태를 담을 Context 생성
  createContext(null)의 null은 기본값 (Provider 밖에서 접근하면 null 반환)
*/
const MyAuthContext = createContext(null);

/*
  AuthProvider 컴포넌트
  이 컴포넌트로 감싸진 모든 하위 컴포넌트는
  AuthContext에 접근할 수 있게 된다.
*/
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminUser,setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  
  const initAuth = async () => {
    try {
      const hasLoginState = document.cookie.includes("loginState=1");
      if (!hasLoginState) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        if(errorData.message === "Not_Refresh_Token"){
          logout();
        }

        if (errorData.message === "suspanded_member") {
          setUser((prev) => ({
            ...prev,
            loginStatus: "BAN",
          }));
        }
        setAuthLoading(false);
        return;
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.userVO);
    }finally {
      setAuthLoading(false);
    }
  };


  const adminInitAuth = async () => {
    try {
      const hasAdminLogin = document.cookie.includes("adminLoginState=1");

      if (!hasAdminLogin) {
        setAdminUser(null);
        setAdminLoading(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_ADMIN}/check`, {
        credentials: "include",
      });

      if (!res.ok) {
        setAdminUser(null);
        return;
      }

      const data = await res.json();
      setAdminUser(data);
    } catch {
      setAdminUser(null);
    } finally {
      setAdminLoading(false);
    }
  };

  const checkLoginStateCookie = () => {
    let hasLoginState = document.cookie.includes("loginState=1");
    if(user && !hasLoginState){
       document.cookie = "loginState=1; path=/;";
    }
  };

  useEffect(() => {
    if (user) {
      checkLoginStateCookie();
    }
  }, [user]);

  // useEffect(() => {
  //   initAuth();
  //   adminInitAuth();
  // }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };


  const logout = async () => {
   // google?.accounts?.id.disableAutoSelect(); // 해당페이지에서 자동로그인 무효화
   if (window.google?.accounts?.id) {
     window.google.accounts.id.disableAutoSelect();
   } 
   
   try { // 쿠키 리프레쉬 제거 , DB에도 제거
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.log("logout Error", error.message);
    }
    document.cookie = "loginState=; path=/; max-age=0";
    setUser(null);
    setAccessToken(null);
  };

  const adminLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_ADMIN}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("로그아웃 실패");
      }
      setAdminUser(null);
      document.cookie = "adminLoginState=; path=/; max-age=0;";
    } catch (err) {
      console.error(err);
    }
  };

  const value = useMemo(() => {
    return {
      user,
      accessToken,
      login,
      logout,
      authLoading,
      setAccessToken,
      setUser,
      adminUser,
      setAdminUser,
      adminLoading,
      adminLogout,
      initAuth,
      adminInitAuth,
      checkLoginStateCookie,
    };
  }, [user, accessToken, adminUser, authLoading, adminLoading]); // 이렇게 하면 user , 접근토큰이 바뀔때만 value 객체만 새로 생성됨

  return ( // provider는 특별한 컴포넌트 이므로 다른 컴포넌트처럼 props.value 이런식으로 쓰이지 않고  실제로는 React Context 시스템이 내부적으로 관리를한다.
    <MyAuthContext.Provider value={value}>  {/*Provider -> 값을 공급  useContext 값 소비*/}
      {children}
    </MyAuthContext.Provider> //AuthContext.Provider 를 써야 createContext(null) 이 함수와 연결된다.
  );
}

export const useAuth = () => useContext(MyAuthContext);
/*
    AuthContext.Provider
    value에 담긴 객체가
    하위 모든 컴포넌트에서 공유된다.

    같은 Context 객체에 Provider가 여러 개 있으면
    값을 공급하는 “범위(scope)”가 달라질 뿐이다.

    공유되는 값:
      user         → 현재 로그인 사용자
      accessToken  → API 인증용 토큰
      login        → 로그인 함수
      logout       → 로그아웃 함수

    중요!! 
    Context 상태가 바뀌면 useContext()를 호출하는 컴포넌트만 리랜더링된다. 

  */

/*
  useAuth 커스텀 훅
  useContext(AuthContext)를 감싼 편의 함수

 useContext(AuthContext)를 쓰면
 AuthProvider의 value에 넣어둔 것만 사용할 수 있다.
 export는 코드 공유
 Context는 상태 공유
*/

