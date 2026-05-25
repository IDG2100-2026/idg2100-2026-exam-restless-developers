import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gamesApi, tournamentsApi } from '../services/api'
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

function LobbyPreview({ games, lobbySize }) {
  const waiting = games.filter(g => g.status === 'waiting').slice(0, lobbySize)

  if (!waiting.length) return <p className="placeholder">No games waiting for players right now.</p>

  return (
    <ul className="game-list">
      {waiting.map(game => (
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
  )
}

function TopGames({ games }) {
  const top = [...games]
    .filter(g => g.status === 'ongoing' || g.status === 'finished')
    .sort((a, b) => avgElo(b.playerOne, b.playerTwo) - avgElo(a.playerOne, a.playerTwo))
    .slice(0, 5)

  if (!top.length) return <p className="placeholder">No active games right now.</p>

  return (
    <ul className="game-list">
      {top.map(game => (
        <li key={game._id} className="game-card">
          <Link to={`/games/${game._id}`}>
            <span className="game-variant">{formatVariant(game.variant)}</span>
            <span className="game-players">
              {game.playerOne?.username ?? '?'} vs {game.playerTwo?.username ?? '?'} · Avg Elo: {avgElo(game.playerOne, game.playerTwo)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function TournamentPreview({ tournaments }) {
  const upcoming = [...tournaments]
    .filter(t => t.status === 'upcoming')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5)

  if (!upcoming.length) return <p className="placeholder">No upcoming tournaments.</p>

  return (
    <ul className="tournament-list">
      {upcoming.map(t => (
        <li key={t._id} className="tournament-card">
          <Link to={`/tournaments/${t._id}`}>
            <span className="tournament-title">{t.title}</span>
            <span className="tournament-meta">
              {new Date(t.startDate).toLocaleDateString()} · {formatVariant(t.variant)} · {t.participants.length} joined
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { appearance } = useAppearance()
  const lobbySize = appearance.lobbySize

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, tournamentsRes] = await Promise.all([
          gamesApi.getAll({ limit: 20 }),
          tournamentsApi.getAll({ limit: 10 }),
        ])
        setGames(gamesRes.games)
        setTournaments(tournamentsRes.tournaments)
      } catch (err) {
        setError('Could not load data. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Spanish Poker Dice</h1>
        <p>Play Spanish Poker Dice with style. This game was made with love by a student from Web Development. Create, join or watch games!</p>
        <button className="btn-primary" onClick={() => navigate('/games/new')}>
          Create New Game
        </button>
      </section>

      <section className="section lobby-preview">
        <h2>Join a Game</h2>
        {loading ? <p className="placeholder">Loading...</p> : error ? <p className="error">{error}</p> : <LobbyPreview games={games} lobbySize={lobbySize} />}
      </section>

      <section className="section top-games">
        <h2>Top Games</h2>
        {loading ? <p className="placeholder">Loading...</p> : error ? <p className="error">{error}</p> : <TopGames games={games} />}
      </section>

      <section className="section tournament-preview">
        <h2>Upcoming Tournaments</h2>
        {loading ? <p className="placeholder">Loading...</p> : error ? <p className="error">{error}</p> : <TournamentPreview tournaments={tournaments} />}
      </section>
    </div>
  )
}

export default HomePage
