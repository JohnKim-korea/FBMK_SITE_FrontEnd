import { createBrowserRouter, redirect,RouterProvider } from "react-router-dom";
import Layout from "./components/layout/Layout";
import UserHome from "./pages/user/userHome";
import BoardList from "./pages/board/BoardList";
import BoardWrite from "./pages/board/BoardWrite";
import BoardDetail from "./pages/board/BoardDetail";
import ErrorPage from "./components/layout/ErrorPage";
import MyBoardList from "./pages/board/myBoardList";
import LoginInfo from "./pages/auth/LoginInfo";
import MyPage from "./pages/user/MyPage"; 
import MyCommentList from "./pages/board/MyCommentList";
import { useMemo } from "react";
import { useAuth } from "./pages/auth/MyAuthContext";
import { FetchTokenCheck } from "./components/common/FetchTokenCheck";
import MyReactionList from "./pages/board/MyReactionList";
import BoardManager from "./pages/admin/BoardManager";
import IpManager from "./pages/admin/IpManager";
import IpWrite from "./pages/admin/IpWrite";
import MemberManager from "./pages/admin/MemberManager";
import CommentManager from "./pages/admin/CommentManager";
import NotificationWrite from "./pages/admin/NotificationWrite";
//createBrowserRouter는 URL이 바뀌면 해당 route의 loader를 다시 실행하는 기능을 기본으로 가지고있다. 
//즉 useNavigate를 이용하여 URL을 바꿀때 자동으로 loader를 다시실행해서 페이징및 검색기능을 이용할수있다. 에초에 UseEffect 와 트리거가 다르다.
/*
useNavigate를 이용하여 페이징을 처리할때 
1. 새로고침해도 유지
2. 뒤로가기 정상 동작
3. 링크 공유 가능
4. 검색 상태 유지

useState로 페이징할때 
새로고침시 다 초기화됨

랜더링에 대해서 자꾸 햇갈림
1️⃣ “렌더링된다”의 진짜 의미

React에서 렌더링 = 함수가 다시 실행된다 이다.
2️⃣ 그런데 DOM이 다 다시 그려지느냐? 아니다.
React는:
함수 실행 → JSX 생성
이전 Virtual DOM과 비교
바뀐 부분만 실제 DOM 수정
🔹 React.memo
props가 안 바뀌면 컴포넌트 렌더 자체를 막는다
🔹 useCallback
자식에게 넘기는 함수 참조값이 바뀌지 않게 해줌
*/

