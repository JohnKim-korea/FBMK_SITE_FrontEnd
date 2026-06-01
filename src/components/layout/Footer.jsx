import { Link } from "react-router-dom";
import { useAuth } from "@/pages/auth/MyAuthContext";

function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-primary-light text-white mt-auto">
      <div className="container py-2.1 pt-2 text-center small ">
        <div className="mb-2">
          <Link to="/" className="text-white text-decoration-none me-3">
            Home
          </Link>

          <Link
            to="/boardList"
            className="text-white text-decoration-none me-3"
          >
            게시판
          </Link>
          {user ? (
            ""
          ) : (
            <Link to="/loginInfo" className="text-white text-decoration-none">
              로그인
            </Link>
          )}
        </div>
      </div>

      <hr className="border-white opacity-25 my-2" />

      <div className="container pb-3 text-center small">
        <img src="/images/favicon.png"  style={{ width: "40px", opacity: 0.85 }}/> 2026 자유게시판 . React 와 Spring 으로 만들었습니다.
      </div>
    </footer>
  );
}


export default Footer;
