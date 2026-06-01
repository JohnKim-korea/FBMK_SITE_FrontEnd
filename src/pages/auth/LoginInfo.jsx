import { useGoogleLogin } from "@react-oauth/google";
import { useState,useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert} from "@/components/common/Modal";
import { useAuth } from "./MyAuthContext";

function LoginInfo() {
  const {setAdminUser} = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [alertState, setAlertState] = useState("");
  const [showLoginModal,setLoginModal] = useState(false);
  const {user,login} = useAuth();
  const [adminId , setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const Googlelogin = useGoogleLogin({
    onSuccess: async (tokenRes) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
          method: "POST",
          headers: {"Content-Type": "application/json" },
          credentials: "include", // refresh 쿠키 받기 위해 필수
          body: JSON.stringify({
            accessToken: tokenRes.access_token,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || "로그인 처리 실패");
        }
       
        login(result.userVO, result.accessToken);
        
       const stateData = result.register // true / false
         ? {
             alertState: "success",
             modalText: "회원가입되었습니다.",
             showModal: true,
           }
         : {
             alertState: "",
             modalText: "",
             showModal: false,
           };

        document.cookie = "loginState=1; path=/; max-age=1209600";
        //  로그인 및 회원가입 후 이동
        
        navigate(`${result.register ? "/?registerState=true" : "/?loginState=true"}`, {
          state: stateData,
          replace: true,
        });
       
      } catch (error) {
        if(error.message === "suspanded_member"){
           setAlertState("error");
           setModalText("정지된 계정이며 로그인하실수 없습니다.");
           setShowModal(true);
           return;
        }
        
        setAlertState("error");
        setModalText(error.message || "서버 오류");
        setShowModal(true);
      }
    },
    onError: () => {
      setAlertState("error");
      setModalText("Google 로그인 실패");
      setShowModal(true);
    },
  });

  const goAdminLogin = (e) => {
    e.preventDefault();
    setLoginModal(true);
  }



  const handleSubmit = async(e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append("adminId", adminId);
    params.append("password", password);
    try{
       const res = await fetch(`${import.meta.env.VITE_API_ADMIN}/loginProc`, {
        method: "POST",
        body: params,
        credentials: "include", 
      });

      if(!res.ok) {
        const errorData = await res.json();  
        const errorMessage = errorData.message || res.statusText || "로그인 실패";
        const error = new Error(errorMessage);
        error.status = res.status;
        throw error;
      }
      
      document.cookie = "adminLoginState=1; path=/;";
      setLoginModal(false);
      setAdminUser({
        admin_id: adminId,
        role: "ROLE_시스템관리자",
      });
      navigate("/?adminLoginState=true",{replace: true});

    }catch(error){
        setShowModal(true);
        setAlertState("error");
        setModalText(error.message);
        return Promise.reject();
    }
  };

  useEffect(()=>{
    const handleEsc = (e) => {
      if(e.key === "Escape"){
        setLoginModal(false);
      }
    }

      if (showLoginModal) {
        window.addEventListener("keydown", handleEsc);
      }

       if (!showLoginModal) {
         setAdminId("");
         setPassword("");
       }

    return () => {
      window.removeEventListener("keydown",handleEsc);
    };
  },[showLoginModal])

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">
                <i
                  className="fa-solid fa-user-check me-2"
                  style={{ color: "#3b82f6" }}
                ></i>
                간편 로그인
              </h4>

              <Link to="/" className="text-decoration-none small">
                <i className="fa-solid fa-house me-1"></i> 홈
              </Link>
            </div>

            <p className="text-muted text-center small mb-4">
              Google 계정을 사용하여 안전하게 로그인 및 회원가입을{" "}
              <span className="fw-bold">동시에</span>
              <br /> 사용할 수 있습니다.
            </p>

            <div className="d-flex justify-content-center">
              <button
                className="gsi-material-button w-100"
                onClick={(e) => {
                  e.preventDefault();
                  Googlelogin();
                }}
              >
                <div className="gsi-material-button-state"></div>

                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>

                  <span className="gsi-material-button-contents">
                    구글 계정으로 로그인
                  </span>
                </div>
              </button>
            </div>
            <p className="text-muted small text-center mt-4 mb-0">
              로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
            <div className="mt-3 text-center">
              <hr />
              <Link
                onClick={goAdminLogin}
                className="text-decoration-none text-dark"
              >
                관리자 로그인
              </Link>
              <p className="text-muted text-center small mt-2">
                관리자 로그인은 해당 관리자의 권한이 있어야 로그인이 가능합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${showLoginModal ? "show" : ""}`}>
        <div className={`modal-box ${showLoginModal ? "slide-down" : ""}`}>
          <h5 className="mb-3">
            <i className="bi bi-person-lock" style={{color : "#726b02"}}></i>
            관리자 로그인
          </h5>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="adminId"
              placeholder="아이디"
              className="form-control mb-2"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
            />

            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              className="form-control mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="btn w-100" style={{backgroundColor : "#2c3e50", color: "#fff"}}>
              로그인
            </button>
          </form>

          <button
            onClick={() => setLoginModal(false)}
            className="btn btn-sm btn-secondary mt-2 w-100"
          >
            닫기
          </button>
        </div>
      </div>

      {showModal && (
        <Alert
          alertState={alertState}
          modalText={modalText}
          setShowModal={setShowModal}
          showModal={showModal}
        />
      )}
    </div>
  );
}
export default LoginInfo;
