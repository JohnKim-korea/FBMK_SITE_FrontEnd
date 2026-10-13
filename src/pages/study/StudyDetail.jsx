import { useNavigate } from "react-router-dom";


function StudyDetail() {
  const navigate = useNavigate();

  // 임시 학습 데이터
  const study = {
    category: "국어",
    subCategory: "문법",
    title: "사동 표현",
    completed: true,
    createDay: "2026-09-17",
    updateDay: "2026-09-17",

    content: `
        <h3>1. 사동 표현이란?</h3>

        <p>
            사동 표현은 주어가 다른 사람이나 대상에게 어떤 행동을 하도록
            만드는 것을 나타내는 표현이다.
        </p>

        <p>
            즉, 직접 행동하는 사람이 따로 있고 그 사람에게 행동을 하게
            만드는 사람이 있는 경우에 사용한다.
        </p>

        <p>
            예를 들어 <strong>‘철수가 동생을 앉혔다.’</strong>라는 문장에서
            동생이 앉는 행동을 직접 했지만, 철수가 동생에게 앉도록
            만들었기 때문에 사동 표현이 사용되었다.
        </p>


        <h3>2. 사동사의 형성</h3>

        <p>
            대표적인 사동 접미사에는
            <strong>‘-이-, -히-, -리-, -기-, -우-, -구-, -추-</strong> 등이 있다.
        </p>

        <p>다음과 같은 형태로 나타난다.</p>

        <p>
            먹다 → 먹이다<br/>
            입다 → 입히다<br/>
            울다 → 울리다<br/>
            웃다 → 웃기다<br/>
            자다 → 재우다<br/>
            돋다 → 돋우다<br/>
            낮다 → 낮추다
        </p>


        <h3>3. 사동 표현의 예</h3>

        <p>
            다음 문장을 비교해 보면 사동 표현의 의미를 쉽게 이해할 수 있다.
        </p>

        <p>
            <strong>① 아이가 밥을 먹었다.</strong><br/>
            → 아이가 직접 밥을 먹는 행동을 했다.
        </p>

        <p>
            <strong>② 엄마가 아이에게 밥을 먹였다.</strong><br/>
            → 엄마가 아이에게 밥을 먹도록 했다.
        </p>

        <p>
            <strong>① 동생이 옷을 입었다.</strong><br/>
            → 동생이 직접 옷을 입었다.
        </p>

        <p>
            <strong>② 엄마가 동생에게 옷을 입혔다.</strong><br/>
            → 엄마가 동생에게 옷을 입도록 했다.
        </p>


        <h3>4. 사동 표현과 주동 표현</h3>

        <p>
            주동 표현은 주어가 직접 행동하는 것을 나타내고,
            사동 표현은 주어가 다른 대상에게 행동을 하게 만드는 것을 나타낸다.
        </p>

        <p>
            <strong>주동:</strong> 아이가 문을 열었다.<br/>
            <strong>사동:</strong> 아버지가 아이에게 문을 열게 했다.
        </p>

        <p>
            이처럼 주동문에서는 행동을 직접 하는 대상이 주어가 되지만,
            사동문에서는 다른 대상에게 행동을 하도록 만드는 사람이
            주어가 된다.
        </p>


        <h3>5. 시험에서 주의할 점</h3>

        <p>
            사동 표현을 판단할 때에는 단순히 문장에 특정 접미사가
            포함되어 있는지만 확인해서는 안 된다.
        </p>

        <p>
            문장에서 <strong>누가 행동을 직접 하는지</strong>,
            그리고 <strong>누가 다른 대상에게 행동을 하도록 만드는지</strong>를
            확인해야 한다.
        </p>

        <p>
            특히 ‘-게 하다’와 같은 통사적 사동 표현도 사동의 의미를
            나타낼 수 있으므로 함께 알아두는 것이 좋다.
        </p>


        <h3>6. 핵심 정리</h3>

        <p>
            • 사동 표현: 다른 대상이 어떤 행동을 하도록 만듦<br/>
            • 대표적인 사동 접미사: -이-, -히-, -리-, -기-, -우-, -구-, -추-<br/>
            • 주동 표현: 주어가 직접 행동함<br/>
            • 사동 표현: 주어가 다른 대상에게 행동을 하도록 함<br/>
            • ‘-게 하다’도 사동의 의미를 나타낼 수 있음
        </p>

        <p>
            <strong>암기 포인트</strong><br/>
            사동 표현을 만나면 먼저
            <strong>“누가 실제 행동을 하는가?”</strong>를 확인한다.
            그리고 다른 대상에게 행동을 하도록 만드는 주체가 누구인지
            파악하면 사동 표현을 쉽게 구별할 수 있다.
        </p>
    `,
  };

  return (
    <div className="study-detail-container">
      {/* 상단 */}
      <div className="study-detail-top">
        {/* 경로 */}
        <div className="study-detail-path">
          <span>학습 도우미</span>
          <span>›</span>
          <span>{study.category}</span>
          <span>›</span>
          <span>{study.subCategory}</span>
        </div>

        {/* 상태 / 날짜 */}
        <div className="study-detail-info">
          <span
            className={`study-detail-status ${
              study.completed ? "completed" : ""
            }`}
          >
            {study.completed ? "암기" : "미암기"}
          </span>

          <span>등록일 {study.createDay}</span>
          <span>수정일 {study.updateDay}</span>
        </div>
      </div>

      {/* 상세 */}
      <div className="study-detail-card">
        <div className="study-detail-header">
          <h2>{study.title}</h2>
        </div>

        <div
          className="study-detail-content"
          dangerouslySetInnerHTML={{
            __html: study.content,
          }}
        />

        {/* 하단 버튼 */}
        <div className="study-detail-footer">
          <button type="button" className="btn btn-outline-primary">
            수정
          </button>

          <button type="button" className="btn btn-outline-danger">
            삭제
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            목록
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudyDetail;
