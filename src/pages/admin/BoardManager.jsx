import { useEffect, useState } from "react";
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useRevalidator,
} from "react-router-dom";
import {
  PageNavigator,
  PageSelctor,
} from "@/components/common/usePageNavigator";
import { Alert, Confirm } from "@/components/common/Modal";
import { useAuth } from "../auth/MyAuthContext";

function BoardManager(){
  const { adminUser, adminLogout, adminLoading } = useAuth();
  const jsonData = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const order = searchParams.get("order") || "";
  const q = searchParams.get("q") || "";
  const qw = searchParams.get("qw") || "";
  const [inputQw, setInputQW] = useState(qw);
  const [inputQ, setInputQ] = useState(q);
  const list = jsonData.boardList;
  const totalPage = jsonData.totalPage || 0;
  const totalCount = jsonData.totalCount || 0;
  const { revalidate } = useRevalidator(); // loader를 다시실행함

  //alert
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");
  //confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [targetId, setTargetId] = useState(null);

  const [checkList, setCheckList] = useState([]);

  const isNew = (date) => {
    const created = new Date(date).getTime() - 9 * 60 * 60 * 1000;
    const now = new Date();
    const diff = now - created;
    const oneDay = 1000 * 60 * 60 * 24 * 1;
    return diff < oneDay;
  };

  const changePage = (newPage) => {
    navigate(
      `?page=${newPage}&pageSize=${pageSize}&q=${inputQ}&qw=${inputQw}&order=${order}`,
    );
  };

  const changePageSize = (newSize) => {
    navigate(
      `?page=1&pageSize=${newSize}&q=${inputQ}&qw=${inputQw}&order=${order}`,
    );
  };

  const changeOrder = (e) => {
    const newOrder = e.target.value;
    navigate(
      `?page=1&pageSize=${pageSize}&q=${inputQ}&qw=${inputQw}&order=${newOrder}`,
    );
  };

  const handleSearch = () => {
    navigate(
      `?page=1&pageSize=${pageSize}&q=${inputQ}&qw=${inputQw}&order=${order}`,
    );
  };

  useEffect(() => {
    if (!adminLoading && !adminUser) {
      navigate("/?expireRouter=true", { replace: true });
    }
  }, [adminUser, adminLoading, navigate]);

  useEffect(() => {
    setInputQW(qw);
    setInputQ(q);
  }, [qw, q]);

  useEffect(() => {
    if (page > totalPage && totalPage > 0) {
      navigate(
        `?page=${totalPage}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}`,
        {
          replace: true,
        },
      );
    }
  }, [page, totalPage]);

  const onChangeCheckHandle = (e) => {
    const ischecked = e.target.checked;
    const value = e.target.value;
    if (ischecked) {
      setCheckList((prev) => [...prev, value]);
    } else {
      setCheckList((prev) => prev.filter((item) => item !== value));
    }
  };

  const AllcheckNum = (e) => {
    const isCheck = e.target.checked;
    const lowCheckBox = e.currentTarget
      .closest("table") // e.currentTarget (자기자신)을 포함해서 윗쪽 doc를 찾는 함수
      .querySelectorAll('[data-group="check"]'); // 자기자신 포함 안됨 아랫쪽 doc를 찾는 함수
    const arrayIds = Array.from(lowCheckBox, (ck) => ck.value);
    isCheck ? setCheckList(arrayIds) : setCheckList([]);
  };

  const handleConfirmResult = (isConfirmed) => {
    setShowConfirm(false);
    if (isConfirmed) {
      deleteHandle(targetId, true);
    }
  };

  const deleteHandle = async (id = null, isConfirm = false) => {
    if (!isConfirm) {
      setButtonType("delete");
      setConfirmText(
        id !== null
          ? "삭제하시겠습니까?"
          : `${checkList.length}건 삭제하시겠습니까?`,
      );
      setTargetId(id);
      setShowConfirm(true);
      return;
    }

    try {
          const ids = id !== null ? [id] : checkList;
          const res = await fetch(
            `${import.meta.env.VITE_API_ADMIN}/deleteBoard`,
            {
              method: "DELETE",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ids }),
            },
          );
          const result = await res.json();
          if (!res.ok) {
            const error = new Error(
              result ? result.message : "요청에 실패했습니다.",
            );
            error.status = res.status;
            throw error;
          }
          const cnt = result.count;
          setShowModal(true);
          setAlertState("success");
          setModalText(cnt > 1 ? `${cnt}건 삭제되었습니다.` : "삭제되었습니다.");
          revalidate(); // loader 재실행
          setCheckList([]);
        } catch (error) {
          if (error.message === "인증 필요" || error.message === "권한 필요") {
            adminLogout(); // useAuth 에서 뽑아와야됨
            navigate("/?expire=true", { replace: true });
            return;
          }
          setShowModal(true);
          setAlertState("error");
          setModalText(error.status + ":" + error.message);
      }
  };

  // useEffect(() => {
  //    console.log("현재 체크된 리스트:", checkList);
  // }, [checkList]);

