import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gamesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAppearance } from '../context/AppearanceContext'

function formatVariant(variant) {
  if (!variant) return '—'
  const straights = variant.straightsAllowed ? 'Straights' : 'No straights'
  return `Best of ${variant.rounds} · ${variant.timePerRound}s · ${straights}`
}

function avgElo(playerOne, playerTwo) {
  const elos = [playerOne?.eloRating, playerTwo?.eloRating].filter(Boolean)
  if (!elos.length) return '—'
  return Math.round(elos.reduce((a, b) => a + b, 0) / elos.length)
}

function LobbyPage() {
  const { user } = useAuth()
  const { appearance } = useAppearance()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchGames() {
      try {
        const data = await gamesApi.getAll({ status: 'waiting', limit: appearance.lobbySize })
        setGames(data.games)
      } catch (err) {
        setError('Could not load games. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [appearance.lobbySize])

  const joinableGames = games.filter(game => {
    // hide the user's own game
    if (user && game.playerOne?._id === user._id) return false
    // hide registered-only games from anonymous users
    if (!user && !game.isAnonymous) return false
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1>Lobby</h1>
        <button className="btn-primary" onClick={() => navigate('/games/new')}>
          Create Game
        </button>
      </div>

      {loading && <p className="placeholder">Loading games…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && joinableGames.length === 0 && (
        <p className="placeholder">No games available to join right now. Why not create one?</p>
      )}

      {!loading && !error && joinableGames.length > 0 && (
        <ul className="game-list">
          {joinableGames.map(game => (
            <li key={game._id} className="game-card">
              <Link to={`/games/${game._id}`}>
                <span className="game-variant">{formatVariant(game.variant)}</span>
                <span className="game-players">
                  {game.playerOne?.username ?? 'Anonymous'} · Avg Elo: {avgElo(game.playerOne, game.playerTwo)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LobbyPage
