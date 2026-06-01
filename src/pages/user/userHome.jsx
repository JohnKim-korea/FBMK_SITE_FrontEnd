import { Link, useLocation,useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/grid";
import "../../styles/customSwiper.css";
import { Navigation, Pagination, Grid } from "swiper/modules";
import { useEffect, useState, useMemo } from "react";
import { Alert, PasswordModal } from "../../components/common/Modal";
import { useAuth } from "../auth/MyAuthContext";
import { useBoardAuth } from "../auth/BoardAuthContext";
import { FetchTokenCheck } from "@/components/common/FetchTokenCheck";


function UserHome() {
  const location = useLocation();
  const { user, logout, adminUser, adminLogout, accessToken,setAccessToken} = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyWord] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("none");
  
  const [top18List, setTop18List] = useState([]);
  const [top5List, setTop5List] = useState([]);
  const keepBoard = location.state?.keepBoard || false;
  // 패스워드 모달
  const [showPasswordModal,setShowPasswordModal] = useState(false);
  const [selectBoardId, setSelectBoardId] = useState(0);
  const { authBoardMap, setAuthBoardMap } = useBoardAuth();
  

   const onSubmitPassword = async (password) => {
     try {
       const response = await fetch(
         `${import.meta.env.VITE_API_URL}/board/checkPassword`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
           },
           credentials: "include",
           body: JSON.stringify({
             board_id: selectBoardId,
             password,
           }),
         },
       );
       const data = await response.json();
       if (!data.check) {
         // 암호 불일치
         setShowPasswordModal(false);
         setShowModal(true);
         setModalText("암호가 일치하지않습니다.");
         setAlertState("error");
         setSelectBoardId(0);
         setAuthBoardMap((prev) => {
           const newMap = { ...prev }; // 기존 state 보호를 위하여 newMap을 만듬
           delete newMap[selectBoardId]; // delete명령어를 통해서 해당 객체 제거
           return newMap;
         });
       } else {
         // 암호 일치
         setAuthBoardMap((prev) => ({ ...prev, [selectBoardId]: true }));
         setShowPasswordModal(false);
         navigate(`/boardDetail/${selectBoardId}/none`);
       }
     } catch (error) {
       console.log(error);
       setShowPasswordModal(false);
       setShowModal(true);
       setModalText(error.status + ":" + error.message);
       setAlertState("error");
       setSelectBoardId(0);
       setAuthBoardMap((prev) => {
         const newMap = { ...prev };
         delete newMap[selectBoardId];
         return newMap;
       });
       return false;
     }
   };

   

