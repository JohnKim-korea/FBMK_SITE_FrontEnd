import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import ScrollToTop from "@/components/common/ScrollTop";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/pages/auth/MyAuthContext";
import { useEffect } from "react";
import ScrollTopButton from "../common/ScrollTopButton";


function Layout() {
  const { initAuth, adminInitAuth, checkLoginStateCookie } = useAuth();
  const location = useLocation();
  const showSidbar = location.pathname.startsWith("/login/");
  const showAdminSidbar = location.pathname.startsWith("/admin/");
  const isLoginInfo = location.pathname === "/loginInfo";
  const isStudyDetail = location.pathname === "/studyDetail";

  useEffect(() => {
    initAuth();
    adminInitAuth();
    checkLoginStateCookie();
  }, [location.pathname]);
  
  return (
    <>
      <ScrollToTop />
      <Header />
      {!isStudyDetail && <ScrollTopButton />}
      <main
        className={
          isLoginInfo
            ? "vh-100 d-flex justify-content-center align-items-center"
            : "d-flex main-90"
        }
        style={{ backgroundColor: "#dbefff" }}
      >
        {showAdminSidbar ? <AdminSidebar /> : showSidbar ? <Sidebar /> : null}
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default Layout;


//location 객체 안에 들어있는 값
/*
  {
  pathname: "/login/reset",
  search: "?page=2",
  hash: "",
  state: null,
  key: "abc123"
  }

  속성	설명
  pathname	현재 URL 경로
  search	쿼리스트링
  hash	# 뒤에 붙는 값
  state	navigate로 전달한 상태값
  key	내부 식별값
*/