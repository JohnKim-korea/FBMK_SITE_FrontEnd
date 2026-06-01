import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="aside-bg">
      <div className="sidebar-size">
        <i className="fa-solid fa-columns"></i> 목록
      </div>

      <nav className="d-flex flex-column gap-2 ">
        <NavLink to="/login/myPage" className="sidebar-link">
          마이페이지
        </NavLink>

        <NavLink to="/login/myBoardList" className="sidebar-link">
          나의 게시글
        </NavLink>

        <NavLink to="/login/myComments" className="sidebar-link">
          나의 댓글들
        </NavLink>

        <NavLink to="/login/ReactionList" className="sidebar-link">
          좋아요 & 싫어요
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;