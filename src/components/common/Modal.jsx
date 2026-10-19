import { useEffect, useRef, useState } from "react";

function Alert({ alertState = "",modalText, setShowModal, showModal }) {
  const modalRef = useRef(null);
  useEffect(() => {
    modalRef.current.focus();
    const pressEnter = (e) => {
      if (e.key === "Enter" && e.target === modalRef.current) {
        setShowModal(false);
      }
    };
    document.addEventListener("keydown", pressEnter);
    return () => {
      document.removeEventListener("keydown", pressEnter);
    };
  }, [showModal]);

  return (
    <>
      <div
        ref={modalRef}
        className="modal d-block"
        tabIndex="-1"
        onClick={() => setShowModal(false)}
      >
        {/*해당 modal d-block 클래스는 화면 전체 영역을 감싸고있음 */}
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 부모의 이벤트 함수 무시하는 함수  #00BFFF*/}
          <div className="modal-content border-0 shadow">
            <div
              className={`modal-header text-white ${
                alertState === "success"
                  ? "bg-success"
                  : alertState === "error"
                    ? "bg-danger"
                    : alertState === "warning"
                      ? "bg-warning text-dark"
                      : ""
              }`}
              style={
                alertState !== "success" && alertState !== "error"
                  ? { backgroundColor: "#00BFFF" }
                  : {}
              }
            >
              <h5 className="modal-title fw-bold">알림</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body mt-2">
              <p
                className="fw-bold text-center fs-5"
                style={{ whiteSpace: "pre-line" }}
              >
                {modalText}
              </p>
            </div>
            <div className="modal-footer justify-content-center">
              <button
                type="button"
                className="btn text-white fw-bold w-25"
                style={{ backgroundColor: "#00BFFF" }}
                onClick={() => setShowModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


function Confirm({buttonType = "default",confirmText = "",onConfirmResult}) {
  let headerClass = "";
  let confirmBtnClass = "";

  if (buttonType === "delete") {
    headerClass = "bg-danger text-white";
    confirmBtnClass = "btn btn-danger";
  } else if (buttonType === "update") {
    headerClass = "bg-warning text-dark";
    confirmBtnClass = "btn btn-warning";
  } else if (buttonType === "register") {
    headerClass = "bg-primary text-white";
    confirmBtnClass = "btn btn-primary";
  } else if (buttonType === "Excel") {
    headerClass = "bg-success text-white";
    confirmBtnClass = "btn btn-success";
  } else {
    headerClass = "bg-secondary text-white";
    confirmBtnClass = "btn btn-secondary";
  }
  return (
    <div className="modal d-block" tabIndex="-1" onClick={() => onConfirmResult(false)}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          
          <div className={`modal-header ${headerClass}`}>
            <h5 className="modal-title">확인</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => onConfirmResult(false)}/>
          </div>

          <div className="modal-body text-center">
            <p className="mb-0" style={{whiteSpace:"pre-line"}}>{confirmText}</p>
          </div>

          <div className="modal-footer justify-content-center gap-3">
            <button className={confirmBtnClass} onClick={() => onConfirmResult(true)}>
              확인
            </button>
            <button className="btn btn-secondary" onClick={() => onConfirmResult(false)}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



function PasswordModal({ showPasswordModal, setShowPasswordModal, onSubmitPassword}) {
  const inputRef = useRef(null);
  const [password, setPassword] = useState("");
  const [message,setMessage] = useState("암호는 최대 4~10자 까지 입력해주세요");
  useEffect(() => {
    if (showPasswordModal) {
      inputRef.current?.focus();
    }
    const pressEnter = (e) => {
      if (e.key === "Enter") {
        submitPassword();
      }
    };
    document.addEventListener("keydown", pressEnter);
    return () => {
      document.removeEventListener("keydown", pressEnter);
    };
  }, [showPasswordModal]);

  const submitPassword = () => {
    if (!password.trim()) {
      setMessage("암호를 입력해주세요..");
      return;
    }
    onSubmitPassword(password);
    setPassword("");
    setShowPasswordModal(false);
  };

  return (
    <>
      <div
        ref={inputRef}
        className="modal d-block"
        tabIndex="-1"
        onClick={() => setShowPasswordModal(false)}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow">
            <div
              className="modal-header text-white"
              style={{ backgroundColor: "#6094e2" }}
            >
              {/* 제목 */}
              <h5 className="modal-title fw-bold">
                <i className="fa-solid fa-lock me-2"></i> 암호 입력
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => {
                  setPassword("");
                  setShowPasswordModal(false)
                }}
              ></button>
            </div>
            {/* 바디 */}
            <div className="modal-body py-4">
              <p className="text-center fw-bold mb-4">
                {message}
              </p>
              <input
                ref={inputRef}
                type="password"
                className="form-control"
                placeholder="암호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="modal-footer justify-content-center border-0 pb-4">
              <button
                type="button"
                className="btn text-white px-4 fw-bold"
                style={{ backgroundColor: "#6094e2" }}
                onClick={submitPassword}
              >
                확인
              </button>

              <button
                type="button"
                className="btn btn-light border px-4 fw-bold"
                onClick={() => {
                  setPassword("");
                  setShowPasswordModal(false)
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { Alert, Confirm, PasswordModal };
