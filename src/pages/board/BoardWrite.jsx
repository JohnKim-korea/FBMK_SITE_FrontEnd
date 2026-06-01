import { Link, useParams, useLoaderData,useRevalidator, useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import MinSeokEditor from "@/components/common/MinSeokEditor";
import { useEffect, useState } from "react";
import { uploadImg, uploadFile,deleteUploadFile } from "@/components/common/common";
import { Alert ,Confirm } from "@/components/common/Modal";
import { FetchTokenCheck } from "@/components/common/FetchTokenCheck";
import { useAuth } from "../auth/MyAuthContext";

function BoardWrite() {
  const { user, accessToken, setAccessToken, logout, authLoading,adminUser,adminLoading,adminLogout } = useAuth();
  const navigate = useNavigate();
  const { gubun, kind } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");
  const updateBoard = useLoaderData(); // loader를 이용하여 받아온 데이터
  const isUpdate = gubun === "update";
  const [title, setTitle] = useState(isUpdate && updateBoard ? updateBoard.title : "");
  const [content, setContent] = useState(isUpdate && updateBoard ? updateBoard.content : "");
  const [writer_name, setWriter_name] = useState( isUpdate && updateBoard ? updateBoard.writer_name : adminUser ? "관리자": user?.writer_name || "" );
  const ip = isUpdate && updateBoard ? updateBoard.ip : "";
  //const [writer_name, setWriter_name] = useState(isUpdate && updateBoard ? updateBoard.writer_name : user?.writer_name || "");
  //const [writer_id, setWriter_id] = useState(isUpdate && updateBoard ? updateBoard.writer_id : user.id); // 사용자 pk
  const [oldContent, setOldContent] = useState(isUpdate && updateBoard ? updateBoard.content : "");
  const [files, setFiles] = useState(
    isUpdate && updateBoard?.files ? updateBoard.files.split(",") : [],
  );

  const [oldFiles, setOldFiles] = useState(
    isUpdate && updateBoard?.files ? updateBoard.files.split(",") : [],
  );
  const { revalidate } = useRevalidator(); 



  const [isBoardLock, setIsBoardLock] = useState(false);
  const [isFileLock, setIsFileLock] = useState(false);
  const [password, setPassword] = useState("");
  const [file_password, setFilePassword] = useState("");
  const [boardPasswordRemove, setBoardPasswordRemove] = useState(false);
  const [filePasswordRemove, setFilePasswordRemove] = useState(false);

  //confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleConfirmResult = (isConfirmed) => {
    setShowConfirm(false);
    if (isConfirmed) {
      adminUser? adminSubmitHandle(true) : onSubmitHandle(true);
    }
  };

  useEffect(() => {
    // 등록일 때만 세팅
    if (!isUpdate) {
      if (adminUser) {
        setWriter_name("관리자");
      } else if (user) {
        setWriter_name(user.writer_name);
      }
    }
  }, [user, adminUser, isUpdate]);

  // useEffect(() => {
  //   if (user) {
  //     setWriter_name(user.writer_name);
  //   }
  // }, [user]);

  const adminSubmitHandle = async (isConfirm = false) => {
    if (!isConfirm) {
      setButtonType(isUpdate ? "update" : "register");
      setConfirmText(isUpdate ? "수정하시겠습니까?" : "등록하시겠습니까?");
      setShowConfirm(true);
      return;
    }

     const data = new FormData();
     data.append("title", title);
     data.append("content", content);
     data.append("files", files.join(","));  // 2026-05-15  파일 업로드
     data.append("password", password);
     data.append("file_password", file_password);
     //data.append("writer_name", writer_name);
     //data.append("writer_id", writer_id);
     if (isUpdate) {
       data.append("id", updateBoard.id);
       data.append("oldContent", oldContent);
       data.append("oldFiles", oldFiles.join(",")); // 2026-05-15  파일 업로드
       data.append("ip", updateBoard.ip); // 2026-04-21 수정
       data.append("removeOption",`${boardPasswordRemove ? 1 : 0},${filePasswordRemove ? 1 : 0}`);
     }

      if (password && (password.length < 4 || password.length > 10)) {
       setShowModal(true);
       setAlertState("error");
       setModalText("패스워드는 4자 이상 10자 이하로 입력해주세요");
       return Promise.reject();
     }

     if (file_password && (file_password.length < 4 || file_password.length > 10)) {
       setShowModal(true);
       setAlertState("error");
       setModalText("패스워드는 4자 이상 10자 이하로 입력해주세요");
       return Promise.reject();
     }

     if (!title) {
       setShowModal(true);
       setAlertState("error");
       setModalText("제목은 필수입니다.");
       return;
     }

     if (title.length < 3 || title.length > 50) {
       setShowModal(true);
       setAlertState("error");
       setModalText("제목은 3자 이상 50자 이하로 입력해주세요");
       return;
     }

     if (!content) {
       setShowModal(true);
       setAlertState("error");
       setModalText("내용은 필수입니다.");
       return;
     }

     try{
      const url = isUpdate
        ? `${import.meta.env.VITE_API_ADMIN}/board/update`
        : `${import.meta.env.VITE_API_ADMIN}/board/register`;

        const method = isUpdate ? "PUT" : "POST";

        const res = await fetch(url, {
          method: method,
          body: data,
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

          if (result.count > 0) {
            setShowModal(true);
            setAlertState("success");
            setModalText(
              isUpdate ? "수정에 성공했습니다." : "등록에 성공했습니다.",
            );
            if (isUpdate) {
              const updatedContent = content.replaceAll(
                "tempImsi/",
                "postImg/",
              );
              setContent(updatedContent); //  화면 갱신
              setOldContent(updatedContent); //  비교 기준 갱신

              // 파일 업로드
              const updateFiles = files.map((file) =>
                file.replaceAll("tempFile/", "postFile/"),
              );
              setFiles(updateFiles);
              setOldFiles(updateFiles);
            } else {
              setTitle("");
              setContent("");
              setOldContent("");
              // 파일 업로드
              setFiles([]);
              setOldFiles([]);

              // 잠금 초기화
              setIsBoardLock(false);
              setIsFileLock(false);
              setPassword("");
              setFilePassword("");
              setBoardPasswordRemove(false);
              setFilePasswordRemove(false);
            }
          }

      }catch(error){
         if (error.message === "인증 필요" || error.message === "권한 필요") {
           adminLogout(); // useAuth 에서 뽑아와야됨
           navigate("/?expire=true", { replace: true });
           return;
         }
         setShowModal(true);
         setAlertState("error");
         setModalText(error.status + ":" + error.message);
         return;

      }
  }

  const onSubmitHandle = async (isConfirm = false) => {
    if (!isConfirm) {
      setButtonType(isUpdate ? "update" : "register");
      setConfirmText(isUpdate ? "수정하시겠습니까?" : "등록하시겠습니까?");
      setShowConfirm(true);
      return;
    }

    const data = new FormData();
    data.append("title", title);
    data.append("content", content);
    data.append("files", files.join(",")); // 2026-05-15  파일 업로드
    data.append("password", password);
    data.append("file_password", file_password);
    //data.append("writer_name", writer_name);
    //data.append("writer_id", writer_id);
    if (isUpdate) {
      data.append("id", updateBoard.id);
      data.append("oldContent", oldContent);
      data.append("oldFiles", oldFiles.join(",")); // 2026-05-15  파일 업로드
      data.append("ip", ip);
      data.append("removeOption",`${boardPasswordRemove ? 1 : 0},${filePasswordRemove ? 1 : 0}`);
    }

     if (password && (password.length < 4 || password.length > 10)) {
       setShowModal(true);
       setAlertState("error");
       setModalText("패스워드는 4자 이상 10자 이하로 입력해주세요");
       return Promise.reject();
     }

     if (file_password && (file_password.length < 4 || file_password.length > 10)) {
       setShowModal(true);
       setAlertState("error");
       setModalText("패스워드는 4자 이상 10자 이하로 입력해주세요");
       return Promise.reject();
     }
    
    if (!title) {
      setShowModal(true);
      setAlertState("error");
      setModalText("제목은 필수입니다.");
      return Promise.reject();
    }

    if (title.length < 3 || title.length > 50) {
      setShowModal(true);
      setAlertState("error");
      setModalText("제목은 3자 이상 50자 이하로 입력해주세요");
      return Promise.reject();
    }

    if (!content) {
      setShowModal(true);
      setAlertState("error");
      setModalText("내용은 필수입니다.");
      return Promise.reject();
    }

    try {
      const url = isUpdate
        ? `${import.meta.env.VITE_API_URL}/board/update`
        : `${import.meta.env.VITE_API_URL}/board/register`;

      const method = isUpdate ? "PUT" : "POST";
     
      const res = await FetchTokenCheck(
        url,
        {
          method: method,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
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

      if (result.count > 0) {
        setShowModal(true);
        setAlertState("success");
        setModalText(
          isUpdate ? "수정에 성공했습니다." : "등록에 성공했습니다.",
        );
        if (isUpdate) {
          const updatedContent = content.replaceAll("tempImsi/", "postImg/");
          setContent(updatedContent); //  화면 갱신
          setOldContent(updatedContent); //  비교 기준 갱신
          // 파일 업로드
         const updateFiles = files.map((file) =>
           file.replaceAll("tempFile/", "postFile/"),
         );
         setFiles(updateFiles);
         setOldFiles(updateFiles);
         // 잠금때문에 추가
         revalidate();
         setIsBoardLock(false);
         setIsFileLock(false);
         setBoardPasswordRemove(false);
         setFilePasswordRemove(false);
        } else {
          setTitle("");
          setContent("");
          setOldContent("");

          // 파일 업로드
          setFiles([]);
          setOldFiles([]);
          // 잠금 초기화
          setIsBoardLock(false);
          setIsFileLock(false);
          setPassword("");
          setFilePassword("");
          setBoardPasswordRemove(false);
          setFilePasswordRemove(false);
        }
      }
    } catch (error) {
      if (error.message === "Not_Refresh_Token") {
        logout(); // useAuth 에서 뽑아와야됨
        navigate("/?expire=true", { replace: true });
        return;
      }

      if (error.message === "suspanded_member") {
        logout();
        navigate("/?suspended=true", { replace: true });
        return;
      }

      setShowModal(true);
      setAlertState("error");
      setModalText(error.status + ":" + error.message); // ?. 옵저널 채이닝 undifind 및 null 방지 해당 2값중에 하나여도 "" 반환
      return Promise.reject();
    }
  };


  const deleteFile = async (fileInfo, index) => {
    if(!isUpdate){ // temp 파일 즉시삭제 등록일때만
      const success = await deleteUploadFile(
        fileInfo,
        setShowModal,
        setModalText,
        setAlertState,
      );
      if (!success) {
        return;
      }
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
   if (user && user.loginStatus === "BAN") {
     navigate("/?suspended=true", { replace: true });
     return;
   }

    if (!authLoading && !adminLoading && !user && !adminUser) {
      navigate("/?logoutState=true", { replace: true });
    }
  }, [user, adminUser, authLoading, adminLoading, navigate]);

  //  useEffect(() => {
  //    if (!authLoading && !user) {
  //      navigate("/?logoutState=true", { replace: true });
  //    }
  //  }, [user, authLoading, navigate]);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between mb-2">
        <div>
          <h3 className="fw-bold">
            <i className="fa-solid fa-pencil" style={{ color: "#3b82f6" }}></i>
            게시글 작성
          </h3>
          <p className="text-muted small">자유롭게 글을 작성해보세요.</p>
        </div>
        <div className="mt-4 text-end">
          {adminUser && kind === "admin" ? (
            <Link
              to="/admin/boardManager"
              className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 text-light custom-btn"
            >
              <i className="bi bi-arrow-left-circle"></i>
              게시글 관리
            </Link>
          ) : user && kind === "myBoard" ? (
            <Link
              to="/login/myBoardList"
              className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 text-light custom-btn"
            >
              <i className="bi bi-arrow-left-circle"></i>
              나의 목록으로
            </Link>
          ) : user && kind === "FreeBoardList" ? (
            <Link
              to="/boardList"
              className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 text-light custom-btn"
            >
              <i className="bi bi-arrow-left-circle"></i>
              목록으로
            </Link>
          ) : (
            <Link
              to="/"
              className="btn btn-sm d-inline-flex align-items-center gap-2 px-3 text-light custom-btn"
            >
              <i className="bi bi-arrow-left-circle"></i>홈 으로
            </Link>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (adminUser) {
              adminSubmitHandle();
            } else {
              onSubmitHandle();
            }
          }}
        >
          <div className="card-body">
            {/* 제목 */}
            <div className="mb-4">
              <label className="form-label fw-bold">제목</label>
              <input
                type="text"
                className="form-control"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {/* 작성자 (나중에 로그인 연동 시 자동 표시로 바꾼다.) */}
            <div className="mb-4">
              <label className="form-label fw-bold">작성자</label>
              <input
                type="text"
                className="form-control"
                value={writer_name}
                disabled={true}
              />
            </div>
            {/* 내용 (CKEditor 자리) */}
            <div className="mb-4">
              <label className="form-label fw-bold">내용</label>
              <CKEditor
                editor={MinSeokEditor}
                data={content}
                onChange={(event, editor) => {
                  //onBlur 포커스를 잃을때 살행
                  const data = editor.getData();
                  setContent(data);
                }}
                onReady={(editor) => {
                  editor.plugins.get("FileRepository").createUploadAdapter = (
                    loader,
                  ) => {
                    return uploadImg(
                      loader,
                      setShowModal,
                      setModalText,
                      setAlertState,
                    );
                  };
                }}
              />
            </div>

            {/* 잠금 설정 */}
            <div className="lock-box mb-4">
              <div className="d-flex align-items-center mb-3">
                <i className="fa-solid fa-lock me-2"></i>

                <span className="fw-bold">잠금 설정</span>
              </div>

              {/* 게시글 잠금 */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="boardLock"
                  checked={isBoardLock}
                  onChange={(e) => {
                    setPassword("");
                    setIsBoardLock(e.target.checked);
                  }}
                />

                <label className="form-check-label fw-bold" htmlFor="boardLock">
                  게시글 잠금
                  {updateBoard?.hasPassword && (
                    <small
                      className="ms-2 text-danger"
                      title="현재 잠금된 게시글입니다."
                    >
                      <i className="fa-solid fa-lock me-1"></i>
                      현재 잠금된 게시글입니다.
                    </small>
                  )}
                </label>
              </div>
              {/*게시글 암호 제거 */}
              {updateBoard?.hasPassword && isBoardLock && (
                <div className="form-check mb-3 ms-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="boardPasswordRemove"
                    checked={boardPasswordRemove}
                    onChange={(e) => {
                      setBoardPasswordRemove(e.target.checked);

                      if (e.target.checked) {
                        setPassword("");
                      }
                    }}
                  />

                  <label
                    className="form-check-label text-danger small fw-bold"
                    htmlFor="boardPasswordRemove"
                  >
                    게시글 암호 제거
                  </label>
                </div>
              )}

              {/* 게시글 암호 */}
              {isBoardLock && (
                <div className="mb-3">
                  <input
                    type="password"
                    disabled={boardPasswordRemove}
                    className="form-control"
                    placeholder="게시글 암호 입력"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    maxLength={10}
                  />

                  <div className="small text-muted mt-2">
                    {isUpdate
                      ? "수정 시 암호를 변경하지 않으면 기존 암호가 유지됩니다."
                      : "암호는 4자 이상 10자 이하로 입력해주세요."}
                  </div>
                </div>
              )}

              {/* 첨부파일 잠금 */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="fileLock"
                  checked={isFileLock}
                  onChange={(e) => {
                    setFilePassword("");
                    setIsFileLock(e.target.checked);
                  }}
                />

                <label className="form-check-label fw-bold" htmlFor="fileLock">
                  첨부파일 잠금
                  {updateBoard?.hasFilePassword && (
                    <small
                      className="ms-2 text-danger"
                      title="첨부파일이 잠금되어있습니다."
                    >
                      <i className="fa-solid fa-lock me-1"></i>
                      첨부파일이 잠금되어있습니다.
                    </small>
                  )}
                </label>
              </div>
              {/* 첨부파일 암호 제거 */}
              {updateBoard?.hasFilePassword && isFileLock && (
                <div className="form-check mb-3 ms-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="filePasswordRemove"
                    checked={filePasswordRemove}
                    onChange={(e) => {
                      setFilePasswordRemove(e.target.checked);
                      if (e.target.checked) {
                        setFilePassword("");
                      }
                    }}
                  />

                  <label
                    className="form-check-label text-danger small fw-bold"
                    htmlFor="filePasswordRemove"
                  >
                    첨부파일 암호 제거
                  </label>
                </div>
              )}

              {/* 첨부파일 암호 */}
              {isFileLock && (
                <div>
                  <input
                    type="password"
                    className="form-control"
                    disabled={filePasswordRemove || !(files.length > 0)}
                    placeholder="첨부파일 암호 입력"
                    value={file_password}
                    onChange={(e) => setFilePassword(e.target.value)}
                    maxLength={10}
                  />

                  <div className="small text-muted mt-2">
                    {isUpdate
                      ? "수정 시 암호를 변경하지 않으면 기존 암호가 유지됩니다."
                      : "암호는 8~10자로 입력해주세요. 첨부파일은 동일한 암호를 사용합니다."}
                  </div>
                </div>
              )}
            </div>

            {/* 파일 업로드 */}
            <div className="file-upload-box mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="file-upload-label">
                  <i className="fa-solid fa-paperclip me-2"></i>
                  첨부파일
                </label>

                <span className="file-upload-guide">
                  최대 2개 / 파일당 35MB 이하
                </span>
              </div>

              {/* 숨겨진 input */}
              <input
                type="file"
                id="boardFileUpload"
                className="d-none"
                multiple
                onChange={async (e) => {
                  const newFiles = Array.from(e.target.files);
                  const result = await uploadFile(
                    newFiles,
                    files,
                    setShowModal,
                    setModalText,
                    setAlertState,
                  );
                  if (!result) {
                    e.target.value = "";
                    return;
                  }
                  setFiles((prev) => {
                    return [...prev, ...result];
                  });

                  e.target.value = "";
                }}
              />

              {/* 커스텀 버튼 */}
              <label htmlFor="boardFileUpload" className="custom-upload-btn">
                <i className="fa-solid fa-upload me-2"></i>
                파일 선택
              </label>

              {/* 파일 목록 */}
              {files && files.length > 0 && (
                <ul className="list-group mt-3 custom-file-list">
                  {files.map((fileInfo, index) => {
                    const array = fileInfo.split("|");
                    const originalName = array[1];

                    return (
                      <li
                        key={index}
                        className="list-group-item custom-file-item"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa-solid fa-file-lines file-icon"></i>

                          <span className="file-name">{originalName}</span>
                        </div>

                        <button
                          type="button"
                          className="file-delete-btn"
                          onClick={() => deleteFile(fileInfo, index)}
                        >
                          삭제
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* 버튼의 영역 */}
          <div className="d-flex justify-content-center card-footer bg-white text-end gap-2">
            {gubun == "write" ? (
              <button type="submit" className="btn btn-primary">
                등록하기
              </button>
            ) : (
              <button className="btn btn-sm edit-btn">수정하기</button>
            )}
            <Link
              to={adminUser ? "/admin/boardManager" : "/login/myBoardList"}
              className="btn btn-secondary me-2"
            >
              취소
            </Link>
          </div>
        </form>
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

export default BoardWrite;


/*
async function apiFetch(url, options, navigate) {
  const res = await fetch(url, options);

  if (res.status === 401) {
    navigate("/", {
      state: {
        showSessionExpired: true,
        message: "세션이 만료되었습니다. 다시 로그인해주세요."
      }
    });
    return null;
  }

  return res;
}

*/