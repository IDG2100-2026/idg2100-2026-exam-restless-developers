import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gamesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatVariant(variant) {
  if (!variant) return '—'
  return `Best of ${variant.rounds} · ${variant.timePerRound}s`
}

function UserGamesPage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 20

  useEffect(() => {
    if (!user) { setLoading(false); return }
    async function fetchGames() {
      setLoading(true)
      try {
        const data = await gamesApi.getAll({
          status: 'finished',
          page,
          limit,
        })
        const userGames = data.games.filter(g =>
          g.playerOne?._id === user._id || g.playerTwo?._id === user._id
        )
        setGames(userGames)
        setTotalPages(data.pagination.pages)
      } catch (err) {
        setError('Could not load games.')
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [user, page])

  if (!user) return (
    <div className="page page-narrow">
      <h1>Games</h1>
      <p>You need to be logged in to view this page.</p>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1>{username}'s Games</h1>
        <Link to={`/users/${username}`} className="btn-ghost">← Back to Profile</Link>
      </div>

      {loading && <p className="placeholder">Loading games…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && games.length === 0 && (
        <p className="placeholder">No finished games found.</p>
      )}

      {!loading && !error && games.length > 0 && (
        <>
          <ul className="game-list">
            {games.map(game => {
              const won = game.winner?._id === user._id || game.winner === user._id
              return (
                <li key={game._id} className="game-card">
                  <Link to={`/games/${game._id}`}>
                    <span className="game-variant">{formatVariant(game.variant)}</span>
                    <span className="game-players">
                      {game.playerOne?.username ?? '?'} vs {game.playerTwo?.username ?? '?'}
                    </span>
                    <span className={`result-badge ${won ? 'result-win' : 'result-loss'}`}>
                      {won ? 'Win' : 'Loss'}
                    </span>
                    <span className="game-players">{new Date(game.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn-ghost" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button className="btn-ghost" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UserGamesPage
