import { onClickBoardListViews } from "@/components/common/common";
import { useState, useEffect, Children,useMemo,Fragment, useRef } from "react";
import { useParams, useLoaderData, Link, useNavigate, useLocation, useSearchParams} from "react-router-dom";
import { Alert,PasswordModal } from "@/components/common/Modal";
import { useAuth } from "../auth/MyAuthContext";
import { FetchTokenCheck } from "@/components/common/FetchTokenCheck";
import { CommentPageNavigator } from "@/components/common/usePageNavigator";
import MyBoardList from "./myBoardList";

function BoardDetail() {
  const { user,accessToken, setAccessToken, logout,adminUser,authLoading,adminLoading} = useAuth();
  const [searchParams] = useSearchParams();
  const urlBoard = useLoaderData();
  const navigate = useNavigate();
  const {kind} = useParams();
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");
  const [board, setBoard] = useState(urlBoard);
  const [clicked,setClicked] = useState(false);
  const [commentList , setCommentList] = useState([]);
  const [replyCommentList, setReplyCommentList] = useState([]);
  const [password,setPassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [insertSpace,setInsertSpace] = useState(false);
  const [commentContent,setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [page,setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize,setPageSize] = useState(10);
  const [totalPage,setTotalPage] = useState(0);
  const [totalCount,setTotalCount] = useState(0);
  const [commentWriteState, setCommentWriteState] = useState(false);
  const [showReply, setShowReply] = useState(() => {
    const id = Number(searchParams.get("parent_id"));
    return id ? { [id]: true } : {};
  });
  const [openComment,setOpenComment] = useState({});
  const [openReplyComment,setOpenReplyComment] = useState({});
  const location = useLocation();
  const itemRef = useRef({}); //<div ref=""> 을이용하여 해당 document들을 저장하기위해서 만든 변수 
  const [headLight,setHeadLight] = useState();
  const [commentOrder,setCommentOrder] = useState(false);
  
  const [isClick, setIsClick] = useState(false);
  const isAuthReady = !authLoading && !adminLoading;

  const [fileLock ,setFileLock] = useState(true);
  const [showPasswordModal,setShowPasswordModal] = useState(false);
  const [selectBoardId, setSelectBoardId] = useState(board.id);

   // 페이징 밑 최신순 의 클릭 여부에 따라서 해당 open 변수들이 초기화할수있게 도와 주는 state 이게없으면 알림에서 상세페이지로 넘어올때 같이 초기화됨

  // const checkUser = (type) => {
  //   if (!user) {
  //     setShowModal(true);
  //     setModalText(`로그인이 필요한 기능입니다. ${type === "LIKE" ? "좋아요" : "싫어요"}를 사용하려면 로그인해 주세요.`);
  //     setAlertState("none");
  //     return false;
  //   }
  //   return true;
  // };
  
  const fetchComments = async(page,pageSize) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/board/getCommentList?page=${page}&pageSize=${pageSize}&board_id=${board.id}&order=${commentOrder}`);
    const data = await res.json();
    setTotalCount(data.totalCount);
    return data;
  }

  const changePage = (num) => {
    setPage(num);
  };


  const insertAdminComment = async (e, parentId = null) => {
    e.preventDefault();

    // 관리자 로그인 체크
    if (!adminUser) {
      setShowModal(true);
      setModalText("관리자 로그인이 필요합니다.");
      setAlertState("error");
      return;
    }

    // 내용 체크
    if (!parentId && !commentContent) {
      setShowModal(true);
      setModalText("댓글내용을 입력해주세요");
      setAlertState("error");
      return;
    }

    if (parentId && !replyContent) {
      setShowModal(true);
      setModalText("대댓글내용을 입력해주세요");
      setAlertState("error");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_ADMIN}/insertComment`,
        {
          method: "POST",
          credentials: "include", // 세션 쿠키 전달
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            board_id: board.id,
            content: parentId ? replyContent : commentContent,
            parent_id: parentId ? parentId : 0,
            is_admin: true,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "관리자 댓글 등록 실패");
      }
      // 목록 갱신
      const data = await fetchComments(page, pageSize);
      setTotalPage(data.totalPage);
      setCommentList(data.commentList);
      setReplyCommentList(data.replyCommentList);

      // 입력값 초기화
      setCommentContent("");
      if (parentId) {
        setReplyContent("");
      }
    } catch (error) {
       if (error.message === "인증 필요") {
         adminLogout();
         setShowModal(true);
         setAlertState("error");
         setModalText("관리자 로그인 만료");
         return;
       }
      setShowModal(true);
      setModalText(error.message);
      setAlertState("error");
    }
  };


  const insertComment = async (e, parentId = null) => {
    e.preventDefault();
    if (!user && !(parentId ? replyPassword : password) ) {
      setShowModal(true);
      setModalText(`비로그인 사용자는 비밀번호를 입력해야 ${parentId ? '대댓글':'댓글'}을 달 수 있습니다.`);
      setAlertState("error");
      return;
    }

    if (!parentId && !commentContent) {
      setShowModal(true);
      setModalText(`댓글내용을 입력해주세요`);
      setAlertState("error");
      return;
    }

    if (parentId && !replyContent) {
      setShowModal(true);
      setModalText(`대댓글내용을 입력해주세요`);
      setAlertState("error");
      return;
    }
  
      try {
        const res = await (user ? FetchTokenCheck : fetch)(
          `${import.meta.env.VITE_API_URL}/board/insertComment`,
          {
            method: "POST",
            credentials: user ? "include" : "omit",
            headers: {
              "Content-Type": "application/json",
              ...(user && { Authorization: `Bearer ${accessToken}` }),
            },
            body: JSON.stringify({
              board_id: board.id,
              content: parentId ? replyContent : commentContent,
              password: parentId ? replyPassword : password,
              parent_id: parentId ? parentId : 0,
            }),
          },
          user ? setAccessToken : undefined,
        );
        const result = await res.json();

        if (!res.ok) {
          const error = new Error(
            result?.message || "댓글 등록에 실패했습니다.",
          );
          error.status = res.status;
          throw error;
        }

        const data = await fetchComments(page,pageSize);
        setTotalPage(data.totalPage);
        setCommentList(data.commentList);
        setReplyCommentList(data.replyCommentList);
        setCommentContent("");
        setPassword("");
        if(parentId){
          setReplyPassword("");
          setReplyContent("");
        }
      } catch (error) {
        // 보통 catch는 네트워크 오류를 전문적으로 잡는다.
        if (error.message === "Not_Refresh_Token") {
          logout(); // useAuth 에서 뽑아와야됨
          if (kind === "myBoardList") {
            //myboard --> myBoardList
            navigate(`/boardDetail/${board.id}/board`, { replace: true }); // id -> board.id
          }
          setShowModal(true);
          setAlertState("error");
          setModalText("로그인이 만료되었습니다.");
          return Promise.reject();
        }

        if(error.message === "suspanded_member"){
          logout();
          if (kind === "myBoardList") {
            //myboard --> myBoardList
            navigate(`/boardDetail/${board.id}/board`, { replace: true }); // id -> board.id
          }
          setShowModal(true);
          setAlertState("error");
          setModalText("계정사용이 중지되었습니다.");
          return Promise.reject();
        }

        setShowModal(true);
        setModalText(error.status + ":" + error.message);
        setAlertState("error");
        return;
      }
  };


  const deleteAdminComment = async (commentId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_ADMIN}/deleteComment`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment_id: commentId,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "관리자 댓글 삭제 실패");
      }

      // 목록 갱신
      const data = await fetchComments(page, pageSize);
      setTotalPage(data.totalPage);
      setCommentList(data.commentList);
      setReplyCommentList(data.replyCommentList);
    } catch (error) {
      if (error.message === "인증 필요") {
        adminLogout();
        setShowModal(true);
        setAlertState("error");
        setModalText("관리자 로그인 만료");
        return;
      }

      setShowModal(true);
      setModalText(error.message);
      setAlertState("error");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await (user ? FetchTokenCheck : fetch)(
        `${import.meta.env.VITE_API_URL}/board/deleteComment`,
        {
          method: "DELETE",
          credentials: user ? "include" : "omit",
          headers: {
            "Content-Type": "application/json",
            ...(user && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({
            comment_id: commentId,
            password: deletePassword,
          }),
        },
        user ? setAccessToken : undefined,
      );

      const result = await res.json();

      if (!res.ok) {
        const error = new Error(result?.message || "댓글 삭제에 실패했습니다.");
        error.status = res.status;
        throw error;
      }
      // 성공 시 댓글 다시 조회
      const data = await fetchComments(page, pageSize);
      setTotalPage(data.totalPage);
      setCommentList(data.commentList); // 댓글
      setReplyCommentList(data.replyCommentList); // 대댓글
      setDeletePassword('');
    } catch (error) {
       if (error.message === "Not_Refresh_Token") {
         logout(); // useAuth 에서 뽑아와야됨
         if (kind === "myBoardList") {
           //myboard --> myBoardList
           navigate(`/boardDetail/${board.id}/board`, { replace: true }); // id -> board.id
         }
         setShowModal(true);
         setAlertState("error");
         setModalText("로그인이 만료되었습니다.");
         return Promise.reject();
       }

       if (error.message === "suspanded_member") {
         logout();
         if (kind === "myBoardList") {
           //myboard --> myBoardList
           navigate(`/boardDetail/${board.id}/board`, { replace: true }); // id -> board.id
         }
         setShowModal(true);
         setAlertState("error");
         setModalText("계정사용이 중지되었습니다.");
         return Promise.reject();
       }

      setShowModal(true);
      setModalText(error.message);
      setAlertState("error");
      return Promise.reject();
    }
  };

  const commentDelete = (commentId) => { // comment id 필요함
    if (!user && !adminUser) {
      setShowDeletePassword((prev) => prev === commentId ? false : commentId); // 이미 열려있으면 닫고 아니면 삭제창 열기
      return;
    }
    // 로그인 사용자 바로 삭제

    if(adminUser){
      deleteAdminComment(commentId);
    }else{
      deleteComment(commentId);
    }
  };


  const getAnonymousId = () => {
    // 쿠키가 없을때만 생성 후 있으면 계속 anonymous_id를 재사용함 쉽게 말해서 anonymous_id가 계정처럼됨 
    const cookieName = `${import.meta.env.VITE_API_ANONYMOUS}`;
    const cookies = document.cookie.split(";");
    const foundCookie = cookies.map((c) => c.trim()).find((c) => c.startsWith(cookieName+"="));

    if (foundCookie) {
      return;
      //return foundCookie.split("=")[1];
    }

    const uuid = crypto.randomUUID();
    document.cookie = `${cookieName}=${uuid}; path=/; max-age=${60 * 60 * 24 * 30}`;
    return;
  }

  const LikeAndDisLikeReaction =  async (type) => {
    try{
    
    if(!user){
      getAnonymousId();
    }
    
    const res = await (user ? FetchTokenCheck : fetch)(
      `${import.meta.env.VITE_API_URL}/board/reaction`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(user && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          board_id: board.id,
          type: type,
          title: board.title,
          writer_name: board.writer_name // 게시물 작성자
        }),
      },
      user ? setAccessToken : undefined,
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    return await res.json();
    }catch(error){
      if (error.message === "Not_Refresh_Token") {
        logout(); // useAuth 에서 뽑아와야됨
         if (kind === "myBoardList") { //myboard --> myBoardList myboardList에서 들어왔을때 다시 게시글 목록으로 되돌아가야됨
           navigate(`/boardDetail/${board.id}/board`, { replace: true }); // id -> board.id
         }
           setShowModal(true);
           setAlertState("error");
           setModalText("로그인이 만료되었습니다.");
           return Promise.reject();
      }

      if (error.message === "suspanded_member") {
        logout();
        if (kind === "myBoardList") {
          //myboard --> myBoardList
          navigate(`/boardDetail/${board.id}/board`, { replace: true }); // id -> board.id
        }
        setShowModal(true);
        setAlertState("error");
        setModalText("계정사용이 중지되었습니다.");
        return Promise.reject();
      }
      setShowModal(true);
      setAlertState("error");
      setModalText(error.message);
      return Promise.reject();
    }
  };

  useEffect(() => {
    if (board?.id && kind !== "myBoardList") {
      onClickBoardListViews(board.id);
    } // 조회수 증가
  }, [board?.id]);


// console.log({
//   user,
//   adminUser,
//   authLoading,
//   adminLoading,
//   isAuthReady,
// });
  // 잠금 검증 로직
useEffect(() => {
  if (!board?.id || !isAuthReady) {
    return;
  }
  const checkBoardAuth = async () => {
    // 익명 사용자가 페스워드로 들어왔을때
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/board/checkAuthCookie/${board.id}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const checkAuthCookie = await res.json();

      if (!checkAuthCookie.check) {
        navigate("/?boardAuth=true", { replace: true });
      }
    } catch (error) {
      console.log(error);
      navigate("/", {
        replace: true,
      });
    }
  };

  const checkBoardAuthByUser = async () => {
    try {
      const res = await FetchTokenCheck(
        `${import.meta.env.VITE_API_URL}/board/checkWriter/${board.id}`,
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
      // 작성자 아니면
      // 쿠키 인증 검사
      if (!result.check) {
        await checkBoardAuth();
        return;
      }
      // 작성자면 통과
      return;
    } catch (error) {
      console.log(error);
      if (error.message === "Not_Refresh_Token") {
        navigate("/?expireRouter=true", {
          replace: true,
        });
        return;
      }
      await logout();
      navigate("/?boardAuth=true", {
        replace: true,
      });
    }
  };
  const checkBoardAuthByAdmin = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_ADMIN}/adminCheck`, {
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok) {
        const error = new Error(
          result ? result.message : "요청에 실패했습니다.",
        );
        error.status = res.status;
        throw error;
      }

      if (!result.check) {
        await adminLogout();
        navigate("/?boardAuth=true", {
          replace: true,
        });
      }
    } catch (error) {
      adminLogout();
      navigate("/?boardAuth=true", { replace: true });
    }
  };

  if (board?.hasPassword) {
    if (adminUser) {
      checkBoardAuthByAdmin();
      return;
    } else if (user) {
      checkBoardAuthByUser();
      return;
    } else {
      checkBoardAuth();
    }
  }
}, [board?.id, isAuthReady, user, adminUser]);

   const commentTree = useMemo(() => {
     const map ={};
     const parents = [];
     commentList.forEach((c) => {  // 부모 댓글
      map[c.id] = {...c , children : []}
      parents.push(map[c.id]);
    });

     replyCommentList.forEach(r => { // 대댓글
         if (map[r.parent_id]) {
           map[r.parent_id].children.push(r);
         }
     })
     return parents;
   },[commentList,replyCommentList]);


   useEffect(() => {
    
     if (!location.hash || !commentTree.length) return;

     const key = location.hash.replace("#", "");
     const doc = itemRef.current[key];

     if (doc) {
       doc.scrollIntoView({ behavior: "smooth", block: "center" });
       setHeadLight(key);
       //navigate(location.pathname, { replace: true });
     }
   }, [location.hash, commentTree]);

   
   useEffect(() => { // 2초후 실행
     if (!headLight) return;

     const timer = setTimeout(() => {
       setHeadLight(null);
       navigate(location.pathname, { replace: true });
     }, 2000);

     return () => clearTimeout(timer);
   }, [headLight]);

  //  useEffect(() => {
  //    if (!location.hash || !commentList.length) return;

  //    const id = location.hash.replace("#", "");
  //    const el = document.getElementById(id);

  //    if (el) {
  //      el.scrollIntoView({ behavior: "smooth", block: "center" });
  //      navigate(location.pathname, { replace: true });
  //    }
  //  }, [location.hash, commentList]); // commentList가 랜더링될때 스크롤이 움직인다.
  //id = {`commentView-${item.id}`}
  //id = {`replyView-${child.id}`}

   useEffect(() => {
     const changePageLoad = async () => {
       const data = await fetchComments(page, pageSize);
       setCommentList(data.commentList);
       setTotalPage(data.totalPage);
       setReplyCommentList(data.replyCommentList);
       if (isClick) {
         setShowReply({});
         setOpenComment({});
         setOpenReplyComment({});
         setInsertSpace({});
         // 클릭여부 초기화
         setIsClick(false);
       }
     };
     changePageLoad();
   }, [page, commentOrder]);

   useEffect(() => {
      if (isClick) {
        setPage(1);
        setIsClick(false);
      }
   }, [commentOrder]);

