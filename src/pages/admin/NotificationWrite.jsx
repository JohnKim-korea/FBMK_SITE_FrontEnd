import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function NotificationWrite() {
   const { id } = useParams();

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmitHandle = async (e) => {
    e.preventDefault();

    if (content.trim().length === 0) {
      setMessage("알림 내용을 입력해주세요.");
      setIsSuccess(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", id);
      formData.append("content", content);

      const res = await fetch(
        `${import.meta.env.VITE_API_ADMIN}/sendNotification`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const result = await res.json();

      if (!res.ok) {
        const error = new Error(result?.message || "알림 전송 실패");
        error.status = result?.status || res.status;
        throw error;
      }

      setMessage("알림이 전송되었습니다.");
      setIsSuccess(true);
      setContent("");
      if (window.opener && !window.opener.closed) {
        window.opener.revalidateList();
      }
    } catch (error) {
        setMessage(error.status + ":" + error.message);
        setIsSuccess(false);
    }
  };

  useEffect(() => {
    if (message) {
      window.resizeTo(500, 500);
    } else {
      window.resizeTo(500, 420);
    }
  }, [message]);

  return (
    <div style={{ padding: "20px" }}>
      <h4 className="mb-4 fw-bold">
        <i className="bi bi-person-gear me-2 fs-3"></i>알림 보내기
      </h4>

      <form onSubmit={onSubmitHandle}>
        {/* 알림 내용 */}
        <div className="mb-3">
          <label className="form-label">알림 내용</label>
          <textarea
            className="form-control"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="알림 내용을 입력하세요"
            required
          />
        </div>

        {/* 버튼 */}
        <div className="d-flex justify-content-center gap-2 mt-4 mb-3">
          <button type="submit" className="btn btn-primary">
            전송
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.close()}
          >
            닫기
          </button>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`mt-3 p-2 rounded text-center ${
              isSuccess
                ? "bg-success-subtle text-success"
                : "bg-danger-subtle text-danger"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default NotificationWrite;
