import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Components/Header/Header.jsx";
import Footer from "./Components/Footer/Footer.jsx";

import Homepage from "./Pages/Homepage/Homepage.jsx";
import AboutUs from "./Pages/About/AboutUs.jsx";
import AboutSpanishDice from "./Pages/About/AboutSpanishDice.jsx";
import Admin from "./Pages/Admin/Admin.jsx";
import Lobby from "./Pages/Lobby/Lobby.jsx";
import Login from "./Pages/Login/Login.jsx";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy.jsx";
import Terms from "./Pages/Terms/Terms.jsx";
import TournamentList from "./Pages/Tournament/TournamentList.jsx";
import TournamentPage from "./Pages/Tournament/TournamentPage.jsx";
import Profile from "./Pages/User/Profile.jsx";
import CreateTournament from "./Pages/Tournament/CreateTournament.jsx";

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
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/:id" element={<TournamentPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;