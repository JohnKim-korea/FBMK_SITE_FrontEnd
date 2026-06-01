import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="aside-bg">
      <div className="sidebar-size">
        <i className="fa-solid fa-columns"></i> 관리자 목록
      </div>

      <nav className="d-flex flex-column gap-2 ">
        <NavLink to="/admin/ipManager" className="sidebar-link">
          IP 관리
        </NavLink>

        <NavLink to="/admin/boardManager" className="sidebar-link">
          게시글 관리
        </NavLink>

        <NavLink to="/admin/CommentManager" className="sidebar-link">
          댓글 관리
        </NavLink>

        <NavLink to="/admin/MemberManager" className="sidebar-link">
          회원 관리
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;