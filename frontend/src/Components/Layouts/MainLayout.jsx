import { Outlet } from "react-router-dom";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";

function MainLayout({ theme, onToggleTheme }) {
  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;