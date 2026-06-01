import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import ScrollToTop from "@/components/common/ScrollTop";
import { Link } from "react-router-dom";
//import { AuthProvider } from "@/pages/auth/MyAuthContext";

function ErrorPage() {
 const error = useRouteError();
 console.log(error);
 
 let status = "Error";
 let message = "예기치 못한 오류가 발생했습니다.";

 if (isRouteErrorResponse(error)) {
   status = error.status;
   message = error.data || error.statusText || message;
 } else if (error instanceof Error) {
   message = error.message;
 }    

  return (
    <>
        <ScrollToTop />
        <Header />
        <main
          className="d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "#dbefff", minHeight: "90vh" }}
        >
          <div
            className="text-center bg-white p-5 rounded shadow-sm"
            style={{ minWidth: "350px" }}
          >
            <h1 className="display-4 text-danger fw-bold mb-3">{status}</h1>
            <p className="lead mb-4">{message}</p>

            <div className="d-flex justify-content-center gap-3">
              <Link
                to="/"
                className="btn btn-outline-primary d-flex align-items-center gap-2"
              >
                <i className="bi bi-house-door-fill"></i>
                홈으로 이동
              </Link>

              <Link
                to="/boardList"
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <i className="bi bi-card-list"></i>
                게시판으로 이동
              </Link>
            </div>
          </div>
        </main>
        <Footer />
    </>
  );
}

export default ErrorPage;
