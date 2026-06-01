import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, useRevalidator, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/MyAuthContext";
import { Alert, Confirm } from "@/components/common/Modal";
import {PageNavigator,PageSelctor} from "@/components/common/usePageNavigator";

function MyReactionList() {
  const { user, authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const jsonData = useLoaderData();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const order = searchParams.get("order") || "";
  const q = searchParams.get("q") || "";
  const qw = searchParams.get("qw") || "";
  const filter = searchParams.get("filter") || "";
  const [inputQw, setInputQW] = useState(qw);
  const [inputQ, setInputQ] = useState(q);
  const [inputFilter, setInputFilter] = useState(filter);
  const list = jsonData.myReactionList;
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
  const [allCheckCount, setAllCheckCount] = useState(0);

  const changePage = (newPage) => {
    navigate(
      `?page=${newPage}&pageSize=${pageSize}&qw=${inputQw}&q=${inputQ}&order=${order}&filter=${inputFilter}`,
    );
  };

  const changePageSize = (newSize) => {
    navigate(
      `?page=1&pageSize=${newSize}&qw=${inputQw}&q=${inputQ}&order=${order}&filter=${inputFilter}`,
    );
  };

  const changeOrder = (e) => {
    const newOrder = e.target.value;
    navigate(
      `?page=1&pageSize=${pageSize}&qw=${inputQw}&q=${inputQ}&order=${newOrder}&filter=${inputFilter}`,
    );
  };

  const handleSearch = () => {
    navigate(
      `?page=1&pageSize=${pageSize}&qw=${inputQw}&q=${inputQ}&order=${order}&filter=${inputFilter}`,
    );
  };

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
      .closest("table")
      .querySelectorAll('[data-group="check"]');
    const arrayIds = Array.from(lowCheckBox, (ck) => ck.value);
    setAllCheckCount(arrayIds.length);
    isCheck ? setCheckList(arrayIds) : setCheckList([]);
  };

   useEffect(() => {
     if (user && user.loginStatus === "BAN") {
       navigate("/?suspended=true", { replace: true });
       return;
     }

     if (!authLoading && !user) {
       navigate("/?expireRouter=true", { replace: true });
     }
   }, [user, authLoading, navigate]);

   useEffect(() => {
     setInputFilter(filter);
     setInputQW(qw);
     setInputQ(q);
   }, [filter, qw, q]);

   useEffect(() => {
     if (page > totalPage && totalPage > 0) { // URL 상태 기준 유지 하면서 자동보정
       navigate(
         `?page=${totalPage}&pageSize=${pageSize}&q=${q}&qw=${qw}&order=${order}&filter=${filter}`,
         { replace: true },
       );
     }
   }, [page, totalPage]);

    const handleConfirmResult = (isConfirmed) => {
      setShowConfirm(false);
      if (isConfirmed) {
        cancelHandle(targetId, true);
      }
    };

    const cancelHandle = async (id = null, isConfirm = false) => {
      if (!isConfirm) {
        setButtonType("delete");
        setConfirmText(
          id !== null
            ? "취소하시겠습니까?"
            : `${checkList.length}건 취소하시겠습니까?`,
        );
        setTargetId(id);
        setShowConfirm(true);
        return;
      }

      try {
        const ids = id !== null ? [id] : checkList;
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/board/deleteReactionList`,
          {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
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
        setModalText(cnt > 1 ? `${cnt}건 취소되었습니다.` : "취소되었습니다.");
        revalidate(); // loader 재실행
        setCheckList([]);
      } catch (error) {
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
              <i className="bi bi-chat-dots me-2 text-primary fs-3"></i>
              나의 반응 기록
            </h4>
            <small className="text-muted">
              • 내가 남긴 좋아요와 싫어요를 한눈에 확인할 수 있습니다.
              <br />• 언제든지 선택을 취소하여 반응을 변경할 수 있습니다.
              <br />
              <strong>
                • 게시글이 삭제되면 선택하신 반응기록들도 같이 삭제됩니다.
              </strong>
            </small>
          </div>
        </div>
      </div>
      {/*검색 옵션*/}
      <div className="row mb-4 align-items-center">
        {/* 왼쪽구역 */}
        <div className="col-md-5 d-flex gap-3 align-items-center">
          <select
            className="form-select shadow-sm"
            style={{ maxWidth: "180px" }}
            value={order}
            onChange={changeOrder}
          >
            <option value="">최신순</option>
            <option value="old">오래된순</option>
          </select>

          <PageSelctor
            pageSize={pageSize}
            onChangeSelector={(e) => changePageSize(Number(e.target.value))}
          />

          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.preventDefault();
              cancelHandle();
            }}
            disabled={!checkList || checkList.length === 0}
          >
            선택취소
          </button>
        </div>

        {/* 오른쪽구역 */}
        <div className="col-md-7 d-flex justify-content-end align-items-center gap-3">
          <small className="text-muted fw-bold mt-3">
            검색결과 : {totalCount} 건
          </small>

          <select
            className="form-select shadow-sm"
            style={{ maxWidth: "140px" }}
            value={inputFilter}
            onChange={(e) => setInputFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="like">👍 좋아요</option>
            <option value="dislike">👎 싫어요</option>
          </select>

          {/* 검색 기준 */}
          <select
            className="form-select shadow-sm"
            style={{ maxWidth: "140px" }}
            value={inputQw}
            onChange={(e) => setInputQW(e.target.value)}
          >
            <option value="">전체</option>
            <option value="title">제목</option>
            <option value="writer_name">작성자</option>
          </select>

          {/* 검색 */}
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
              placeholder="제목 또는 작성자 검색"
              onChange={(e) => setInputQ(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </form>
        </div>
      </div>
      {list && list.length > 0 ? (
        <table className="table align-middle mb-0 table-hover"  style={{ tableLayout: "fixed" }}>
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: "5%" }}>
                <input
                  type="checkbox"
                  checked={
                    checkList.length > 0 && checkList.length === list.length
                  }
                  onChange={AllcheckNum}
                />
              </th>
              <th style={{ width: "8%" }}>번호</th>
              <th style={{ width: "12%" }}>평가</th>
              <th style={{ width: "35%" }} className="text-start">
                제목
              </th>
              <th style={{ width: "10%" }}>작성자</th>
              <th style={{ width: "20%" }}>선택 날짜</th>
              <th style={{ width: "10%" }}>취소</th>
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
                <td>{(page - 1) * pageSize + index + 1}</td>

                <td className="fw-semibold">
                  {item.type === "LIKE" ? (
                    <span className="text-success">👍 좋아요</span>
                  ) : (
                    <span className="text-danger">👎 싫어요</span>
                  )}
                </td>

                {/* 제목 클릭  */}
                <td className="text-start" style={{ cursor: "pointer" }}>
                  <Link
                    to={`/boardDetail/${item.board_id}/none`}
                    className="text-decoration-none text-dark"
                  >
                    <div
                      className="text-truncate"
                      style={{ maxWidth: "300px" }}
                    >
                      {item.title}
                    </div>
                  </Link>

                  {/* HOT 표시 */}
                  {item.like_count - item.dislike_count > 0 && (
                    <span className="badge bg-danger ms-2">HOT</span>
                  )}
                </td>
                <td>{item.writer_name}</td>
                <td>{item.create_day?.slice(0, 10)}</td>

                {/* 취소 버튼 */}
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      cancelHandle(item.id);
                    }}
                  >
                    취소
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="table-responsive">
            <div className="d-flex flex-column align-items-center py-5">
              <img
                src="/images/noData.jpg"
                alt="No Results Found"
                style={{ width: "240px", opacity: 0.85 }}
              />
              <h5 className="mt-4 fw-semibold">
                나의 반응 기록 게시물이 없습니다.
              </h5>
            </div>
          </div>
        </div>
      )}

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

export default MyReactionList;