function AppRouter() {
const { setAccessToken, accessToken, adminUser,logout } = useAuth();

const router = useMemo(
  () =>
    createBrowserRouter([
      {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <UserHome />,
          },
          {
            path: "admin/CommentManager",
            element: <CommentManager />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
            
                const res = await fetch(
                  `${import.meta.env.VITE_API_ADMIN}/getAllCommentData?page=${page}&pageSize=${pageSize}&qw=${qw}&q=${q}&order=${order}`,
                  { credentials: "include" },
                );

                if (!res.ok) {
                  const errorData = await res.json();
                  const errorMessage = errorData.message || res.statusText;
                  throw new Response(errorMessage, {
                    status: res.status,
                  });
                }
                return await res.json();
            },
          },
          {
            path: "admin/MemberManager",
            element: <MemberManager />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
              const res = await fetch(
                `${import.meta.env.VITE_API_ADMIN}/getMembersData?page=${page}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}`,
                { credentials: "include" },
              );

              if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || res.statusText;
                throw new Response(errorMessage, {
                  status: res.status,
                });
              }
              return await res.json();
            },
          },
          {
            path: "admin/ipManager",
            element: <IpManager />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
              const res = await fetch(
                `${import.meta.env.VITE_API_ADMIN}/getIpListData?page=${page}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}`,
                { credentials: "include" },
              );

              if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || res.statusText;
                throw new Response(errorMessage, {
                  status: res.status,
                });
              }
              return await res.json();
            },
          },
          {
            path: "admin/boardManager",
            element: <BoardManager />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
              const res = await fetch(
                `${import.meta.env.VITE_API_ADMIN}/boardManager?page=${page}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}`,
                { credentials: "include" },
              );

              if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || res.statusText;
                throw new Response(errorMessage, {
                  status: res.status,
                });
              }

              return await res.json();
            },
          },
          {
            path: "boardList", // 이주소는 서버호출과 별개로 진행된다. boot에서는 무조건 데이터를 가져오는것에만 초점을 맞춰야한다.
            element: <BoardList />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1; //   || 왼쪽값이 거짓(0)일때 오른쪽값반환 && 왼쪽값이 참일때 오른쪽값 반환
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
              const notice = url.searchParams.get("notice") || false;

              const res = await fetch(
                `${import.meta.env.VITE_API_URL}/board/getBoardData?page=${page}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}&notice=${notice}`,
              );
              /*
              http://localhost:5173/boardList?page=1&pageSize=10&q=&qw= 처음 Link로 들어왔을때 주소가 이렇게 안보이는 이유는 
              nevigate()를 이용해서 안들어왔기 때문이다.
              */

              if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.message || res.statusText;
                throw new Response(errorMessage, {
                  status: res.status,
                });
              }
              // 반응 객체들이 원래부터 가지고있는 속성
              // res.status; // 404
              // res.statusText; // "Not Found"
              // res.ok; // false
              // res.headers;
              // res.json();

              return await res.json();
            },
          },
          {
            // 등록
            path: "boardWrite/:gubun/:kind",
            element: <BoardWrite />,
          },
          {
            // 수정
            path: "boardWrite/:gubun/:kind/:id",
            element: <BoardWrite />,
            loader: async ({ params }) => {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL}/board/getBoard/${params.id}`,
              );

              if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = res.statusText || errorData.message;
                throw new Response(errorMessage, {
                  status: res.status,
                });
              }
              return await res.json();
            },
          },
          {
            // 상세페이지
            path: "boardDetail/:id/:kind",
            element: <BoardDetail />,
            loader: async ({ params }) => {
              const res = await fetch(
                `${import.meta.env.VITE_API_URL}/board/getBoard/${params.id}`,
              );

              if (!res.ok) {
                throw new Response("삭제된 게시글입니다.", { status: 404 });
              }
              return await res.json();
            },
          },
          {
            path: "login/myBoardList",
            element: <MyBoardList />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
              try {
                const res = await FetchTokenCheck(
                  `${import.meta.env.VITE_API_URL}/board/getMyBoardData?page=${page}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}`,
                  {
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
                  setAccessToken,
                );
                if (!res.ok) {
                  const errorData = await res.json();
                  const errorMessage = res.statusText || errorData.message;
                  throw new Response(errorMessage, {
                    status: res.status,
                  });
                }
                return await res.json();
              } catch (error) {
                if (error.message === "Not_Refresh_Token") {
                  // loader에서는 navigate를 사용할 수 없기 때문에 redirect 사용                  
                  throw redirect("/?expireRouter=true"); // 로그아웃을 쓰면 안될거같음
                }

                if (error.message === "suspanded_member") {
                  logout(); // FetchTokenCheck 타이밍 문제
                  throw redirect("/?suspended=true");
                }
                throw error;
              }
            },
          },
          {
            path: "loginInfo",
            element: <LoginInfo />,
          },
          {
            path: "/login/myPage",
            element: <MyPage />,
            loader: async () => {
              try {
                const res = await FetchTokenCheck(
                  `${import.meta.env.VITE_API_URL}/board/getNoticeList`,
                  {
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
                  setAccessToken,
                );

                if (!res.ok) {
                  const errorData = await res.json();
                  const errorMessage = res.statusText || errorData.message;
                  throw new Response(errorMessage, {
                    status: res.status,
                  });
                }
                return await res.json();
              } catch (error) {
                if (error.message === "Not_Refresh_Token") {
                  throw redirect("/?expireRouter=true");
                }

                if (error.message === "suspanded_member") {
                  logout(); // FetchTokenCheck 타이밍 문제
                  throw redirect("/?suspended=true");
                }
                throw error;
              }
            },
          },

          {
            path: "/login/myComments",
            element: <MyCommentList />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const order = url.searchParams.get("order") || "";
              try {
                const res = await FetchTokenCheck(
                  `${import.meta.env.VITE_API_URL}/board/getMyCommentData?page=${page}&pageSize=${pageSize}&qw=${qw}&q=${q}&order=${order}`,
                  {
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
                  setAccessToken,
                );
                if (!res.ok) {
                  const errorData = await res.json();
                  const errorMessage = res.statusText || errorData.message;
                  throw new Response(errorMessage, {
                    status: res.status,
                  });
                }
                return await res.json();
              } catch (error) {
                if (error.message === "Not_Refresh_Token") {
                  throw redirect("/?expireRouter=true"); //리다이렉트로 던진다.
                }

                if (error.message === "suspanded_member") {
                  logout(); // FetchTokenCheck 타이밍 문제
                  throw redirect("/?suspended=true");
                }
                throw error;
              }
            },
          },
          {
            path: "/login/ReactionList",
            element: <MyReactionList />,
            loader: async ({ request }) => {
              const url = new URL(request.url);
              const page = url.searchParams.get("page") || 1;
              const pageSize = url.searchParams.get("pageSize") || 10;
              const q = url.searchParams.get("q") || "";
              const qw = url.searchParams.get("qw") || "";
              const filter = url.searchParams.get("filter") || "";
              const order = url.searchParams.get("order") || "";
              try {
                const res = await FetchTokenCheck(
                  `${import.meta.env.VITE_API_URL}/board/getMyReactionList?page=${page}&pageSize=${pageSize}&qw=${qw}&q=${q}&order=${order}&filter=${filter}`,
                  {
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
                  setAccessToken,
                );
                if (!res.ok) {
                  const errorData = await res.json();
                  const errorMessage = res.statusText || errorData.message;
                  throw new Response(errorMessage, {
                    status: res.status,
                  });
                }
                return await res.json();
              } catch (error) {
                if (error.message === "Not_Refresh_Token") {
                  throw redirect("/?expireRouter=true"); //리다이렉트로 던진다.
                }

                if (error.message === "suspanded_member") {
                  logout(); // FetchTokenCheck 타이밍 문제
                  throw redirect("/?suspended=true");
                }
                throw error;
              }
            },
          },
        ],
      },
      {
        path: "admin/ipWrite",
        element: <IpWrite />,
        loader: async ({ request }) => {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (!id) return null;
          const res = await fetch(
            `${import.meta.env.VITE_API_ADMIN}/getIpData?id=${id}`,
            { credentials: "include" },
          );
          return await res.json();
        },
      },
      {
        path: "admin/NotificationWrite/:id",
        element: <NotificationWrite />,
      },
    ]),
  [accessToken, adminUser],
);

  return <RouterProvider router={router} />;
}

export default AppRouter;