return (
  <div className="container py-5">
    <div className="card shadow-sm border-0 rounded-4 mb-4">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1">
            <i className="fa-solid fa-pen-to-square me-2 text-primary"></i>
            <i className="fa-solid fa-gears me-2 text-primary"></i>
            게시글 관리
          </h4>
          <small className="text-muted">
            등록된 모든 게시글을 볼수있으며 (수정/삭제)할수있음
          </small>
        </div>
        <div className="mt-4">
          <Link
            to="/boardWrite/write/admin"
            className="btn"
            style={{ backgroundColor: "#069cf344" }}
          >
            <i className="fa-solid fa-paper-plane me-2"></i> 게시글 작성하기
          </Link>
        </div>
      </div>
    </div>
    {/* 검색 옵션 */}
    <div className="row mb-4 align-items-center">
      {/* 왼쪽구역*/}
      <div className="col-md-6 d-flex gap-3 align-items-center">
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
        <button
          className="btn btn-sm btn-danger"
          onClick={(e) => {
            e.preventDefault();
            deleteHandle();
          }}
          disabled={!checkList || checkList.length === 0}
        >
          선택삭제
        </button>
      </div>

      {/* 오른쪽구역 */}
      <div className="col-md-6 d-flex justify-content-end align-items-center gap-3">
        <small className="text-muted fw-bold mt-3">
          검색결과 : <strong>{totalCount.toLocaleString()}</strong> 건
        </small>

        <select
          className="form-select shadow-sm"
          style={{ maxWidth: "130px" }}
          value={inputQw}
          onChange={(e) => setInputQW(e.target.value)}
        >
          <option value="">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="writer_name">작성자</option>
          <option value="ip">IP</option>
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
            <thead className="table-light text-center">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={checkList.length === list.length}
                    onChange={AllcheckNum}
                  />
                </th>
                <th style={{ width: "7%" }}>번호</th>
                <th style={{ width: "37%" }} className="text-start">
                  제목
                </th>
                <th style={{ width: "10%" }}>작성자</th>
                <th style={{ width: "10%" }}>작성일</th>
                <th style={{ width: "10%" }}>수정일</th>
                <th style={{ width: "12%" }}>IP</th>
                <th style={{ width: "12%" }}>수정/삭제</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item.id} className="text-center">
                  <td>
                    <input
                      type="checkbox"
                      data-group="check"
                      value={item.id}
                      checked={checkList.includes(item.id.toString())}
                      onChange={onChangeCheckHandle}
                    />
                  </td>
                  <td> {index + ((page - 1) * pageSize + 1)}</td>
                  <td className="text-start fw-semibold">
                    <div className="d-flex">
                      <Link
                        to={`/boardDetail/${item.id}/admin`}
                        className="text-decoration-none text-dark"
                      >
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {item.title}
                        </div>
                      </Link>

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
                    </div>
                  </td>
                  <td className="text-center">{item.writer_name}</td>
                  <td className="text-center">
                    {item.create_day?.substring(0, 10)}
                  </td>

                  <td className="text-center">
                    {item.update_day?.substring(0, 10)}
                  </td>
                  
                  <td>{!item.ip || item.ip === "null" ? "-" : item.ip}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Link
                        className="btn btn-sm edit-btn"
                        to={`/boardWrite/update/admin/${item.id}`}
                      >
                        수정
                      </Link>
                      <button
                        className="btn btn-sm delete-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteHandle(item.id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
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


export default BoardManager;