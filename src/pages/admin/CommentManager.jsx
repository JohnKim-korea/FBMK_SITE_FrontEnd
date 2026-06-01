import {
  PageNavigator,
  PageSelctor,
} from "@/components/common/usePageNavigator";
import { useEffect, useState } from "react";
import {
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../auth/MyAuthContext";
import { Alert, Confirm } from "@/components/common/Modal";
import { safeFetch } from "@/components/common/safeFetch";

function CommentManager() {
  const { adminUser, adminLogout, adminLoading } = useAuth();
  const navigate = useNavigate();
  const jsonData = useLoaderData();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const order = searchParams.get("order") || "";
  const q = searchParams.get("q") || "";
  const qw = searchParams.get("qw") || "";
  const [inputQw, setInputQW] = useState(qw);
  const [inputQ, setInputQ] = useState(q);
  const list = jsonData.allCommentList;
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
  const [loading, setLoading] = useState(false);

  const onChangeCheckHandle = (e) => {
    const ischecked = e.target.checked;
    const value = e.target.value;
    if (ischecked) {
      setCheckList((prev) => [...prev, value]);
    } else {
      setCheckList((prev) => prev.filter((item) => item !== value));
    }
  };
  
  const goCommentPage = async (item) => {
    if (loading) return;
    setLoading(true);

     try {
       const data = await safeFetch(
         `${import.meta.env.VITE_API_ADMIN}/commentSearchPage`,
         {
           method: "POST",
           credentials: "include",
           headers: {
             "Content-Type": "application/json",
           },
           body: JSON.stringify(item),
         },
       );

       const { page, parent_id } = data;

       if (!page || page <= 0) {
         setShowModal(true);
         setModalText("이미 삭제된 게시물입니다.");
         return;
       }

       if (!item.board_id || !item.id) {
         console.error("잘못된 데이터", item);
         return;
       }

       navigate(
         `/boardDetail/${item.board_id}/myBoardList?page=${page}${
           parent_id ? `&parent_id=${parent_id}` : ""
         }#${
           item.parent_id === 0
             ? `commentView-${item.id}`
             : `replyView-${item.id}`
         }`,
       );
     } catch (err) {
       console.error("요청 실패", err);
       setShowModal(true);
       setModalText("네트워크 오류가 발생했습니다.");
     } finally {
       setLoading(false);
     }
  };

  // const goCommentPage = async (item) => {
  //   const res = await fetch(
  //     `${import.meta.env.VITE_API_ADMIN}/commentSearchPage`,
  //     {
  //       method: "POST",
  //       credentials: "include",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(item),
  //     },
  //   );
  //   debugger;
  //   const data = await res.json();
  //   const page = data.page;
  //   const parent_id = data.parent_id;

  //   if (page === 0 || page === undefined) {
  //     setShowModal(true);
  //     setModalText("이미 삭제된 게시물입니다.");
  //     setAlertState("none");
  //     return;
  //   }

  //   navigate(
  //     `/boardDetail/${item.board_id}/boardList?page=${page}${
  //       parent_id ? `&parent_id=${parent_id}` : ""
  //     }#${
  //       item.parent_id === 0 ? `commentView-${item.id}` : `replyView-${item.id}`
  //     }`,
  //   );
  // };

  const changePage = (newPage) => {
    navigate(
      `?page=${newPage}&pageSize=${pageSize}&qw=${inputQw}&q=${inputQ}&order=${order}`,
    );
  };

  const changePageSize = (newSize) => {
    navigate(
      `?page=1&pageSize=${newSize}&qw=${inputQw}&q=${inputQ}&order=${order}`,
    );
  };

  const changeOrder = (e) => {
    const newOrder = e.target.value;
    navigate(
      `?page=1&pageSize=${pageSize}&qw=${inputQw}&q=${inputQ}&order=${newOrder}`,
    );
  };

  const handleSearch = () => {
    navigate(
      `?page=1&pageSize=${pageSize}&qw=${inputQw}&q=${inputQ}&order=${order}`,
    );
  };

  const AllcheckNum = (e) => {
    const isCheck = e.target.checked;
    const lowCheckBox = e.currentTarget
      .closest("table")
      .querySelectorAll('[data-group="check"]:not(:disabled)');
    const arrayIds = Array.from(lowCheckBox, (ck) => ck.value);
    setAllCheckCount(arrayIds.length);
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
        `${import.meta.env.VITE_API_ADMIN}/deleteCommentList`,
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
      setModalText(
        cnt > 1 ? `${cnt}건 삭제처리되었습니다.` : "삭제처리되었습니다.",
      );
      revalidate(); // loader 재실행
      setCheckList([]);
    } catch (error) {
      setShowModal(true);
      setAlertState("error");
      setModalText(error.status + ":" + error.message);
    }
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
        { replace: true },
      );
    }
  }, [page, totalPage]);

  //  useEffect(() => {
  //     console.log("현재 체크된 리스트:", checkList);
  //  }, [checkList]);
  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1">
              <i className="bi bi-chat-dots me-2 text-primary fs-3"></i>
              <i className="fa-solid fa-gears me-2 text-primary"></i>
              댓글 관리
            </h4>
            <small className="text-muted">
              해당 댓글들을 관리 할수있는 곳입니다.
            </small>
          </div>
        </div>
      </div>
      {/*검색 옵션*/}
      <div className="row mb-4 align-items-center">
        {/* 왼쪽구역 */}
        <div className="col-md-6 d-flex gap-3 align-items-center">
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
            style={{ maxWidth: "180px" }}
            value={inputQw}
            onChange={(e) => setInputQW(e.target.value)}
          >
            <option value="">전체</option>
            <option value="parent">댓글</option>
            <option value="child">대댓글</option>
            <option value="childY">답글 있는 댓글</option>
            <option value="childN">답글 없는 댓글</option>
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
                  <th style={{ width: "5%" }}>
                    <input
                      type="checkbox"
                      checked={
                        (checkList.length > 0 && checkList.length) ===
                        allCheckCount
                      }
                      onChange={AllcheckNum}
                    />
                  </th>
                  <th style={{ width: "8%" }}>번호</th>
                  <th style={{ width: "10%" }}>종류</th>
                  <th style={{ width: "37%" }} className="text-start">
                    내용
                  </th>
                  <th style={{ width: "8%" }}>IP</th>
                  <th style={{ width: "17%" }}>작성일</th>
                  <th style={{ width: "15%" }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`text-center ${item.parent_id === 0 ? "parent-comment" : "child-comment"}`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        data-group="check"
                        value={item.id}
                        disabled={Number(item.deleted) === 1}
                        checked={checkList.includes(item.id.toString())}
                        onChange={onChangeCheckHandle}
                      />
                    </td>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td className={`fw-semibold`}>
                      {item.parent_id === 0 ? "댓글" : "답글"}
                    </td>
                    <td
                      className="text-start"
                      onClick={() => goCommentPage(item)}
                    >
                      {item.content}
                    </td>
                    <td>
                        {item.ip}
                    </td>
                    <td className="text-center">
                      {item.create_day?.slice(0, 10)}
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          type="button"
                          className={`btn btn-sm ${item.deleted ? "btn-danger-subtle" : "btn-danger"}`}
                          disabled={item.deleted}
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
              <h5 className="mt-4 fw-semibold">댓글이 없습니다.</h5>
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

export default CommentManager;
