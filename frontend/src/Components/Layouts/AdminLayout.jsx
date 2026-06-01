import { Outlet } from "react-router-dom";
import Header from "../Header/Header.jsx";

function AdminLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default AdminLayout;