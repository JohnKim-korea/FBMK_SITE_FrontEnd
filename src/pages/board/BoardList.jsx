import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { useState, React, useCallback, useEffect} from "react";
import {PageNavigator,PageSelctor} from "@/components/common/usePageNavigator";
import { useAuth } from "../auth/MyAuthContext";
import { useBoardAuth } from "../auth/BoardAuthContext";
import { Alert,PasswordModal } from "@/components/common/Modal";
import { FetchTokenCheck } from "@/components/common/FetchTokenCheck";

function BoardList() {
  const {user,logout,adminUser,accessToken,setAccessToken} = useAuth();
  const jsonData = useLoaderData();
  const navigate = useNavigate();
  //현재 경로가 /board?page=2&pageSize=10 라면 navigate(""); 이면 주소는 /board 이렇게 변홤
  //navigate("/boardList"); 이런식으로 (/)절대경로를 붙이면 절대경로기준으로 이동함 
  const [searchParams] = useSearchParams(); // URL에있는 파라미터값 읽기
  // URL 기준으로 값 읽기
  // 생각해보니까 어처피 loader가 다시 실행되서 state로 안해도 될거같음
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const order = searchParams.get("order") || "";
  const q = searchParams.get("q") || ""; // url에서 받아온것
  const qw = searchParams.get("qw") || ""; // url에서 받아온것
  const [inputQW, setInputQW] = useState(qw); // 이건 state에 저장한이유 조건을 설정하고 검색버튼을 눌러야 하니까
  const [inputQ, setInputQ] = useState(q);

  const list = jsonData.boardList;
  const totalPage = jsonData.totalPage || 0;
  const totalCount = jsonData.totalCount || 0;
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("none");
  const [notice, setNotice] = useState(searchParams.get("notice") || false);
  // 패스워드 모달
  const [showPasswordModal,setShowPasswordModal] = useState(false);
  const [selectBoardId, setSelectBoardId] = useState(0);
  const { authBoardMap, setAuthBoardMap } = useBoardAuth();

   const isNew = (date) => {
      const created = new Date(date).getTime() - 9 * 60 * 60 * 1000;
     const now = new Date();
     const diff = now - created;
     const oneDay = 1000 * 60 * 60 * 24 * 1;
     return diff < oneDay;
   };

   const handleWriteClick = (e) => {
    if(user && user.loginStatus === 'BAN'){
       logout();
       setShowModal(true);
       setModalText("계정사용이 중지되었습니다.");
       setAlertState("none");
       return
    }

     if (!user && !adminUser) {
       e.preventDefault();
       setShowModal(true);
       setModalText("로그인 후 작성할 수 있습니다.");
       setAlertState("none");
       return;
     }
     navigate("/boardWrite/write/FreeBoardList");
   };

  // 페이지 변경
  const changePage = (newPage) => {
    navigate(`?page=${newPage}&pageSize=${pageSize}&q=${inputQ}&qw=${inputQW}&order=${order}&notice=${notice}`);
  };

  // 페이지 사이즈 변경
  const changePageSize = (newSize) => {
    navigate(`?page=1&pageSize=${newSize}&q=${inputQ}&qw=${inputQW}&order=${order}&notice=${notice}`);
  };

  const changeOrder = (e) => {
    const newOrder = e.target.value;
    navigate(`?page=1&pageSize=${pageSize}&q=${inputQ}&qw=${inputQW}&order=${newOrder}&notice=${notice}`);
  }

  // 검색
  const handleSearch = () => {
    navigate(`?page=1&pageSize=${pageSize}&q=${inputQ}&qw=${inputQW}&order=${order}&notice=${notice}`);
  };

  useEffect(() => {
    setInputQ(q);
    setInputQW(qw);
  }, [q, qw]);

  useEffect(() => { // 프론트에서도 페이지를 조정함
    if (page > totalPage && totalPage > 0) {
      navigate(`?page=${totalPage}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}&notice=${notice}`, {
        replace: true,
      });
    }
  }, [page, totalPage]);


  useEffect(() => {
    // 게시글 인증 확인 로직
    const loadAuthCookie = async () => {
      for (const item of list) {
        if (!item.hasPassword || authBoardMap[item.id]) {
          continue;
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
      }
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
    if (list?.length > 0 && !adminUser) {
      loadAuthCookie();
      checkWriterAuth(list);
    }
  }, [list, user, accessToken, adminUser]);

  const removeNotice = () => {
    const newNotice = !notice;
    setNotice(prev => !prev);
    navigate(`?page=${1}&pageSize=${10}&qw=""&order=""&notice=${newNotice}`);
  }

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
      if (!data.check) { // 암호 불일치
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
        setAuthBoardMap((prev) => ({...prev, [selectBoardId]: true,}));
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
    if (!item.hasPassword) { // 패스워드 없으면 바로 통과
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
  
  //replace: true 는 기존 주소를 새 주소로 덮어써서 뒤로가기에 남지 않게 만드는 옵션

  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1">
              <i className="bi bi-journal-text me-2 text-primary fs-3"></i>
              자유게시판
            </h4>
            <small className="text-muted">
              다양한 이야기를 자유롭게 나눠보세요.
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="fw-semibold mb-1">댓글 정책</div>
                <div>· 익명 사용자: 댓글 작성일로 부터 30일 후 자동 삭제</div>
                <div>
                  · 로그인 사용자: 댓글 작성일로 부터 180일 후 자동 삭제
                </div>
              </div>
            </small>
          </div>
          <button
            onClick={handleWriteClick}
            className="btn mt-auto"
            style={{ backgroundColor: "#069cf344" }}
          >
            <i className="fa-solid fa-paper-plane me-2"></i> 게시글 작성하기
          </button>
        </div>
      </div>
      {/* 검색 옵션 */}
      <div className="row mb-4 align-items-center">
        {/* 왼쪽 */}
        <div className="col-md-5 d-flex gap-3 align-items-center">
          <select
            className="form-select shadow-sm"
            style={{ maxWidth: "180px" }}
            value={order}
            onChange={changeOrder}
          >
            <option value="">최신순</option>
            <option value="old">오래된순</option>
            <option value="view">조회수순</option>
            <option value="comment">댓글순</option>
            <option value="like">추천순</option>
          </select>

          <PageSelctor
            pageSize={pageSize}
            onChangeSelector={(e) => changePageSize(Number(e.target.value))}
          />
        </div>

        {/* 오른쪽 */}
        <div className="col-md-7 d-flex justify-content-end align-items-center gap-3">
          {/*공지사항 제거 */}
          <label className="fw-normal text-muted d-flex align-items-center mt-3">
            <input
              type="checkbox"
              className="me-2"
              checked={notice}
              onChange={removeNotice}
            />
            공지사항 제외
          </label>

          <small className="text-muted fw-bold mt-3">
            검색결과 : <strong>{totalCount.toLocaleString()}</strong> 건
          </small>
          <select
            className="form-select shadow-sm"
            style={{ maxWidth: "130px" }}
            value={inputQW}
            onChange={(e) => setInputQW(e.target.value)}
          >
            <option value="">전체</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="writer_name">작성자</option>
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="input-group shadow-sm"
            style={{ maxWidth: "280px" }}
          >
            <input
              type="text"
              value={inputQ}
              className="form-control"
              placeholder="검색어를 입력하세요"
              onChange={(e) => setInputQ(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </form>
        </div>
      </div>

      {/* 테이블 */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="table-responsive">
          {list && list.length > 0 ? (
            <table className="table align-middle mb-0 table-hover">
              <thead className="custom-table-head text-center">
                <tr>
                  <th style={{ width: "8%" }}>번호</th>
                  <th style={{ width: "44%" }} className="text-start">
                    제목
                  </th>
                  <th style={{ width: "12%" }}>작성자</th>
                  <th style={{ width: "12%" }}>작성일</th>
                  <th style={{ width: "12%" }}>수정일</th>
                  <th style={{ width: "12%" }}>조회수</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`text-center ${!adminUser && item.hasPassword && !authBoardMap[item.id] ? "locked-post" : ""}`}
                  >
                    <td> {index + ((page - 1) * pageSize + 1)}</td>
                    <td className="text-start fw-semibold d-flex">
                      <Link
                        to={`/boardDetail/${item.id}/none`}
                        className="text-decoration-none text-dark"
                        onClick={(e) => handlePasswordBoard(e, item)}
                      >
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "350px" }}
                        >
                          {item.title}
                        </div>
                      </Link>

                      {/* 관리자 */}
                      {/* {item.writer_id === -100 && (
                        <span className="badge ms-2 admin-badge">공지사항</span>
                      )} */}

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

                      {/* 첨부파일 아이콘 */}
                      {item.files && (
                        <span
                          className="ms-2"
                          style={{
                            color: "#6094e2",
                            fontSize: "13px",
                          }}
                          title="첨부파일 있음"
                        >
                          <i className="fa-solid fa-paperclip"></i>
                        </span>
                      )}

                      {item.roleUser === "Role_Admin" && (
                        <span className="badge ms-2 admin-badge">공지사항</span>
                      )}

                      {/* HOT 표시 */}
                      {item.like_count - item.dislike_count > 2 && (
                        <span className="badge bg-danger ms-2">HOT</span>
                      )}

                      {/* NEW 표시  */}
                      {isNew(item.create_day) && (
                        <span className="badge bg-success ms-2">NEW</span>
                      )}

                      {/* 댓글 수 */}
                      {item.comment_count > 0 && (
                        <span
                          className="text-muted ms-2"
                          style={{ fontSize: "12px" }}
                        >
                          댓글 [{item.comment_count.toLocaleString()}]
                        </span>
                      )}
                    </td>

                    <td>{item.writer_name}</td>

                    <td className="text-center">
                      {item.create_day?.substring(0, 10)}
                    </td>
                    <td className="text-center">
                      {item.update_day?.substring(0, 10)}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        👁 {item.view_count.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="d-flex flex-column align-items-center py-5">
              <img
                src="/images/noData.jpg"
                alt="No Results Found"
                style={{ width: "240px", opacity: 0.85 }}
              />
              <h5 className="mt-4 fw-semibold">데이터가 없습니다.</h5>
              <p>다시한번 확인해보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPage > 0 && (
        <PageNavigator
          page={page}
          totalPage={totalPage}
          changePage={changePage}
        />
      )}

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
    </div>
  );
}
export default BoardList;
