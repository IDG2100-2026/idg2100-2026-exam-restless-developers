import { Outlet } from "react-router-dom";
import AdminHeader from "../Header/AdminHeader.jsx";

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default AdminLayout;