const handlePasswordBoard = async (e, item) => {
  if (!item.hasPassword) {
    // 패스워드 없으면 바로 통과
    return;
  }
  e.preventDefault();
  try {
    if (adminUser) {
      const response = await fetch(
        `${import.meta.env.VITE_API_ADMIN}/adminCheck`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok) {
        const error = new Error(
          result ? result.message : "요청에 실패했습니다.",
        );
        error.status = response.status;
        throw error;
      }
      if (result.check) {
        navigate(`/boardDetail/${item.id}/none`);
        return;
      } else {
        setShowPasswordModal(false);
        setShowModal(true);
        setModalText("관리자가 아닙니다.");
        setAlertState("error");
      }
      return;
    }
    // 쿠키 인증 여부 확인 => useEffect로 따로 뺌
    if (authBoardMap[item.id]) {
      // 이미 인증한 게시글
      navigate(`/boardDetail/${item.id}/none`);
      return;
    } // 로그인 사용자 useEffect로 따로 뺌
    // authBoardMap에 인증받지 못했을때
    setShowPasswordModal(true);
    setSelectBoardId(item.id);
    return;
  } catch (error) {
    setShowPasswordModal(false);
    setShowModal(true);
    setModalText(error.status + ":" + error.message);
    setAlertState("error");
  }
};
  
  //const boardLists = [1,2,3,4,5,6,7,8,9,10,11,12,13]; // 임시데이터 데이터
  //const popularList = [1, 2]; // 임시데이터
  
 const showBoards = useMemo(() => {
   const maxSlots = 18;
   return [
     ...top18List,
     ...Array(Math.max(maxSlots - top18List.length, 0)).fill(null),
   ];
 }, [top18List]);

 const popularShowList = useMemo(() => {
   const maxSlots = 5;
   return [
     ...top5List,
     ...Array(Math.max(maxSlots - top5List.length, 0)).fill(null),
   ];
 }, [top5List]);

  const [userCount, setUserCount] = useState(0);
  const [boardCount, setBoardCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  
  // const handleWriteClick = (e) => { //게시글 작성하기 로직
  //   if (user && user.loginStatus === "BAN") {
  //     logout();
  //     setShowModal(true);
  //     setModalText("계정사용이 중지되었습니다.");
  //     setAlertState("none");
  //     return;
  //   }

  //   if (!user && !adminUser) {
  //     e.preventDefault();
  //     setShowModal(true);
  //     setModalText("로그인 후 작성할 수 있습니다.");
  //     setAlertState("none");
  //     return;
  //   }
  //   navigate("/boardWrite/write/none");
  // };

  const onHandleSearch = () => {
    if (!keyword.trim()) {
      setModalText("검색어를 입력해주세요!");
      setShowModal(true);
      return "";
    } else {
      navigate(`/boardList?q=${keyword}`);
    }
  };


  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/home/getHomeAllData`);
        const data = await res.json();

        setTop5List(data.top5List ?? []);
        setTop18List(data.top18List ?? []);

      } catch (e) {
        console.error("홈 데이터 오류:", e);
      }
    };
    fetchHomeData();
  }, []);
 
 useEffect(() => {
  const increaseProcess = async () => {
    try{
      const isVisited = document.cookie.includes("todayV=I_Visited_FreeBoardSite");
      if (!isVisited) {
        await fetch(`${import.meta.env.VITE_API_URL}/home/increaseVistCount`, { method: "POST" });
        const expire = new Date();
        expire.setHours(23, 59, 59, 999);
        document.cookie = `todayV=I_Visited_FreeBoardSite; expires=${expire.toUTCString()}; path=/`;
      }
      await fetchAll();
    }catch(e){
      console.error("증가 프로세스 오류 : ", e);
    }
  };

  const fetchAll = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/home/getAllCount`);
      const data = await res.json();
      setVisitCount(data.visitCount);
      setBoardCount(data.boardCount);
      setUserCount(data.userCount);
    } catch (e) {
      console.error("카운트 조회 오류 : ", e);
    }
  };
  
  increaseProcess();
  const twentySecondProcess = setInterval(fetchAll, 20000);
  return () => clearInterval(twentySecondProcess);
}, []);

  useEffect(() => {
    // 뒤로가기 제한
    const params = new URLSearchParams(location.search);
    const expireRouter = params.get("expireRouter");
    const expired = params.get("expire");
    const logoutState = params.get("logoutState");
    const loginState = params.get("loginState");
    const withdrawal = params.get("withdrawalState");
    const registerState = params.get("registerState");
    const adminLoginState = params.get("adminLoginState");
    const adminLogoutState = params.get("adminLogoutState");
    const suspended = params.get("suspended");
    const boardAuth = params.get("boardAuth");

    if (!(logoutState || expireRouter || expired || loginState || withdrawal ||registerState || adminLoginState || adminLogoutState || suspended || boardAuth)) return;

    if (expireRouter) {
       if (adminUser) {
         adminLogout();
       }
       
      if(user){
        logout();
      }
    }

    if(registerState){
      const alertState = location.state?.alertState;
      const modalText = location.state?.modalText;
      const showModal = location.state?.showModal;
      setShowModal(showModal);
      setModalText(modalText);
      setAlertState(alertState);
    }

    if (expireRouter || expired) {
      setShowModal(true);
      setModalText("로그인이 만료되었습니다. 다시 로그인해주세요.");
      setAlertState("none");
      logout();
    }
    
    if(suspended){
      setShowModal(true);
      setModalText("계정사용이 중지되었습니다.");
      setAlertState("none");
      logout();
    }

    if (withdrawal) {
      setShowModal(true);
      setModalText( `회원탈퇴가 완료되었습니다.\n${keepBoard ? "(작성하신 게시글은 유지됩니다.)" : "이용해주셔서 감사합니다."}`);
      setAlertState("success");
    }

    if(boardAuth) {
       setShowModal(true);
       setModalText("접근권한이 없습니다.");
       setAlertState("none");
    }

    const handlePopstate = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopstate); // 뒤로가기 앞으로가기를 감지하는 이벤트리스너
    // 뒤로가기 앞으로가기를 시작했을때 해당 함수를 실행 remove 해주기 전까지 계속 남아있음

    navigate(location.pathname, { replace: true }); // url 제거

    return () => {
      // clean up 언마운트(페이지 이동) 할때 실행
      window.removeEventListener("popstate", handlePopstate); // popstate 이벤트 리스너 제거
    };
  }, [location.search, navigate]);


   useEffect(() => {
     // 홈 게시글 인증 확인 로직
     const loadAuthCookie = async (list) => {
       await Promise.all(
         list.map(async (item) => {
           if (!item.hasPassword || authBoardMap[item.id]) {
             return;
           }
           try {
             const response = await fetch(
               `${import.meta.env.VITE_API_URL}/board/checkAuthCookie/${item.id}`,
               {
                 method: "GET",
                 credentials: "include",
               },
             );
             const checkAuthCookie = await response.json();

             if (checkAuthCookie.check) {
               setAuthBoardMap((prev) => ({
                 ...prev,
                 [item.id]: true,
               }));
             }
           } catch (error) {
             console.log(error);
           }
         }),
       );
     };

     const checkWriterAuth = async (list) => {
       if (!user || !list?.length) {
         return;
       }
       for (const item of list) {
         // 잠금글만 검사
         if (!item.hasPassword) {
           continue;
         }

         // 이미 인증된 게시글 제외
         if (authBoardMap[item.id]) {
           continue;
         }
         try {
           const res = await FetchTokenCheck(
             `${import.meta.env.VITE_API_URL}/board/checkWriter/${item.id}`,
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
           // 작성자면 접근 허용
           if (result.check) {
             setAuthBoardMap((prev) => ({
               ...prev,
               [item.id]: true,
             }));
           }
         } catch (error) {
           if (error.message === "Not_Refresh_Token") {
             navigate("/?expireRouter=true", {
               replace: true,
             });
             return;
           }
           setShowModal(true);
           setModalText(error.status + ":" + error.message);
           setAlertState("error");
           return;
         }
       }
     };

     if (top18List?.length > 0 && !adminUser) {
       loadAuthCookie(top18List);
       checkWriterAuth(top18List);
     }
     if (top5List?.length > 0 && !adminUser) {
       loadAuthCookie(top5List);
       checkWriterAuth(top5List);
     }
   }, [top18List, top5List, user, accessToken, adminUser]);

  return (
    <>
      <div className="container py-5">
        <section className="text-center mb-5">
          {/* <h1 className="fw-bold mb-3">🕊 자유게시판</h1> */}

          <img
            className="logo"
            src="/images/mainLogo.png"
            alt="No Results Found"
            style={{ width: "400px", opacity: 0.85 }}
          />

          <p className="text-muted">
            사소한 이야기부터 유용한 정보까지, 자유롭게 공유하며 함께 성장하는
            공간입니다
          </p>

          <div className="row justify-content-center pt-2 g-0">
            {/*g-0 가로세로 여백 지우기*/}
            <div className="input-group input-group-lg shadow-sm">
              <input
                type="text"
                className="form-control"
                placeholder="검색어를 입력하시오"
                value={keyword}
                onChange={(e) => setKeyWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onHandleSearch()}
              />
              <button
                className="btn text-white fw-bold"
                onClick={onHandleSearch}
                style={{ backgroundColor: "#00BFFF" }}
              >
                <i className="fa-solid fa-magnifying-glass me-2"></i>
                검색
              </button>
            </div>
          </div>
        </section>
        {/* <div className="row text-center my-5 stats-row fw-bold">
          <div className="col-md-4 stat-card">
            <h3>{userCount.toLocaleString()}명</h3>
            <p className="text-muted">총 회원</p>
          </div>
          <div className="col-md-4 stat-card">
            <h3>{boardCount.toLocaleString()}건</h3>
            <p className="text-muted">총 게시글</p>
          </div>
          <div className="col-md-4 stat-card">
            <h3>{visitCount.toLocaleString()}명</h3>
            <p className="text-muted">오늘 방문자</p>
          </div>
        </div> */}

        {/* 최신 글 미리보기 */}
        <section>
          <div className="d-flex justify-content-between">
            <h4 className="fw-bold mb-3">
              <i className="fa-solid fa-newspaper"></i> 최신 게시글
            </h4>
            <div>
              <button className="nav-btn prev-btn">
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <button className="nav-btn next-btn">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <Swiper
            className="board-swiper"
            modules={[Navigation, Pagination, Grid]}
            spaceBetween={16} // 카드 간격
            slidesPerView={3} // 한줄에 몇개 나열할지 정한다.
            navigation={{
              prevEl: ".prev-btn",
              nextEl: ".next-btn",
            }} // <- -> 화살표 버튼
            pagination={{ clickable: true }} // 아래 점
            grabCursor={true} // 마우스로 이동
            grid={{
              rows: 2, // 항상 2줄로 배치
              fill: "row", // 가로 먼저 채움 1,2,3 이런식으로 채운다.
            }}
            breakpoints={{
              0: { slidesPerView: 1, grid: { rows: 1 }, slidesPerGroup: 1 },
              768: { slidesPerView: 2, grid: { rows: 2 }, slidesPerGroup: 2 },
              1200: { slidesPerView: 3, grid: { rows: 2 }, slidesPerGroup: 3 },
              // 반응형 화면 크기 기준 (px)
            }}
          >
            {showBoards.map((item, i) => (
              <SwiperSlide
                key={item ? item.id : `empty-${i}`}
                className="d-flex"
              >
                <div
                  className={`card shadow-sm flex-fill`}
                  style={{ minHeight: "160px" }}
                >
                  {item ? (
                    // <Link
                    //   to={`/boardDetail/${item.id}/none`}
                    //   className="text-decoration-none text-dark"
                    // >
                    <Link
                      to={`/boardDetail/${item.id}/none`}
                      className="text-decoration-none text-dark"
                      onClick={(e) => handlePasswordBoard(e, item)}
                    >
                      <div
                        className={`card-body ${!adminUser && item.hasPassword && !authBoardMap[item.id] ? "locked-post" : ""}`}
                        style={{ backgroundColor: "#eef6ff" }}
                      >
                        {/* <h6
                          className="text-truncate"
                          style={{ maxWidth: "250px" }}
                        >
                          {item.title}
                        </h6> */}
                        {/* <p className="card-text small text-muted line-clamp-2"> 
                          {item.content_search}
                        </p> */}

                        <h6
                          className="text-truncate  fw-bold px-2 py-1"
                          style={{ maxWidth: "250px" }}
                        >
                          {item.title}

                          {!adminUser && item.hasPassword && (
                            <span
                              className="ms-1"
                              style={{
                                color: authBoardMap[item.id]
                                  ? "#198754"
                                  : "#d9534f",
                                fontSize: "13px",
                              }}
                              title={
                                authBoardMap[item.id]
                                  ? "인증 완료"
                                  : "잠금 게시글"
                              }
                            >
                              <i
                                className={`fa-solid ${
                                  authBoardMap[item.id]
                                    ? "fa-lock-open"
                                    : "fa-lock"
                                }`}
                              ></i>
                            </span>
                          )}
                        </h6>
                        <div
                          className="d-flex align-items-center gap-3  rounded"
                          style={{
                            backgroundColor: "#f5f9ff",
                            border: "1px solid #dbeafe",
                            minHeight: "100px",
                          }}
                        >
                          <div
                            className="px-2"
                            style={{
                              width: item.firstImg ? "220px" : "360px",
                              flexShrink: 0,
                            }}
                          >
                            <p className="card-text small text-muted mb-0 line-clamp-3 ">
                              {!adminUser &&
                              item.hasPassword &&
                              !authBoardMap[item.id] ? (
                                <span
                                  className="d-flex align-items-center"
                                  style={{
                                    gap: "0.5rem",
                                  }}
                                >
                                  <i
                                    className="fa-solid fa-user-lock mx-3"
                                    style={{
                                      fontSize: "25px",
                                      color: "#6094e2",
                                      display: "block",
                                      lineHeight: 1,
                                    }}
                                  ></i>
                                  게시글이 잠겨져있습니다.
                                </span>
                              ) : item.content_search?.trim() ? (
                                item.content_search
                              ) : (
                                "텍스트 내용이 없습니다."
                              )}
                            </p>
                          </div>

                          {!adminUser &&
                          item.hasPassword &&
                          !authBoardMap[item.id] ? (
                            "" // 이미지 없음
                          ) : item.firstImg ? (
                            <div
                              className="me-2"
                              style={{
                                width: "80px",
                                height: "80px",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={item.firstImg}
                                alt="썸네일"
                                className="w-100 h-100 rounded"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div
                      className="card-body empty-card d-flex align-items-center justify-content-center text-muted"
                      style={{
                        minHeight: "163px",
                        flexShrink: 0,
                      }}
                    >
                      게시글이 없습니다.
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/*인기 게시글 */}
        <section className="mt-5">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="fw-bold mb-3 col">
              <i className="fa-solid fa-fire text-danger me-2"></i>
              인기 게시글 TOP5
            </h4>
            {/* <button
              className="btn"
              style={{ backgroundColor: "#069cf344" }}
              onClick={handleWriteClick}
            >
            
              <i className="fa-solid fa-paper-plane me-2"></i>
              게시글 작성하기
            </button> */}
          </div>
          <ul className="list-group shadow-sm">
            {popularShowList.map((item, i) =>
              item ? (
                <Link
                  key={`empty-${i}`}
                  to={`/boardDetail/${item.id}/none`}
                  className="text-decoration-none text-dark"
                  onClick={(e) => handlePasswordBoard(e, item)}
                >
                  <li
                    className={`list-group-item d-flex justify-content-between 
                              ${!adminUser && item.hasPassword && !authBoardMap[item.id] ? "locked-post" : ""}`}
                  >
                    <span>
                      {item.title}
                      {!adminUser && item.hasPassword && (
                        <span
                          className="ms-1"
                          style={{
                            color: authBoardMap[item.id]
                              ? "#198754"
                              : "#d9534f",
                            fontSize: "13px",
                          }}
                          title={
                            authBoardMap[item.id] ? "인증 완료" : "잠금 게시글"
                          }
                        >
                          <i
                            className={`fa-solid ${
                              authBoardMap[item.id] ? "fa-lock-open" : "fa-lock"
                            }`}
                          ></i>
                        </span>
                      )}
                      {item.files && (
                        <span
                          className="ms-2 d-inline-flex align-items-center"
                          style={{
                            color: "#6094e2",
                            fontSize: "12px",
                            verticalAlign: "middle",
                          }}
                          title="첨부파일 있음"
                        >
                          <i className="fa-solid fa-paperclip"></i>
                        </span>
                      )}
                    </span>

                    {/* <span className="badge bg-danger">
                      조회수 {item.view_count.toLocaleString()}
                    </span> */}
                    <div className="d-inline-flex">
                      <span
                        className="badge me-1 d-inline-flex align-items-center gap-1"
                        style={{
                          background: "#6094e2",
                        }}
                      >
                        <i
                          className="fa-solid fa-thumbs-up"
                          style={{
                            fontSize: "13px",
                          }}
                        ></i>
                        {item.like_count.toLocaleString()}
                      </span>
                      {/* <span className="badge bg-danger">
                        👎 {item.dislike_count.toLocaleString()}
                      </span> */}
                    </div>
                  </li>
                </Link>
              ) : (
                <li
                  key={`empty-${i}`}
                  className="empty-card list-group-item d-flex justify-content-between"
                >
                  게시글이 없습니다.
                </li>
              ),
            )}
          </ul>
        </section>

        <section className="mt-5">
          {/* 제목 */}
          <div className="text-left mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-bar-chart-line fs-3"></i>
            <h4 className="fw-bold mb-0">커뮤니티 현황</h4>
          </div>

          {/* 통계 */}
          <div className="row text-center stats-row fw-bold me-4">
            <div className="col-md-4 stat-card">
              <h3>{userCount.toLocaleString()}명</h3>
              <p className="text-muted">총 회원</p>
            </div>

            <div className="col-md-4 stat-card">
              <h3>{boardCount.toLocaleString()}건</h3>
              <p className="text-muted">총 게시글</p>
            </div>

            <div className="col-md-4 stat-card">
              <h3>{visitCount.toLocaleString()}명</h3>
              <p className="text-muted">오늘 방문자</p>
            </div>
          </div>
        </section>
      </div>
      {showModal && (
        <Alert
          modalText={modalText}
          setShowModal={setShowModal}
          alertState={alertState}
          showModal={showModal}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          showPasswordModal={showPasswordModal}
          setShowPasswordModal={setShowPasswordModal}
          onSubmitPassword={onSubmitPassword}
        />
      )}
      {/* 모달 배경 */}
      {/* {showModal && <div className="modal-backdrop fade show"></div>} */}
    </>
  );
}

export default UserHome;
