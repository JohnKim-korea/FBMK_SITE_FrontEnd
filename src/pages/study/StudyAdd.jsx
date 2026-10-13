import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLoaderData,useRevalidator  } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import MinSeokEditor from "@/components/common/MinSeokEditor";
import { Alert, Confirm } from "@/components/common/Modal";
import { uploadStudyImg } from "@/components/common/common";

function StudyAdd() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData();

  const revalidator = useRevalidator();
  const category_id = searchParams.get("category_id");
  const id = searchParams.get("id");

  // id가 있으면 수정, 없으면 추가
  const isUpdate = Boolean(id);
  const study = loaderData?.study;

  const [main_category, setMain_category] = useState("");
  const [sub_category, setSub_category] = useState("");
  const [small_category, setSmall_category] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");

  // 조회한 기존 데이터들 설정
  useEffect(() => {
    if (isUpdate && study) {
      setMain_category(study.main_category ?? "");
      setSub_category(study.sub_category ?? "");
      setSmall_category(study.small_category ?? "");
      setTopic(study.topic ?? "");
      setContent(study.content ?? "");
    }
  }, [isUpdate, study]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");

  // confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleConfirmResult = (isConfirmed) => {
    setShowConfirm(false);

    if (isConfirmed) {
      onSubmitHandle(true);
    }
  };

  const onSubmitHandle = async (isConfirm = false) => {
    if (!isConfirm) {
      setButtonType(isUpdate ? "update" : "register");
      setConfirmText(
        isUpdate ? "학습을 수정하시겠습니까?" : "학습을 추가하시겠습니까?",
      );
      setShowConfirm(true);
      return;
    }

    if (!topic.trim()) {
      setShowModal(true);
      setAlertState("error");
      setModalText("학습 주제는 필수입니다.");
      return;
    }

    if (!content.trim()) {
      setShowModal(true);
      setAlertState("error");
      setModalText("학습 내용은 필수입니다.");
      return;
    }

    const data = new FormData();

    data.append("category_id", category_id);
    data.append("main_category", main_category);
    data.append("sub_category", sub_category);
    data.append("small_category", small_category);
    data.append("topic", topic);
    data.append("content", content);

    // 수정일 때만 id 전달
    if (isUpdate) {
      data.append("id", id);
    }

    // 추가 / 수정 API 구분
    const apiUrl = isUpdate
      ? `${import.meta.env.VITE_API_URL}/study/updateSubSubject`
      : `${import.meta.env.VITE_API_URL}/study/addSubSubject`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message ||
            `학습 ${isUpdate ? "수정" : "추가"}에 실패했습니다.`,
        );
      }

      if (result.cnt > 0) {
        setShowModal(true);
        setAlertState("success");
        setModalText(`학습 ${isUpdate ? "수정" : "추가"}에 성공했습니다.`);

        if (isUpdate) {
          // 수정 완료 후 현재 화면에서 수정된 내용 유지
          revalidator.revalidate();
        } else {
          // 추가 완료 후 이전 페이지로 이동
          // setMain_category("");
          // setSub_category("");
          // setSmall_category("");
          // setTopic("");
          // setContent("");
          navigate(-1);
        }
      } else {
        throw new Error(`학습 ${isUpdate ? "수정" : "추가"}에 실패했습니다.`);
      }
    } catch (error) {
      setShowModal(true);
      setAlertState("error");
      setModalText(error.message || "학습 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="study-page">
      <main className="study-container">
        <div className="study-add-page">
          <div className="study-add-title">
            <h3 className="fw-bold">{isUpdate ? "학습 수정" : "학습 추가"}</h3>
          </div>

          <form
            className="study-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitHandle();
            }}
          >
            <div className="study-form-group">
              <label htmlFor="studyMainCategory">대분류</label>
              <input
                id="studyMainCategory"
                type="text"
                placeholder="대분류를 입력하세요."
                value={main_category}
                onChange={(e) => setMain_category(e.target.value)}
              />
            </div>

            <div className="study-form-group">
              <label htmlFor="studySubCategory">중분류</label>
              <input
                id="studySubCategory"
                type="text"
                placeholder="중분류를 입력하세요."
                value={sub_category}
                onChange={(e) => setSub_category(e.target.value)}
              />
            </div>

            <div className="study-form-group">
              <label htmlFor="studySmallCategory">소분류</label>
              <input
                id="studySmallCategory"
                type="text"
                placeholder="소분류를 입력하세요."
                value={small_category}
                onChange={(e) => setSmall_category(e.target.value)}
              />
            </div>

            <div className="study-form-group">
              <label htmlFor="studyTopic">
                학습 주제
                <span className="text-danger fw-bold ms-2">*</span>
              </label>
              <input
                id="studyTopic"
                type="text"
                placeholder="학습 주제를 입력하세요."
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="study-form-group">
              <div className="mb-4">
                <label className="form-label fw-bold">
                  학습 내용
                  <span className="text-danger fw-bold ms-2">*</span>
                </label>

                <CKEditor
                  editor={MinSeokEditor}
                  data={content}
                  onChange={(event, editor) => {
                    setContent(editor.getData());
                  }}
                  onReady={(editor) => {
                    editor.plugins.get("FileRepository").createUploadAdapter = (
                      loader,
                    ) =>
                      uploadStudyImg(
                        loader,
                        setShowModal,
                        setModalText,
                        setAlertState,
                      );
                  }}
                />
              </div>
            </div>

            <div className="study-add-buttons">
              <button type="submit" className="study-submit-button">
                {isUpdate ? "학습 수정" : "학습 추가"}
              </button>

              <button
                type="button"
                className="study-cancel-button"
                onClick={() => navigate(-1)}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </main>

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

export default StudyAdd;
