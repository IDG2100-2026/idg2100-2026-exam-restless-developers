import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppearanceCustomizer from '../ui/AppearanceCustomizer'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">Spanish Poker Dice</Link>
        <nav className="nav">
          <Link to="/lobby">Lobby</Link>
          <Link to="/tournaments">Tournaments</Link>
          <Link to="/about-game">About the Game</Link>
        </nav>
        <AppearanceCustomizer />
        <div className="header-actions">
          {user ? (
            <div className="greeting">
              <Link to={`/users/${user.username}`} className="greeting-user">
                {user.avatar
                  ? <img src={user.avatar} alt={user.username} className="avatar-icon avatar-icon--img" />
                  : <span className="avatar-icon">👤</span>}
                <span>Hello, {user.username}</span>
              </Link>
              <button className="btn-ghost" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn-primary btn-small">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
