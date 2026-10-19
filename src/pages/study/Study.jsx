import { useLoaderData, useNavigate, useSearchParams ,useLocation,useRevalidator} from "react-router-dom";
import { StudyPageNavigator } from "@/components/common/usePageNavigator";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/MyAuthContext";
import { useBoardAuth } from "../auth/BoardAuthContext";
import { Alert, PasswordModal, Confirm } from "@/components/common/Modal";
import { checkStudyAuthCookie } from "@/components/common/common";


function Study() {
  const navigate = useNavigate();
  const location = useLocation();
  const { revalidate } = useRevalidator();
  const { adminUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { list, totalCount } = useLoaderData();
  const [isDeleting, setIsDeleting] = useState(false);
  // 한 페이지에 4개
  const pageSize = 4;
  // 전체 페이지
  const totalPage = Math.ceil(totalCount / pageSize);
  // 현재 페이지
  const page = Number(searchParams.get("page")) || 1;
  // 페이지 변경
  const changePage = (newPage) => {
    navigate(`/study?page=${newPage}&pageSize=${pageSize}`);
  };

  //alert
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("none");

  //confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [actionType, setActionType] = useState(null);

  // 패스워드 모달
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectStudyId, setSelectStudyId] = useState(0);
  const { authStudyMap, setAuthStudyMap } = useBoardAuth();
  // 중분류 리스트에 아이콘 과 제목
  const [selectStudyCategory, setSelectStudyCategory] = useState("");
  const [selectStudyIcon, setSelectStudyIcon] = useState("");

  const onSubmitPassword = async (password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/study/checkPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            category_id: selectStudyId,
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
        setSelectStudyId(0);

        setAuthStudyMap((prev) => {
          const newMap = { ...prev };
          delete newMap[selectStudyId];
          return newMap;
        });
      } else {
        // 암호 일치
        setAuthStudyMap((prev) => ({
          ...prev,
          [selectStudyId]: true,
        }));
        setShowPasswordModal(false);
        if(actionType === "delete"){
          setActionType(null);
          await handleDeleteStudy(selectStudyId, true);
          return;
        }

         if (actionType === "update") {
           setActionType(null);
           navigate(`/studySubjectAdd/update/${selectStudyId}`);
           return;
         }

         if (actionType === "ExcelBackUp") {
           setActionType(null);
           await handleExcelBackup(selectStudyId,true);
           return;
         }

          if (actionType === "CsvBackUp") {
            setActionType(null);
            await handleCsvBackup(selectStudyId, true);
            return;
          }


        // 추후 학습 페이지 이동
        navigate(
          `/studyList?category_id=${selectStudyId}&category=${encodeURIComponent(
            selectStudyCategory,
          )}&icon=${encodeURIComponent(selectStudyIcon)}`,
        );
      }
    } catch (error) {
      console.log(error);
      setShowPasswordModal(false);
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
      setSelectStudyId(0);

      setAuthStudyMap((prev) => {
        const newMap = { ...prev };
        delete newMap[selectStudyId];
        return newMap;
      });
      return false;
    }
  };


    useEffect(() => {
      if (location.state?.alert) {
        setShowModal(true);
        setModalText(location.state.message);
        setAlertState(location.state.alertState || "error");

        navigate(location.pathname, {
          replace: true,
          state: {},
        });
      }
    }, [location, navigate]);

  useEffect(() => {
    const loadAuthCookie = async () => {
      for (const item of list) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/study/checkAuthCookie/${item.category_id}`,
            {
              method: "GET",
              credentials: "include",
            },
          );
          const checkAuthCookie = await response.json();
          if (checkAuthCookie.check) {
            setAuthStudyMap((prev) => ({
              ...prev,
              [item.category_id]: true,
            }));
          } else {
            setAuthStudyMap((prev) => {
              const newMap = { ...prev };
              delete newMap[item.category_id];
              return newMap;
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (list?.length > 0) {
      loadAuthCookie();
    }
  }, [list]);



  const handlePasswordStudy = async (e, item) => {
    e.preventDefault();
    try {
      // 관리자 확인
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
          navigate(
            `/studyList?category_id=${selectStudyId}&category=${encodeURIComponent(item.category)}&icon=${encodeURIComponent(item.icon)}`,
          );
          return;
        }
        setShowPasswordModal(false);
        setShowModal(true);
        setModalText("관리자가 아닙니다.");
        setAlertState("error");
        return;
      }

      // 이미 인증된 학습
      if (authStudyMap[item.category_id]) {
        navigate(
          `/studyList?category_id=${item.category_id}&category=${encodeURIComponent(
            item.category,
          )}&icon=${encodeURIComponent(item.icon)}`,
        );
        return;
      }

      // 비밀번호 인증 필요
      setShowPasswordModal(true);
      setSelectStudyId(item.category_id);
      setSelectStudyCategory(item.category);
      setSelectStudyIcon(item.icon);
      return;
    } catch (error) {
      setShowPasswordModal(false);
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
    }
  };

  const goUpdateStudy = async(category_id) => {
    try{
     const isAuth = await checkStudyAuthCookie(category_id);
     if (!isAuth) {
       setShowConfirm(false);
       setShowPasswordModal(true);
       setSelectStudyId(category_id);
       setActionType("update")
       return;
     }else{
      navigate(`/studySubjectAdd/update/${category_id}`);
     }

    }catch(error){
      console.log(error);
      setShowConfirm(false);
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
      setSelectStudyId(0);
      setActionType(null);
    }
  }


  const handleConfirmResult = (isConfirmed) => {
    setShowConfirm(false);
    if (isConfirmed && actionType === "delete") {
      handleDeleteStudy(selectStudyId, true);
    } 
    if(isConfirmed && actionType == "CsvBackUp"){
       handleCsvBackup(selectStudyId, true);
    }
    if(isConfirmed && actionType == "ExcelBackUp"){
       handleExcelBackup(selectStudyId,true);
    }
    
  };


  const handleCsvBackup = async (category_id = null, isConfirm = false) => {
    if (!isConfirm) {
      setButtonType("none");
      setConfirmText("CSV 백업하시겠습니까?");
      setSelectStudyId(category_id);
      setActionType("CsvBackUp");
      setShowConfirm(true);
      return;
    }

    try {
      const isAuth = await checkStudyAuthCookie(category_id);

      if (!isAuth) {
        setShowConfirm(false);
        setShowPasswordModal(true);
        return;
      }

      // CSV 백업 요청
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/study/csvBackup/${category_id}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("CSV 백업에 실패했습니다.");
      }

      // CSV 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      a.href = url;
      a.download = `학습백업_${dateStr}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
      setSelectStudyId(null);
    } catch (error) {
      console.error(error);
      setModalText(error.message || "CSV 백업 중 오류가 발생했습니다.");
      setAlertState(false);
      setShowModal(true);
      setSelectStudyId(null);
    }
  };

  const handleExcelBackup = async (category_id = null, isConfirm = false) => {
    if (!isConfirm) {
      setButtonType("Excel");
      setConfirmText("액셀 백업하시겠습니까?");
      setSelectStudyId(category_id);
      setActionType("ExcelBackUp");
      setShowConfirm(true);
      return;
    }

    try {
      const isAuth = await checkStudyAuthCookie(category_id);
      if (!isAuth) {
        setShowConfirm(false);
        setShowPasswordModal(true);
        return;
      }

      //  엑셀 백업 요청
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/study/excelBackup/${category_id}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("엑셀 백업에 실패했습니다.");
      }

      //  엑셀 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      a.href = url;
      a.download = `학습백업_${dateStr}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSelectStudyId(null);
    } catch (error) {
      console.error(error);
      setModalText(error.message || "Excel 백업 중 오류가 발생했습니다.");
      setAlertState(false);
      setShowModal(true);
      setSelectStudyId(null);
    }
  };

  const handleDeleteStudy = async (category_id = null, isConfirm = false) => {
    if (!isConfirm) {
      setButtonType("delete");
      setConfirmText("삭제하시겠습니까?");
      setSelectStudyId(category_id);
      setActionType("delete");
      setShowConfirm(true);
      return;
    }

    try {
      // 1. 인증 쿠키 확인
      const isAuth = await checkStudyAuthCookie(category_id);
      if (!isAuth) {
        setShowConfirm(false);
        setShowPasswordModal(true);
        return;
      }
      // 2. 인증된 경우 삭제 요청
      setIsDeleting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/study/deleteSubject/${category_id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || "삭제 요청에 실패했습니다.");
        error.status = response.status;
        throw error;
      }
      if (data.check) {
        setShowConfirm(false);
        setSelectStudyId(null);
        revalidate();
        return;
      }
      setShowConfirm(false);
      setShowModal(true);
      setModalText("삭제에 실패했습니다.");
      setAlertState("error");
      setSelectStudyId(null);
    } catch (error) {
      console.log(error);
      setShowConfirm(false);
      setShowModal(true);
      setModalText(error.status + ":" + error.message);
      setAlertState("error");
      setSelectStudyId(null);
    } finally {
      // 삭제 로딩 종료
      setIsDeleting(false);
    }
  };


  return (
    <div className="study-page">
      <main className="study-container">
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-1">
                <i className="bi bi-journal-text me-2 text-primary fs-3"></i>
                학습 도우미
              </h4>
              <small className="text-muted">
                공부할 주제를 선택하고 학습 내용을 정리해보세요.
                <div className="mt-2 p-2 border rounded bg-light">
                  <div className="fw-semibold mb-1">학습 안내 및 이용 정책</div>
                  <div>
                    · 로그인 없이 자유롭게 학습 내용을 등록할 수 있습니다.
                  </div>
                  <div>
                    · 대분류 → 중분류 → 소분류로 학습 내용을 관리할 수 있습니다.
                  </div>
                  <div>
                    · 학습 자료는 엑셀 파일로 백업하고 다시 불러올 수 있습니다.
                  </div>
                  <div className="fw-bold">
                    · 백업 이미지에는 보관 기간이 있으며, 기간이 지나면 자동
                    삭제될 수 있습니다.
                  </div>
                  <div className="fw-bold">
                    · 백업 이미지가 만료된 경우에도 학습 데이터는 불러올 수
                    있지만, 이미지 복원은 불가능합니다.
                  </div>
                  <div className="fw-bold">
                    · 중요한 학습 자료와 이미지는 정기적으로 백업해 주세요.
                  </div>
                </div>
              </small>
            </div>
          </div>
        </div>
        <div className="study-title-area">
          <div className="study-actions">
            <div className="study-search">
              <input type="text" placeholder="제목 작성자 검색" />

              <i className="fa-solid fa-magnifying-glass"></i>
            </div>

            <button
              type="button"
              className="add-study-button"
              onClick={() => navigate("/studySubjectAdd/register/")}
            >
              + 학습 과목 추가
            </button>
          </div>
        </div>

        <StudyPageNavigator
          page={page}
          totalPage={totalPage}
          changePage={changePage}
        >
          {list && list.length > 0 ? (
            <div className="category-list">
              {list.map((study) => (
                <div className="category-card" key={study.id}>
                  <div className="category-icon">{study.icon}</div>

                  <div className="category-info">
                    <div className="category-title">
                      <h4
                        onClick={(e) => handlePasswordStudy(e, study)}
                        style={{ cursor: "pointer" }}
                      >
                        {study.category}
                      </h4>

                      <i
                        className={`fa-solid ${
                          authStudyMap[study.category_id]
                            ? "fa-lock-open"
                            : "fa-lock"
                        }`}
                        style={{
                          color: authStudyMap[study.category_id]
                            ? "#198754"
                            : "#dc3545",
                        }}
                      ></i>

                      <span className="my-category">나의 공부</span>
                    </div>

                    <div className="category-writer">
                      <span>작성자: {study.writer}</span>

                      <span className="category-total fw-bold">
                        전체 {(study.subListCount ?? 0).toLocaleString()}개
                      </span>
                    </div>

                    <div className="category-count">
                      <span className="study-incomplete">
                        미완료{" "}
                        {(
                          (study.subListCount ?? 0) - (study.completed ?? 0)
                        ).toLocaleString()}
                        개
                      </span>

                      {" | "}

                      <span className="study-complete">
                        완료 {(study.completed ?? 0).toLocaleString()}개
                      </span>
                    </div>
                  </div>

                  <div
                    className="category-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button type="button">⋮</button>

                    <div className="category-menu-dropdown">
                      <button
                        type="button"
                        className="text-primary"
                        onClick={() => {
                          // console.log("study 객체:", study);
                          // console.log("category_id:", study.category_id);
                          goUpdateStudy(study.category_id);
                        }}
                      >
                        <i className="bi bi-pencil"></i> 제목 수정
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteStudy(study.category_id)}
                      >
                        <i className="bi bi-trash3"></i> 삭제
                      </button>

                      {/* 수정한곳: CSV 백업 */}
                      <button
                        type="button"
                        onClick={() => handleCsvBackup(study.category_id)}
                      >
                        <i className="bi bi-filetype-csv"></i> CSV 백업
                      </button>

                      {/* 수정한곳: 엑셀 백업 */}
                      <button
                        type="button"
                        className="text-success"
                        onClick={() => handleExcelBackup(study.category_id)}
                      >
                        <i className="bi bi-file-earmark-excel"></i> 엑셀 백업
                      </button>
                    </div>
                  </div>

                  <div className="category-arrow">›</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="study-no-data">
              <img src="/images/NoData2.jpg" alt="데이터 없음" />

              <div>데이터가 없습니다.</div>
            </div>
          )}
        </StudyPageNavigator>
      </main>

      {showPasswordModal && (
        <PasswordModal
          showPasswordModal={showPasswordModal}
          setShowPasswordModal={setShowPasswordModal}
          onSubmitPassword={onSubmitPassword}
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

      {showConfirm && (
        <Confirm
          buttonType={buttonType}
          confirmText={confirmText}
          onConfirmResult={handleConfirmResult}
        />
      )}

      {isDeleting && (
        <div className="delete-loading">
          <img src="/images/loading.gif" alt="삭제 중" />
          <div>삭제 중...</div>
        </div>
      )}
    </div>
  );
}

export default Study;
