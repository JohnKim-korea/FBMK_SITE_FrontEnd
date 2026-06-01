import React, { useState } from "react";
import { useAuth } from "../auth/MyAuthContext";
import { useEffect } from "react";
import { useNavigate, useLoaderData, useRevalidator } from "react-router-dom";
import { Alert,Confirm } from "@/components/common/Modal";
import { FetchTokenCheck } from "@/components/common/FetchTokenCheck";


function MyPage() {
  const { user,logout,authLoading,setUser,accessToken,setAccessToken} = useAuth();
  const navigate = useNavigate();
  const writer_name = user?.writer_name || "";
  const email = user?.email || "";
  const create_day = user?.create_day || "";
  const picture = user?.picture || null;
  const loaderList = useLoaderData();
  const [noticeList, setNoticeList] = useState(loaderList);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");


  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [keepBoard,setKeepBoard] = useState(false);
  const [hostFunction,setHostFunction] = useState("");
  const [boardExist, setBoardExist] = useState(true);
  const [isUpdateName,setIsUpdateName] = useState(false);
  const [newName,setNewName] = useState("");
  const { revalidate } = useRevalidator();

  const getTime = (date) => {
    // UTC → KST 꼬인 거 강제로 맞춤 9시간 밀리초 차이
    const created = new Date(date).getTime() - 9 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const diff = now - created;

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;

    if (diff < 0) return "방금 전";
    if (diff < minute) return "방금 전";
    if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
    if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
    return `${Math.floor(diff / day)}일 전`;
  };

  

  const readAllNotice = async(e) => {
    e.preventDefault();
    try{
      if(noticeList.filter((n) => n.is_read === 0).length === 0){
         setShowModal(true);
         setModalText(noticeList.length === 0 ? "읽을 알림이 없습니다.":"이미 모든 알림을 보셨습니다.");
         setAlertState("none");
         return;
      }
      const res = await FetchTokenCheck(
        `${import.meta.env.VITE_API_URL}/board/readAllNotice`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
        setAccessToken,
      );

      if(!res.ok){
       const data = await res.json();
       const error = new Error(data?.message || "전체읽음에 실패하였습니다.");
       error.status = res.status;
       throw error;
      }

      setUser(prev => {return {...prev, is_read_count : 0}})
      setNoticeList(prev => {
        return prev.map(item => {return {...item,is_read : 1}})
      });
    }catch(error){
      if (error.message === "Not_Refresh_Token") {
        navigate("/?expireRouter=true", { replace: true });
        return;
      }

       if (error.message === "suspanded_member") {
        logout(); 
         navigate("/?suspended=true", { replace: true });
         return;
       }
      
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
      return;
    }
  }

  const readNotice_admin = async(item) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/board/searchBoard`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      },
    ); 
    const { bool } = await res.json();

    if (bool === false) {
      if(item.board_id === null){
         setUser((prev) => ({
           ...prev,
           is_read_count:
             prev.is_read_count > 0 && item.is_read === 0
               ? prev.is_read_count - 1
               : prev.is_read_count,
         }));
         setNoticeList((prev) => {
          return prev.map((item2) => {
            if(item.id === item2.id){
              return {...item2,is_read: 1};// 기존값 유지
            }
            return item2;
          });
          
         });

        return;
      }
      setShowModal(true);
      setModalText("이미 삭제된 게시물이거나 삭제된 댓글입니다.");
      setAlertState("none");
      return;
    }

     setUser((prev) => ({
       ...prev,
       is_read_count:
         prev.is_read_count > 0 && item.is_read === 0
           ? prev.is_read_count - 1
           : prev.is_read_count,
     }));

    navigate(`/boardDetail/${item.board_id}/myBoardList`);
  }

  const readNotice = async (item) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/board/searchPage`,
        {
          method : "POST",
          headers : {
            "Content-Type" : "application/json",
          },
          body: JSON.stringify(item),
        }
    );

    const data = await res.json();
    const page = data.page;
    const parent_id = data.parent_id;

    setUser((prev) => ({
      ...prev,
      is_read_count: (prev.is_read_count > 0 && item.is_read === 0) ? prev.is_read_count - 1 :  prev.is_read_count,
    }));


    if(page === 0 || page === undefined){
      setShowModal(true);
      setModalText("이미 삭제된 게시물이거나 삭제된 댓글입니다.");
      setAlertState("none");
      return;
    }

   navigate(
     `/boardDetail/${item.board_id}/myBoardList?page=${page}${
       parent_id ? `&parent_id=${parent_id}`:''  
    }#${
       item.type === "comment"
         ? `commentView-${item.comment_id}`
         : `replyView-${item.comment_id}`
     }`,
   );
  };

   const handleConfirmResult = (isConfirmed) => {
     setShowConfirm(false);
     if (isConfirmed && hostFunction === "allNoticeDelete") {
        allNoticeDelete(true);
     }else if (isConfirmed && hostFunction === "withdrawalUser") {
        withdrawalUser(true);
     }else if (isConfirmed && hostFunction === "updateName") {
        updateName(true);
     } else {
       if (!isConfirmed) {
         
         return;
       }
       setShowModal(true);
       setModalText("ConfirmResult함수 오류 발생!!");
       setAlertState("error");
     }
   };

    const updateName = async (isConfirm = false) => {
      if (!newName || newName.trim().length < 2 || newName.trim().length > 10) {
        setShowModal(true);
        setModalText("이름은 2~10자로 입력해주세요.");
        setAlertState("error");
        return;
      }

       if (!isConfirm) {
         setShowConfirm(true);
         setButtonType("update");
         setConfirmText("이름을 변경하시겠습니까?");
         setHostFunction("updateName");
         return;
       }
      try {
        const res = await FetchTokenCheck(
          `${import.meta.env.VITE_API_URL}/auth/updateName`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              updateName: newName,
            }),
          },
          setAccessToken,
        );

        if (!res.ok) {
          const data = await res.json();
          const error = new Error(
            data?.message || "이름을 변경하는데 실패하였습니다.",
          );
          error.status = res.status;
          throw error;
        }

        setShowModal(true);
        setModalText("이름변경이 완료되었습니다.");
        setAlertState("none");
        setUser((prev) => {
          return { ...prev, writer_name: newName };
        });
        revalidate();
        setNewName("");
        
      } catch (error) {
        if (error.message === "Not_Refresh_Token") {
          navigate("/?expireRouter=true", { replace: true });
          return;
        }

        if (error.message === "suspanded_member") {
          logout();
          navigate("/?suspended=true", { replace: true });
          return;
        }

        setShowModal(true);
        setModalText(error.status + ":" + error.message);
        setAlertState("error");
        return;
      }
    };

  const allNoticeDelete = async (isConfirm = false) => {
    if (!isConfirm) {
      setButtonType("delete");
      setConfirmText("알림을 전부 삭제하시겠습니까?");
      setShowConfirm(true);
      setHostFunction("allNoticeDelete");
      return;
    }
    try {
      const res = await FetchTokenCheck(
        `${import.meta.env.VITE_API_URL}/board/allNoticeDelete`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
        setAccessToken,
      );

      if (!res.ok) {
        const data = await res.json();
        const error = new Error(data?.message || "전체삭제에 실패하였습니다.");
        error.status = res.status;
        throw error;
      }

      setUser((prev) => {
        return { ...prev, is_read_count: 0 };
      });
      setNoticeList([]);
    } catch (error) {
      if (error.message === "Not_Refresh_Token") {
        navigate("/?expireRouter=true", { replace: true });
        return;
      }

       if (error.message === "suspanded_member") {
        logout(); 
         navigate("/?suspended=true", { replace: true });
         return;
       }
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
    }
  };

  const logoutHandle = (e) => {
    e.preventDefault();
    logout();
    navigate("/?logoutState=true", { replace: true });
  };

     useEffect(() => { // 뒤로가기 제한 
       if (user && user.loginStatus === "BAN") {
         navigate("/?suspended=true", { replace: true });
         return;
       }
       
      if (!authLoading && !user) {
         navigate("/?expireRouter=true", { replace: true });
       }
     }, [user, authLoading, navigate]);

