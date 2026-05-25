import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import LobbyPage from './pages/LobbyPage'
import CreateGamePage from './pages/CreateGamePage'
import GamePage from './pages/GamePage'
import TournamentsPage from './pages/TournamentsPage'
import TournamentPage from './pages/TournamentPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserProfilePage from './pages/UserProfilePage'
import UserGamesPage from './pages/UserGamesPage'
import AboutUsPage from './pages/AboutUsPage'
import AboutGamePage from './pages/AboutGamePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/games/new" element={<CreateGamePage />} />
          <Route path="/games/:id" element={<GamePage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:id" element={<TournamentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/users/:username" element={<UserProfilePage />} />
          <Route path="/users/:username/games" element={<UserGamesPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/about-game" element={<AboutGamePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
