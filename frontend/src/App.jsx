import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Components/Header/Header.jsx";
import Footer from "./Components/Footer/Footer.jsx";

import Homepage from "./Pages/Homepage/Homepage.jsx";
import AboutUs from "./Pages/About/AboutUs.jsx";
import AboutSpanishDice from "./Pages/About/AboutSpanishDice.jsx";
import Admin from "./Pages/Admin/Admin.jsx";
import Lobby from "./Pages/Lobby/Lobby.jsx";
import Login from "./Pages/Login/Login.jsx";
import Register from "./Pages/Registration/Register.jsx";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy.jsx";
import Terms from "./Pages/Terms/Terms.jsx";
import TournamentList from "./Pages/Tournament/TournamentList.jsx";
import TournamentPage from "./Pages/Tournament/TournamentPage.jsx";
import Profile from "./Pages/User/Profile.jsx";
import CreateTournament from "./Pages/Tournament/CreateTournament.jsx";
import Unauthorized from "./Pages/Errors/Unauthorized.jsx";
import NotFound from "./Pages/Errors/NotFound.jsx";
import AdminUsers from "./Pages/Admin/AdminUsers.jsx";
import AdminComments from "./Pages/Admin/AdminComments.jsx";


function App() {
  return (
    <BrowserRouter>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/about-spanish-dice" element={<AboutSpanishDice />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/:id" element={<TournamentPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/tournaments/create" element={<CreateTournament />} />
          <Route path="/admin/tournaments/:id/edit" element={<CreateTournament />} />
          <Route path="/401" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;