const withdrawalUser = async (isConfirm = false) => {
  
  if(!isConfirm){
     setButtonType("delete");
     setConfirmText(
       keepBoard
         ? "게시글을 남긴채 회원탈퇴를 하시겠습니까?\n(첨부파일과 잠금설정은 제거됩니다)"
         : "회원탈퇴를 하시겠습니까?",
     );
     setShowConfirm(true);
     setHostFunction("withdrawalUser");
     return;
  }
  try {
    const res = await FetchTokenCheck(
      `${import.meta.env.VITE_API_URL}/auth/withdrawal`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ keepBoard }),
      },
      setAccessToken,
    );

    if (!res.ok) {
      const data = await res.json();
      const error = new Error(data?.message || "회원탈퇴에 실패하였습니다.");
      error.status = res.status;
      throw error;
    }

    logout();

    navigate("/?withdrawalState=true", {
      replace: true,
      state: { keepBoard: keepBoard },
    });
  } catch (error) {
    if (error.message === "Not_Refresh_Token") {
      navigate("/?expireRouter=true", { replace: true });
      return;
    }
    setShowModal(true);
    setModalText(error.status + ":" + error.message);
    setAlertState("error");
    return;
  }
};

useEffect(()=>{
  if(!accessToken) {
    return;
  }
  const getBoardExist = async () => { // 게시판 존재 여부
    const res = await FetchTokenCheck(
      `${import.meta.env.VITE_API_URL}/auth/getBoardExist`,
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
    const data = await res.json();
    setBoardExist(data);
  };
  getBoardExist();
},[accessToken]);
  
  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <img
          src={picture}
          alt="profile"
          className="rounded-circle"
          width="100"
          height="100"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 사용자 정보 */}
      <div className="d-flex justify-content-center align-items-start gap-4 mb-4">
        <div style={{ width: "190px" }}>
          <div>
            <strong>이름</strong> : {writer_name}
            <button
              className="update-toggle-btn ms-2"
              onClick={() => {
                setIsUpdateName((prev) => !prev);
                setNewName("");
              }}
            >
              이름 변경
            </button>
          </div>

          {isUpdateName && (
            <div className="d-flex align-items-center gap-3 mt-2">
              <input
                type="text"
                className="form-control"
                style={{ width: "300px" }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="변경할 이름 입력하세요"
              />

              <button
                type="button"
                className="update-name-btn flex-shrink-0"
                onClick={(e)=>{
                  e.preventDefault();
                  updateName();
                }}
              >
                변경
              </button>
            </div>
          )}
        </div>

        <div>
          <strong>이메일</strong> : {email}
        </div>

        <div>
          <strong>가입일</strong> : {create_day.substring(0, 10)}
        </div>
      </div>

      {/* 알림 */}
      <div className="notification-box">
        <div className="notification-header d-flex justify-content-between align-items-center">
          <span>
            <i
              className="fa-solid fa-bell"
              style={{ color: "#f59f00", marginRight: "10px" }}
            ></i>
            알림
          </span>

          <span className="small text-muted">
            안읽은 건수 :
            <span className="ms-1 text-danger fw-bold">
              {noticeList.filter((n) => n.is_read === 0).length}
            </span>{" "}
            건
          </span>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary notification-read-all-btn"
              onClick={readAllNotice}
            >
              전체 읽음
            </button>

            <button
              className="btn btn-sm btn-outline-danger notification-delete-all-btn "
              disabled={
                !(
                  noticeList.length > 0 &&
                  noticeList.every((item) => item.is_read === 1)
                )
              }
              onClick={(e) => {
                e.preventDefault();
                allNoticeDelete();
              }}
            >
              전체 삭제
            </button>
          </div>
        </div>

        {noticeList && noticeList.length > 0 ? (
          <div className="notification-list">
            {noticeList.map((item, index) => (
              <div
                onClick={() => {
                  if (item.type === "admin") {
                    readNotice_admin(item);
                  } else {
                    readNotice(item);
                  }
                }}
                key={item.id}
                className="notification-item notification-unread"
              >
                <div className="notification-left">
                  <div className="notification-icon">
                    <i className="fa-solid fa-comment"></i>
                  </div>

                  {item.is_read === 0 && (
                    <span className="notification-dot"></span>
                  )}

                  <span className="notification-message">{item.message}</span>
                </div>

                <span className="notification-time">
                  {getTime(item.create_day)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="notification-empty">
            <i className="fa-regular fa-bell"></i>
            <span>새로운 알림이 없습니다</span>
          </div>
        )}
      </div>

      <div className="withdraw-check mt-4 d-flex justify-content-center align-items-center gap-2">
        <input
          type="checkbox"
          id="keepBoard"
          disabled={!boardExist}
          checked={keepBoard}
          onChange={() => setKeepBoard((prev) => !prev)}
        />
        <label htmlFor="keepBoard" className="mb-0">
          회원탈퇴시 게시물을 유지하려면 체크해주세요.{" "}
          <strong>(미체크 시 함께 삭제됩니다)</strong>
        </label>
      </div>

      {/* 버튼 */}
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-secondary" onClick={logoutHandle}>
          로그아웃
        </button>
        <button
          className="withdraw-btn"
          onClick={(e) => {
            e.preventDefault();
            withdrawalUser();
          }}
        >
          <i className="fa-solid fa-user-xmark me-2"></i>
          회원탈퇴
        </button>
      </div>

      {showModal && (
        <Alert
          alertState={alertState}
          modalText={modalText}
          setShowModal={setShowModal}
          showModal={showModal}
        />
      )}

      {showConfirm && (
        <Confirm
          buttonType={buttonType}
          confirmText={confirmText}
          onConfirmResult={handleConfirmResult}
        />
      )}
    </div>
  );
}

export default MyPage;
