import { useLoaderData, useNavigate, useSearchParams,useRevalidator  } from "react-router-dom";
import { StudyPageNavigator,SelectStudyPageSize } from "@/components/common/usePageNavigator";
import { useEffect,useState } from "react";
import { Confirm, Alert } from "@/components/common/Modal";

function StudyList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category_id = searchParams.get("category_id");
  const category = searchParams.get("category");
  const icon = searchParams.get("icon");
  const { list, totalCount } = useLoaderData();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 10,
  );
  const revalidator = useRevalidator();
  const page = Number(searchParams.get("page")) || 1;
  const totalPage = Math.ceil(totalCount / pageSize);
  //confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [selectedStudyId, setSelectedStudyId] = useState(null);

  //alert
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("none");

  const changePage = (newPage) => {
    navigate(
      `/studyList?category_id=${category_id}&category=${encodeURIComponent(
        category,
      )}&icon=${encodeURIComponent(icon)}&page=${newPage}&pageSize=${pageSize}`,
    );
  };

  const changePageSize = (newPageSize) => {
    setPageSize(newPageSize);

    navigate(
      `/studyList?category_id=${category_id}&category=${encodeURIComponent(
        category,
      )}&icon=${encodeURIComponent(icon)}&page=1&pageSize=${newPageSize}`,
    );
  };

  //  쿠키 확인 및 세션 만료 처리
  const checkAuthCookie = async (category_id) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/study/checkAuthCookie/${category_id}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.check) {
      navigate("/study", {
        state: {
          alert: true,
          message: "세션이 만료되었습니다.",
        },
      });
      return false;
    }

    return true;
  };

  const goUpdate = async (study) => {
    try {
      if (!(await checkAuthCookie(study.category_id))) {
        return;
      }

      navigate(`/studyUpdate?category_id=${study.category_id}&id=${study.id}`);
    } catch (error) {
      navigate("/study", {
        state: {
          alert: true,
          message: error.message || "요청 처리 중 오류가 발생했습니다.",
        },
      });
    }
  };

  const handleConfirmResult = (isConfirmed) => {
    setShowConfirm(false);
    if (isConfirmed) {
      goDelete(selectedStudyId, true);
    }
  };

  // 학습 삭제
  const goDelete = async (studyId, isConfirm = false) => {
    if (!isConfirm) {
      setButtonType("delete");
      setConfirmText("삭제하시겠습니까?");
      setSelectedStudyId(studyId);
      setShowConfirm(true);
      return;
    }
    
    try {
      if (!(await checkAuthCookie(category_id))) return;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/study/deleteSubSubject?category_id=${category_id}&id=${studyId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok && data.check) {
        // 수정한곳
        setModalText("학습이 삭제되었습니다.");
        setAlertState("success");
        revalidator.revalidate(); 
      } else {
        setModalText("학습 삭제에 실패했습니다.");
        setAlertState("error");
      }
      setShowModal(true);
    } catch (error) {
      setModalText(error.message || "학습 삭제 중 오류가 발생했습니다.");
      setAlertState("error");
      setShowModal(true);
    }finally{
      setSelectedStudyId(null); // 초기화
    }
  };

  

  useEffect(() => {
    const checkAuthCookie = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/study/checkAuthCookie/${category_id}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await response.json();
        if (!data.check) {
          navigate("/study", {
            state: {
              alert: true,
              message: "세션이 만료되었습니다.",
            },
          });
        }
      } catch (error) {
        navigate("/study", {
          state: {
            alert: true,
            message: error.message || "요청 처리 중 오류가 발생했습니다.",
          },
        });
      }
    };

    checkAuthCookie();
  }, [list, navigate]);

  return (
    <div className="study-page">
      <main className="study-container">
        <div className="study-list-page">
          <div className="study-list-header">
            <h3 className="fw-bold">
              {icon} {category}
            </h3>

            <div className="study-list-actions">
              <label className="study-hide-content">
                <input type="checkbox" />
                <span>내용 숨기기</span>
              </label>

              <select className="study-search-select">
                <option value="recent">최근날짜</option>
                <option value="oldest">오래된 날짜</option>
              </select>

              <select className="study-search-select">
                <option value="">대분류</option>
                <option value="grammar">문법</option>
                <option value="vocabulary">어휘</option>
              </select>

              <select className="study-search-select">
                <option value="">중분류</option>
                <option value="grammar">문법</option>
                <option value="vocabulary">어휘</option>
              </select>

              <select className="study-search-select">
                <option value="">소분류</option>
                <option value="morpheme">형태소</option>
                <option value="parts">품사</option>
              </select>

              <button
                type="button"
                className="study-add-button"
                onClick={() => navigate(`/studyAdd?category_id=${category_id}`)}
              >
                + 학습 추가
              </button>
            </div>
          </div>

          <div className="study-search-box">
            <input
              type="text"
              placeholder="학습 내용을 검색하세요."
              className="study-search-input"
            />

            <SelectStudyPageSize
              pageSize={pageSize}
              changePageSize={changePageSize}
            />

            <select className="study-search-select">
              <option value="all">전체</option>
              <option value="topic">제목</option>
              <option value="content">내용</option>
            </select>

            <button type="button" className="study-search-button">
              검색
            </button>
          </div>

          <StudyPageNavigator
            page={page}
            totalPage={totalPage}
            changePage={changePage}
          >
            <div className="study-list">
              {list && list.length > 0 ? (
                list.map((study) => (
                  <div className="study-list-item" key={study.id}>
                    <div className="study-list-category">
                      {study.main_category}
                      {study.sub_category && ` > ${study.sub_category}`}
                      {study.small_category && ` > ${study.small_category}`}
                    </div>

                    <div className="study-list-title-row">
                      <div
                        className="study-list-title"
                        onClick={() =>
                          navigate(
                            `/studyDetail?category_id=${study.category_id}&id=${study.id}`,
                          )
                        }
                      >
                        {study.topic}
                      </div>

                      <div className="study-list-actions">
                        <button
                          type="button"
                          className="study-edit-button"
                          onClick={() => {
                            goUpdate(study);
                          }}
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          className="study-delete-button"
                          onClick={() => goDelete(study.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    <div className="study-list-content">
                      {study.search_content}
                    </div>

                    <div
                      className={`study-list-status ${
                        study.completed === 1 ? "completed" : ""
                      }`}
                    >
                      {study.completed === 1 ? "암기 완료" : "미암기"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="study-no-data2">
                  <i className="bi bi-inbox"></i>
                  <div>데이터가 없습니다.</div>
                </div>
              )}
            </div>
          </StudyPageNavigator>
        </div>
      </main>

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
    </div>
  );
}
export default StudyList;
