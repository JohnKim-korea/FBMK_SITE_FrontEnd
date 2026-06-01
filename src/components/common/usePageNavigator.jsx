
function PageSelctor({ onChangeSelector, pageSize }) {
  return (
    <>
      <select
        value={pageSize}
        onChange={onChangeSelector}
        className="form-select shadow-sm"
        style={{ maxWidth: "150px"}}
      >
        <option value={10}>10개씩 보기</option>
        <option value={20}>20개씩 보기</option>
        <option value={100}>100개씩 보기</option>
      </select>
    </>
  );
}

function CommentPageNavigator({ page, totalPage, changePage,setIsClick }) {
  return (
    <div className="commentPageNavigator">
      <button
        className="page-item"
        disabled={page === 1}
        onClick={() => {
          setIsClick(true);
          changePage(Math.max(page - 1, 1));
        }}
      >
        이전
      </button>

      {Array.from({ length: totalPage }, (_, i) => i + 1).map((num) => (
        <button
          key={num} // 아이고 key 값 안정하면 개발자 도구에서 자꾸 지랄하네
          className={page === num ? "active" : ""}
          onClick={() => {
            setIsClick(true);
            changePage(num);
          }}
        >
          {num}
        </button>
      ))}

      <button
        className="page-item"
        disabled={page === totalPage}
        onClick={() => {
          setIsClick(true);
          changePage(Math.min(page + 1, totalPage));
        }}
      >
        다음
      </button>
    </div>
  );
}

function PageNavigator({ page, totalPage, changePage }) {
  return (
    <nav className="mt-4">
      <ul className="pagination justify-content-center shadow-sm">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button
            className="page-link nav-btn"
            onClick={() => changePage(Math.max(page - 1, 1))}
          >
            이전
          </button>
        </li>

        {Array.from({ length: totalPage }, (_, i) => i + 1).map((num) => ( // .map 배열및 리스트를 새로운 배열로 만드는함수
          <li key={num} className={`page-item ${page === num ? "active" : ""}`}>
            <button
              className="page-link fw-bold"
              onClick={() => changePage(num)}
            >
              {num}
            </button>
          </li>
        ))}

        <li className={`page-item ${page === totalPage ? "disabled" : ""}`}>
          <button
            className="page-link nav-btn"
            onClick={() => changePage(Math.min(page + 1, totalPage))}
          >
            다음
          </button>
        </li>
      </ul>
    </nav>
  );
}


  // page 현재페이지 초깃값:1
  // pageSize 페이지당 보여줄개수
  // totalPage 전체페이지 개수
  // startIndex 잘라낼 시작인덱스
  // endIndex  잘라낼 끝인덱스


  // useEffect(() => { DB랑 연동했을때를 대비하자
  //   const fetchBoard = async () => {
  //     const response = await fetch(
  //       `/api/board?page=${page}&size=${pageSize}&search=${searchText}`,
  //     );

  //     const result = await response.json();

  //     setData(result.content); // 현재 페이지 데이터
  //     setTotalCount(result.total); // 전체 개수
  //   };

  //   fetchBoard();
  // }, [page, pageSize, searchText]);


export { PageNavigator, CommentPageNavigator, PageSelctor };