const filePasswordHandle = async(e) => {
    if(!board.hasFilePassword || !fileLock){
      setFileLock(false);
      return;
    }

    e.preventDefault();
    try{
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
          setFileLock(false);
          return;
        } else {
          setShowPasswordModal(false);
          setShowModal(true);
          setModalText("관리자가 아닙니다.");
          setAlertState("error");
        }
        return;
      }

      if (user) {
        // 로그인 사용자
        try {
          const res = await FetchTokenCheck(
            `${import.meta.env.VITE_API_URL}/board/checkWriter/${board.id}`,
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

          if (!result.check) {
            // 작성자 아님
            setShowPasswordModal(true);
            return;
          }
          // 작성자
          setFileLock(false);
          return;
        } catch (error) {
          setShowPasswordModal(false);
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
      // 비로그인 사용자
      setShowPasswordModal(true);
      return;
    }catch(error){
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
      return;
    }
   }
const onSubmitFilePassword = async (password) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/board/checkFilePassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          board_id: board.id,
          password,
        }),
      },
    );
    const data = await response.json();
    // 암호 불일치
    if (!data.check) {
      setShowPasswordModal(false);
      setShowModal(true);
      setModalText("파일 암호가 일치하지 않습니다.");
      setAlertState("error");
      setFileLock(true);
      return;
    }
    // 암호 일치
    setFileLock(false);
    setShowPasswordModal(false);
  } catch (error) {
    console.log(error);
    setShowPasswordModal(false);
    setShowModal(true);
    setModalText(error.status + ":" + error.message);
    setAlertState("error");
    setFileLock(true);
    return false;
  }
};


  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      {/* 상단 버튼 */}

      {/* 제목 */}
      <div className="mb-4">
        <h2 className="fw-bold">{board.title}</h2>
      </div>

      <div className="mt-4 text-end mb-3">
        {user && kind === "myBoardList" ? (
          <Link
            to="/login/myBoardList"
            className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 text-light custom-btn"
          >
            <i className="bi bi-arrow-left-circle"></i>
            나의 목록으로
          </Link>
        ) : (
          <Link
            to="/boardList"
            className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 text-light custom-btn"
          >
            <i className="bi bi-arrow-left-circle"></i>
            목록으로
          </Link>
        )}
      </div>

      {/* 작성 정보 */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4 text-muted small">
        <div>
          <span className="me-3">
            작성자 : <strong className="text-dark">{board.writer_name}</strong>
          </span>
          <span className="me-3">
            작성일 : {board.create_day?.substring(0, 10)}
          </span>
          <span>수정일 : {board.update_day?.substring(0, 10)}</span>
        </div>
        <div>조회수 : {board.view_count.toLocaleString()}</div>
      </div>

      {/* 내용 영역 */}
      <div className="card shadow-sm border-0 mb-5">
        <div
          className="card-body board-content ck-content"
          style={{
            minHeight: "300px",
            lineHeight: "1.9",
            fontSize: "15px",
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: board.content }}
        />
      </div>

      {/* 첨부파일 */}
      {board.files && (
        <div
          className={`file-download-box mb-5 ${!adminUser && board.hasFilePassword && fileLock ? "locked-post" : ""}`}
          onClick={(e) => filePasswordHandle(e)}
        >
          <div className="file-download-header">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-paperclip"></i>
              <span>첨부파일</span>
              {!adminUser && board.hasFilePassword && (
                <span
                  className="ms-1"
                  style={{
                    color: fileLock ? "#d9534f" : "#198754",
                    fontSize: "13px",
                  }}
                  title={fileLock ? "파일 잠김" : "인증 완료"}
                >
                  <i
                    className={`fa-solid ${
                      fileLock ? "fa-lock" : "fa-lock-open"
                    }`}
                  ></i>
                </span>
              )}
            </div>

            <span className="file-download-count">
              {board.files.split(",").length}개
            </span>
          </div>

          <ul className="list-group custom-download-list">
            {board.files.split(",").map((fileInfo, index) => {
              const array = fileInfo.split("|");
              if (array.length !== 2) {
                return null;
              }
              const fileKey = array[0];
              const originalName = array[1];
              const fileUrl = `${import.meta.env.VITE_AWS_FILE_URL}/${fileKey}`;
              

              return (
                <li
                  key={index}
                  className="list-group-item custom-download-item"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="download-file-icon">
                      <i className="fa-solid fa-file-arrow-down"></i>
                    </div>

                    <div className="d-flex flex-column">
                      <span className="download-file-name">{originalName}</span>

                      <span className="download-file-desc">다운로드</span>
                    </div>
                  </div>
                  <a
                    href={fileUrl}
                    download={originalName}
                    className="download-btn"
                  >
                    다운로드
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/*좋아요 싫어요 영역 */}
      <div className="like-dislike-wrapper">
        <button
          className={`like-btn ${board.likeByMe ? "active" : ""}`}
          disabled={clicked}
          onClick={async (e) => {
            e.preventDefault();
            const type = "LIKE";
            if (clicked) return;
            try {
              setClicked(true);
              const updated = await LikeAndDisLikeReaction(type);
              setBoard(updated);
            } catch (err) {
              console.error(err.message);
            } finally {
              setClicked(false);
            }
          }}
        >
          <i className="bi bi-hand-thumbs-up-fill"></i>
          좋아요 {board.like_count}
        </button>

        <button
          className={`dislike-btn ${board.disLikeByMe ? "active" : ""}`}
          disabled={clicked}
          onClick={async (e) => {
            e.preventDefault();
            const type = "DISLIKE";
            if (clicked) return;
            try {
              setClicked(true);
              const updated = await LikeAndDisLikeReaction(type);
              setBoard(updated);
            } catch (err) {
              console.error(err.message);
            } finally {
              setClicked(false);
            }
          }}
        >
          <i className="bi bi-hand-thumbs-down-fill"></i>
          싫어요 {board.dislike_count}
        </button>
      </div>

      {/*댓글 창 */}
      {commentWriteState && (
        <div className="comment-write">
          <textarea
            maxLength={1000}
            className="comment-textarea"
            placeholder="댓글을 입력하세요"
            value={commentContent}
            onChange={(e) => {
              setCommentContent(e.target.value);
            }}
          />

          <div className="comment-bottom">
            <span
              className="comment-counter"
              style={{
                color: commentContent.length > 900 ? "#fa5252" : "#868e96",
              }}
            >
              {commentContent.length} / 1000
            </span>
            <div className="comment-actions">
              <input
                className="comment-password"
                type="password"
                placeholder="비밀번호 입력"
                disabled={user || adminUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button onClick={adminUser ? insertAdminComment : insertComment}>
                등록
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="comment-write-label d-flex justify-content-between">
        <div>
          <span
            className={`comment-write-intro ${commentWriteState ? "active-link" : ""}`}
            onClick={() => {
              setCommentWriteState((prev) => !prev);
              setCommentContent("");
              setPassword("");
            }}
          >
            <i className="fa-regular fa-comment me-1"></i>
            댓글 작성하기
          </span>
          <span
            className={`comment-write-intro ms-lg-3 ${commentOrder ? "active-link" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setIsClick(true);
              setCommentOrder((prev) => !prev);
            }}
          >
            최신순
          </span>
        </div>
        <span className="text-muted fw-bold">
          댓글 {totalCount.toLocaleString()} 건
        </span>
      </div>
      {/* 댓글 구역 */}
      {commentTree && commentTree.length > 0 ? (
        commentTree.map((item) => {
          return (
            <div
              ref={(el) => (itemRef.current[`commentView-${item.id}`] = el)}
              className="comment"
              key={item.id}
            >
              <div className="d-flex justify-content-between">
                <div className="comment-header">
                  <span className="comment-writer">
                    {item.writer_name ? item.writer_name : "익명 (1004)"}
                  </span>
                  <span className="comment-ip">{item.ip}</span>
                  <span className="comment-time">
                    {item.create_day.substring(0, 10)}
                  </span>
                  {item.children.length > 0 && (
                    <span
                      className="comment-reply-count fw-bold"
                      onClick={(e) => {
                        setShowReply((prev) => {
                          return { ...prev, [item.id]: !prev[item.id] };
                        }); //[item.id] 변수의 값을 키 로사용 showReply["20"]  이렇게 나타냄
                        setShowDeletePassword(false);
                      }}
                      title="댓글 보기"
                    >
                      [댓글 {item.children.length}]
                    </span>
                  )}
                </div>

                <button
                  className="comment-menu-btn"
                  title="더보기"
                  onClick={() =>
                    setOpenComment((prev) => {
                      return { ...prev, [item.id]: !prev[item.id] };
                    })
                  }
                >
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
              </div>
              <div className="d-flex justify-content-between">
                <div
                  className={`comment-content ${openComment[item.id] ? "expanded" : ""} 
                  ${headLight === `commentView-${item.id}` ? "highlight" : ""}
                  ${item.deleted ? "deleted-comment" : ""}`}
                  onClick={() => {
                    if (item.deleted) return; // 클릭 막기
                    setInsertSpace((prev) =>
                      prev === item.id ? false : item.id,
                    );
                    setReplyContent("");
                    setReplyPassword("");
                  }}
                  title="댓글 달기"
                >
                  {item.content}
                </div>

                <div className="comment-actions">
                  <div className="comment-menu">
                    <button
                      className="comment-delete fw-bold"
                      onClick={() => {
                        if (item.deleted) {
                          return;
                        }
                        commentDelete(item.id);
                        setDeletePassword("");
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>

              {/*대댓글 구역 */}
              {showReply[item.id] &&
                item.children.length > 0 && ( // 변수값으로 꺼내고 싶을때 Object[item.id] ==> Object["20"] 이런식으로 나타냄 jsp 에서도 이렇게 했잖아
                  <div className="comment-replies">
                    {item.children.map((child, index) => (
                      <div
                        ref={(el) =>
                          (itemRef.current[`replyView-${child.id}`] = el)
                        }
                        key={child.id}
                        className={`comment-reply ${index === item.children.length - 1 ? "last" : ""} 
                        ${index === item.children.length - 1 && (child.id === showDeletePassword || openReplyComment[child.id]) ? "delete-open" : ""}`}
                      >
                        <div className="d-flex">
                          <div className="comment-reply-main">
                            <div className="comment-reply-meta">
                              <span className="reply-writer">
                                {child.writer_name
                                  ? child.writer_name
                                  : "익명 (1004)"}
                              </span>
                              <span className="reply-ip">{child.ip}</span>
                              <span className="reply-date">
                                {child.create_day.substring(0, 10)}
                              </span>
                            </div>
                            <div
                              className={`comment-reply-content
                                ${headLight === `replyView-${child.id}` ? "highlight" : ""}
                                ${openReplyComment?.[child.id] ? "expanded" : ""}`}
                            >
                              {child.content}
                            </div>
                          </div>

                          <div className="reply-actions">
                            <button
                              className="comment-menu-btn"
                              title="더보기"
                              onClick={() =>
                                setOpenReplyComment((prev) => {
                                  return {
                                    ...prev,
                                    [child.id]: !prev[child.id],
                                  };
                                })
                              }
                            >
                              <i className="fa-solid fa-ellipsis"></i>
                            </button>
                            <button
                              className="comment-delete"
                              onClick={() => {
                                commentDelete(child.id);
                                setDeletePassword("");
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        {child.id === showDeletePassword && (
                          <div className={`comment-delete-password`}>
                            <input
                              type="password"
                              placeholder="비밀번호 입력"
                              value={deletePassword}
                              onChange={(e) =>
                                setDeletePassword(e.target.value)
                              }
                            />
                            <button onClick={() => deleteComment(child.id)}>
                              삭제
                            </button>
                            <button
                              onClick={() => setShowDeletePassword(false)}
                            >
                              취소
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {item.id === showDeletePassword && (
                <div className="comment-delete-password justify-content-end">
                  <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                  <button onClick={() => deleteComment(item.id)}>삭제</button>
                  <button onClick={() => setShowDeletePassword(false)}>
                    취소
                  </button>
                </div>
              )}

              {item.id === insertSpace && (
                <div className="comment-reply-write ms-4 mt-2">
                  <div className="reply-header">
                    <i className="fa-solid fa-reply reply-arrow"></i>
                    <textarea
                      maxLength={500}
                      className="comment-textarea"
                      placeholder="대댓글을 입력하세요"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                  </div>

                  <div className="comment-reply-bottom">
                    <span
                      className="reply-counter"
                      style={{
                        color:
                          replyContent.length > 400 ? "#fa5252" : "#868e96",
                      }}
                    >
                      {replyContent.length} / 500
                    </span>
                    <div className="reply-buttons">
                      <div className="comment-actions">
                        <input
                          className="reply-password"
                          type="password"
                          placeholder="비밀번호 입력"
                          disabled={user || adminUser}
                          value={replyPassword}
                          onChange={(e) => setReplyPassword(e.target.value)}
                        />

                        {/* <button
                          className="reply-register"
                          onClick={(e) => insertComment(e, item.id)}
                        >
                          등록
                        </button> */}

                        <button
                          onClick={(e) =>
                            adminUser
                              ? insertAdminComment(e, item.id)
                              : insertComment(e, item.id)
                          }
                        >
                          등록
                        </button>
                        <button
                          className="reply-cancel"
                          onClick={() => setInsertSpace(false)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="no-comment">
          <i className="fa-regular fa-comment-dots me-2"></i>
          아직 댓글이 없습니다.
        </div>
      )}
      {/* 댓글 페이징 */}
      {commentList && commentList.length > 0 && (
        <CommentPageNavigator
          page={page}
          totalPage={totalPage}
          changePage={changePage}
          setIsClick={setIsClick}
        />
      )}

      {showModal && (
        <Alert
          alertState={alertState}
          modalText={modalText}
          setShowModal={setShowModal}
          showModal={showModal}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          showPasswordModal={showPasswordModal}
          setShowPasswordModal={setShowPasswordModal}
          onSubmitPassword={onSubmitFilePassword}
          />
      )}
    </div>
  );
}
export default BoardDetail;
