import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/custom.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/styles/study.css"; // 2026-08-22 추가함 
import "ckeditor5/ckeditor5.css";
import { Link, useLocation,useNavigate } from "react-router-dom";
import { useAuth } from "@/pages/auth/MyAuthContext";
import { useBoardAuth } from "@/pages/auth/BoardAuthContext";
import { useEffect } from "react";
import { FetchTokenCheck } from "../common/FetchTokenCheck";

function Header() {
  const { user, logout, adminUser, adminLogout,accessToken,setAccessToken } = useAuth();
  const { authBoardMap, setAuthBoardMap } = useBoardAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const moveHome = location.pathname.startsWith("/login/");
  const adminMoveHome = location.pathname.startsWith("/admin/");
  

  const logoutBoardAuthCheck = async () => {
    if (!authBoardMap || Object.keys(authBoardMap).length === 0) {
      return;
    }
    try {
      const boardIds = Object.keys(authBoardMap);
      for (const boardId of boardIds) {
        
        
        const res = await FetchTokenCheck(
          `${import.meta.env.VITE_API_URL}/board/checkWriter/${boardId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${accessToken}`,
            },
          },
          setAccessToken,
        );
        const result = await res.json();
        if (!res.ok) {
          const error = new Error(
            result ? result.message : "요청에 실패했습니다.",
          );
          error.status = res.status;
          throw error;
        }
        // 작성자 게시글이면 제거
        if (result.check) {
          setAuthBoardMap((prev) => {
            const newMap = {
              ...prev,
            };
            delete newMap[boardId];
            return newMap;
          });
        }
      }
    } catch (error) {
      if (error.message === "Not_Refresh_Token") {
        setAuthBoardMap({});
        navigate("/?expireRouter=true", {
          replace: true,
        });
        return;
      }
      console.log(error);
    }
  };

  const logoutHandle = async (e) => {
    e.preventDefault();
    if (user) {
      await logoutBoardAuthCheck();
        logout();
    }
    if (adminUser) {
        adminLogout();
    }
    if (moveHome || adminMoveHome) {
      if (adminMoveHome) {
        navigate("/?adminLogoutState=true", { replace: true });
      } else if (moveHome) {
        navigate("/?logoutState=true", { replace: true });
      }
    }
  };

   useEffect(() => {
      const syncAuthBoard = async () => {
        if (!authBoardMap || Object.keys(authBoardMap).length === 0) {
          return;
        }
        const boardIds = Object.keys(authBoardMap);
        for (const boardId of boardIds) {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/board/checkAuthCookie/${boardId}`,
              {
                method: "GET",
                credentials: "include",
              },
            );
  
            const result = await response.json();
  
            if (!result.check) {
              setAuthBoardMap((prev) => {
                const newMap = { ...prev };
                delete newMap[boardId];
                return newMap;
              });
            }
          } catch (error) {
            console.log(error);
          }
        }
      };
      syncAuthBoard();
    }, [location.pathname]);


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary-light">
      <div className="container-fluid">
        {/* 로고 중앙 */}
        <Link
          className="navbar-brand position-absolute start-50 translate-middle-x fw-bold"
          to="/"
        >
          <img
            src="/images/mainLogo.png"
            alt="No Results Found"
            style={{
              display: "block",
              width: "180px",
              opacity: 0.85,
              marginBottom: "5px",
            }}
          />
        </Link>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="navbar-toggler border-white border-2 ms-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse ms-3" id="navMenu">
          {/* 왼쪽 메뉴 */}
          <ul className="navbar-nav fw-bold me-auto">
            {/* <li className="nav-item">
              <Link
                className="nav-link text-white d-flex align-items-center gap-2"
                to="/"
              >
                <i className="fa-solid fa-house"></i>
                Home
              </Link>
            </li> */}

            <li className="nav-item">
              <Link
                className="nav-link text-white d-flex align-items-center gap-2"
                to="/boardList"
              >
                <i className="fa-solid fa-file-lines"></i>
                자유게시판
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className="nav-link text-white d-flex align-items-center gap-2"
                to="/study"
              >
                <i className="fa-solid fa-book-open"></i>
                학습도우미 (개발중...)
              </Link>
            </li>

            {/* <li className="nav-item">
              <span className="nav-link text-white d-flex align-items-center gap-2">
                <i className="fa-solid fa-book-open"></i>
                학습도우미 (개발중...)
              </span>
            </li> */}

            {/* {adminUser || user ? (
              <li className="nav-item">
                <button
                  className="nav-link text-white d-flex align-items-center gap-2"
                  onClick={logoutHandle}
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  로그아웃
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link
                  className="nav-link text-white d-flex align-items-center gap-2"
                  to="/loginInfo"
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  로그인
                </Link>
              </li>
            )} */}
          </ul>

          {/* 오른쪽 메뉴 */}
          {(adminUser || user) && (
            <div className="nav-item dropdown">
              {adminUser ? (
                <>
                  <a
                    className="nav-link dropdown-toggle text-white d-flex align-items-center gap-2 me-4"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <i
                      className="fa-solid fa-user"
                      style={{ color: "yellow" }}
                    ></i>
                    관리자님 환영합니다.
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/admin/ipManager">
                        <i className="fa-solid fa-shield-halved me-2"></i> IP
                        관리
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/admin/boardManager">
                        <i className="fa-solid fa-pen-to-square me-2"></i>
                        게시글 관리
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="dropdown-item"
                        to="/admin/CommentManager"
                      >
                        <i className="fa-solid fa-comment-dots me-2"></i> 댓글
                        관리
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/admin/MemberManager">
                        <i className="fa-solid fa-user-gear me-2"></i> 회원 관리
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={logoutHandle}
                      >
                        <i className="fa-solid fa-right-from-bracket me-2"></i>{" "}
                        로그아웃
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <a
                    className="nav-link dropdown-toggle text-white d-flex align-items-center gap-2 me-4"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fa-solid fa-user"></i>
                    {user.is_read_count > 0 && (
                      <span className="badge bg-danger ms-2">
                        <i className="fas fa-bell "></i>
                        {user.is_read_count.toLocaleString()}
                      </span>
                    )}
                    {user.writer_name}님 환영합니다.
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/login/myPage">
                        <i className="fa-solid fa-user me-2"></i> 마이페이지
                        {user.is_read_count > 0 && (
                          <span className="badge bg-danger ms-2">
                            {user.is_read_count.toLocaleString()}
                          </span>
                        )}
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/login/myBoardList">
                        <i className="fa-solid fa-pen-to-square me-2"></i> 내가
                        쓴 게시글
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/login/myComments">
                        <i className="fa-solid fa-comment-dots me-2"></i> 나의
                        댓글들
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/login/ReactionList">
                        <i className="fa-solid fa-thumbs-up me-2"></i> 좋아요 &
                        싫어요
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={logoutHandle}
                      >
                        <i className="fa-solid fa-right-from-bracket me-2"></i>{" "}
                        로그아웃
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </div>
          )}

          {adminUser || user ? (
            <div className="nav-item ms-2 me-4">
              <button
                className="nav-link text-white d-flex align-items-center gap-2"
                onClick={logoutHandle}
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                로그아웃
              </button>
            </div>
          ) : (
            <div className="nav-item me-4">
              <Link
                className="nav-link text-white d-flex align-items-center gap-2"
                to="/loginInfo"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


export default Header;
