import { Outlet } from "react-router-dom";
import NavBar from "../navBar/navBar.jsx";
import Footer from "../footer/footer.jsx";

const AppShell = () => {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppShell;