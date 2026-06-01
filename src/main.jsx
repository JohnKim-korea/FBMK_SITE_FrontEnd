import { createRoot } from 'react-dom/client'
import AppRouter from './AppRouter.jsx'
import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from "@/pages/auth/MyAuthContext";
import { BoardAuthProvider } from './pages/auth/BoardAuthContext.jsx';
<script src="https://accounts.google.com/gsi/client" async defer></script>;

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_API_G_CLIENT_ID}>
    <AuthProvider>
      <BoardAuthProvider>
        <AppRouter />
      </BoardAuthProvider>
    </AuthProvider>
  </GoogleOAuthProvider>,
);

//taskkill /F /IM node.exe : 현재 실행중인 node.exe를 강제종료코드
// 리액트는 웬만해서 document 잘 안건드림 document 건드리는건 jquery 사고 임
// 건드릴때 
// //input에 포커스 주기
// 스크롤 이동
// 외부 라이브러리 연동
/*
React.memo 가 뭐냐?
컴포넌트 리렌더를 막아주는 함수
부모가 리렌더되어도
props가 안 바뀌면 자식은 다시 렌더 안 함

useCallback 사용할때
1. react.memo 와 같이 쓸때  
해당  onClick 함수 () => {} 익명함수는 매번 함수의 주소가 바뀌기 때문에 react.memo가 의미가 없어짐 그래서 useCallback을 사용함
const Child = React.memo(({ onClick }) => {
  ...
});
const handleClick = useCallback(() => {
  ...
}, []);


2. 자식이 많고 렌더 비용이 클 때

리스트가 매우 많음
자식 컴포넌트가 무거움
불필요한 리렌더를 막고 싶을 때

3. useEffect 의존성 배열에 함수가 들어갈 때
useEffect(() => {
  doSomething();
}, [doSomething]);

👉 doSomething이 매번 새로 만들어지면
👉 effect가 계속 실행됨
👉 useCallback으로 고정 필요

*/