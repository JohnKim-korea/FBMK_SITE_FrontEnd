import { Link, useParams, useLoaderData } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import MinSeokEditor from "@/components/common/MinSeokEditor";
import { useState } from "react";
import { uploadImg } from "@/components/common/common";
import { Alert } from "@/components/common/Modal";

function BoardWrite() {
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");
  const [title, setTitle] = useState("");
  const [writer_name, setWriter_name] = useState("현재작성자test"); // 훗날 바꿔야됨
  const [content, setContent] = useState("");
  const [writer_id, setWriter_id] = useState("test"); // 훗날 바꿔야됨
  const { gubun, kind } = useParams();

  const onSubmitHandle = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", title);
    data.append("content", content);
    data.append("writer_name", writer_name);
    data.append("writer_id", writer_id);

    if (!title) {
      setShowModal(true);
      setAlertState("error");
      setModalText("제목은 필수입니다.");
      return Promise.reject();
    }

    if (!content) {
      setShowModal(true);
      setAlertState("error");
      setModalText("내용은 필수입니다.");
      return Promise.reject();
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/board/register`,
        {
          method: "POST",
          body: data,
        },
      );
      const result = await res.json();
      if (!res.ok) {
        const error = new Error(
          result ? result.message : "등록에 실패했습니다.",
        );
        error.status = res.status;
        throw error;
      }

      if (result.count > 0) {
        setShowModal(true);
        setAlertState("success");
        setModalText("등록에 성공했습니다.");
        //input 값 초기화
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.log(error);

      setShowModal(true);
      setAlertState("error");
      setModalText(error.status + ":" + error.message); // ?. 옵저널 채이닝 undifind 및 null 방지 해당 2값중에 하나여도 "" 반환
      return Promise.reject();
    }
  };

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
          {kind === "myBoard" ? (
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
      </div>

      <div className="card shadow-sm">
        <form onSubmit={onSubmitHandle}>
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
                onChange={(e) => setWriter_name(e.target.value)}
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
          </div>

          {/* 버튼의 영역 */}
          <div className="d-flex justify-content-center card-footer bg-white text-end gap-2">
            {gubun == "write" ? (
              <button type="submit" className="btn btn-primary">
                등록하기
              </button>
            ) : (
              <button className="btn btn-info text-white">수정하기</button>
            )}
            <Link
              to={
                kind === "myBoard"
                  ? "/login/myBoardList"
                  : kind === "FreeBoardList"
                    ? "/boardList"
                    : "/home"
              }
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
