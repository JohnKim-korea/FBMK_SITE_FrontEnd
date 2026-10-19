import { useNavigate, useParams, useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Confirm } from "@/components/common/Modal";
function StudySubjectAdd() {
  const navigate = useNavigate();

  const { category_id } = useParams();
  const isUpdate = !!category_id;
  const subject = useLoaderData();
  const [studyCategory, setStudyCategory] = useState(subject?.category || "");
  const [studyIcon, setStudyIcon] = useState(subject?.icon || "🗂️");
  const [studyWriter, setStudyWriter] = useState(subject?.writer || "");
  const [studyPassword, setStudyPassword] = useState("");
  const [file, setFile] = useState(null);

  //modal
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");

  //confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleConfirmResult = (isConfirmed) => {
    setShowConfirm(false);
    if (isConfirmed) {
       if (file) {
         onSubmitFileLoad(true);
       } else {
         onSubmitHandle(true);
       }
    }
  };

  const onSubmitHandle = async (isConfirm = false) => {
    if (!isConfirm) {
      setButtonType(isUpdate ? "update" : "register");
      setConfirmText(
        isUpdate ? "과목 수정하시겠습니까?" : "과목 등록하시겠습니까?",
      );
      setShowConfirm(true);
      return;
    }

    if (
      (!isUpdate || studyPassword) &&
      (!studyPassword || studyPassword.length < 4 || studyPassword.length > 10)
    ) {
      setShowModal(true);
      setAlertState("error");
      setModalText("패스워드는 4자 이상 10자 이하로 입력해주세요.");
      return;
    }

    if (studyCategory.length < 2 || studyCategory.length > 30) {
      setShowModal(true);
      setAlertState("error");
      setModalText("과목명은 2자 이상 30자 이하로 입력해주세요");
      return;
    }

    if (!studyWriter) {
      setShowModal(true);
      setAlertState("error");
      setModalText("작성자는 필수로 적어야합니다.");
      return;
    }

    const data = new FormData();
    data.append("category", studyCategory);
    data.append("icon", studyIcon);
    data.append("writer", studyWriter);
    data.append("password", studyPassword);
    try {
      const url = isUpdate
        ? `${import.meta.env.VITE_API_URL}/study/updateSubject/${category_id}`
        : `${import.meta.env.VITE_API_URL}/study/addSubject`;

      const res = await fetch(url, {
        method: "POST",
        body: data,
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
        if (!isUpdate) {
          navigate("/Study", {
            replace: true,
            state: {
              alert: true,
              message: "등록에 성공했습니다.",
              alertState: "success",
            },
          });
        } else {
          if (isUpdate && studyPassword) {
            navigate("/Study", {
              replace: true,
              state: {
                alert: true,
                type: "pwUpdate",
                message: "패스워드를 수정 하였습니다.",
                alertState: "success",
              },
            });
            return;
          }
          setShowModal(true);
          setAlertState("success");
          setModalText("수정 하였습니다.");
        }
      }
    } catch (error) {
      setShowModal(true);
      setAlertState("error");
      setModalText(
        error.status ? `${error.status}:${error.message}` : error.message,
      );
    }
  };

  // 학습 자료 파일 로드 
  const onSubmitFileLoad = async (isConfirmed = false) => {
    if (!file) {
      setShowModal(true);
      setAlertState("error");
      setModalText("업로드할 파일을 선택해주세요.");
      return;
    }
    
    if (!isConfirmed) {
      setButtonType("register");
      setConfirmText("파일 로드를 하시겠습니까?");
      setShowConfirm(true);
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("category", studyCategory);
    data.append("icon", studyIcon);
    data.append("writer", studyWriter);
    data.append("password", studyPassword);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/study/dataLoad`,
        {
          method: "POST",
          body: data,
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "파일 로드에 실패했습니다.");
      }

       navigate("/study", {
         state: {
           alert: true,
           message: result.notImgMessage
             ? result.notImgMessage
             : `${result.count}개의 학습 자료를 저장했습니다.`,
           alertState: result.notImgMessage ? "warning" : "success",
         },
       });
    } catch (error) {
      setShowModal(true);
      setAlertState("error");
      setModalText(error.message);
    }
  };

  return (
    <div className="study-page">
      <main className="study-container">
        <div className="study-add-page">
          <div className="study-add-title">
            <h3 className="fw-bold">
              {isUpdate ? "학습 과목 수정" : "학습 과목 추가"}
            </h3>
            <p>새로운 학습 과목을 추가하세요.</p>
          </div>

          <form
            className="study-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isUpdate && file) {
                onSubmitFileLoad();
              } else {
                onSubmitHandle();
              }
            }}
          >
            {/* 아이콘 */}
            <div className="study-form-group">
              <label htmlFor="studyIcon">아이콘</label>

              <select
                id="studyIcon"
                value={studyIcon}
                onChange={(e) => setStudyIcon(e.target.value)}
              >
                <option value="🗂️">🗂️ 기타</option>
                <option value="📕">📕 국어</option>
                <option value="🆎">🆎 영어</option>
                <option value="🏛️">🏛️ 한국사</option>
                <option value="💻">💻 컴퓨터</option>
                <option value="🔒">🔒 정보보안</option>
                <option value="🗄️">🗄️ 데이터베이스</option>
                <option value="🌐">🌐 네트워크</option>
                <option value="🧩">🧩 알고리즘</option>
                <option value="📚">📚 학습</option>
                <option value="✏️">✏️ 필기</option>
              </select>
            </div>

            {/* 과목명 */}
            <div className="study-form-group">
              <label htmlFor="studyCategory">
                과목명
                <span className="text-danger fw-bold ms-2">*</span>
              </label>

              <input
                id="studyCategory"
                type="text"
                value={studyCategory}
                onChange={(e) => setStudyCategory(e.target.value)}
                placeholder="과목명을 입력하세요."
              />
            </div>

            {/* 작성자 */}
            <div className="study-form-group">
              <label htmlFor="studyWriter">
                작성자
                <span className="text-danger fw-bold ms-2">*</span>
              </label>

              <input
                id="studyWriter"
                type="text"
                value={studyWriter}
                onChange={(e) => setStudyWriter(e.target.value)}
                placeholder="작성자를 입력하세요."
              />
            </div>

            {/* 비밀번호 */}
            <div className="study-form-group">
              <label htmlFor="studyPassword">
                비밀번호
                <span className="text-danger fw-bold ms-2">*</span>
              </label>

              <input
                id="studyPassword"
                type="password"
                value={studyPassword}
                onChange={(e) => setStudyPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요."
              />
            </div>

            {/* 학습 자료 */}
            {!isUpdate && (
              <div className="study-form-group">
                <label htmlFor="studyFile">학습 자료</label>

                <input
                  id="studyFile"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />

                <small className="study-file-help">
                  지원 파일: .xlsx, .xls, .csv
                </small>
              </div>
            )}

            {/* 버튼 */}
            <div className="study-add-buttons">
              <button type="submit" className="study-submit-button">
                {isUpdate ? "과목 수정" : "과목 추가"}
              </button>

              <button
                type="button"
                className="study-cancel-button"
                onClick={() => navigate("/Study")}
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

export default StudySubjectAdd;
