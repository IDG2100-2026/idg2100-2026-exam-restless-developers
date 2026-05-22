import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import LobbyPage from "./pages/LobbyPage.jsx";
import CreateGamePage from "./pages/CreateGamePage.jsx";
import IndividualGamePage from "./pages/IndividualGamePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import IndividualUserProfilePage from "./pages/IndividualUserProfilePage.jsx"
import AboutUsPage from "./pages/AboutUsPage.jsx";
import AboutSpanishDicePage from "./pages/AboutSpanishDicePage.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Terms from "./pages/Terms.jsx";



function App() {
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/create" element={<CreateGamePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/profile/:id" element={<IndividualUserProfilePage />} />
        <Route path="/match/:id" element={<IndividualGamePage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/about-dice" element={<AboutSpanishDicePage />} />
        <Route path="/privacy" element={ <PrivacyPolicy/>} />
        <Route path="/terms" element={<Terms/>} /> 
      </Routes>
    <Footer/>
    </BrowserRouter>
  );
}

export default App;