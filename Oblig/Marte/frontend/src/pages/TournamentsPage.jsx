import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tournamentsApi } from '../services/api'

function formatVariant(variant) {
  if (!variant) return '—'
  const straights = variant.straightsAllowed ? 'Straights' : 'No straights'
  return `Best of ${variant.rounds} · ${variant.timePerRound}s · ${straights}`
}

const STATUS_LABEL = { upcoming: 'Upcoming', ongoing: 'Ongoing', finished: 'Finished' }

function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const data = await tournamentsApi.getAll({ limit: 50 })
        setTournaments(data.tournaments)
      } catch (err) {
        setError('Could not load tournaments. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  return (
    <div className="page">
      <h1>Tournaments</h1>

      {loading && <p className="placeholder">Loading tournaments…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && tournaments.length === 0 && (
        <p className="placeholder">No tournaments found.</p>
      )}

      {!loading && !error && tournaments.length > 0 && (
        <ul className="tournament-list">
          {tournaments.map(t => (
            <li key={t._id} className="tournament-card">
              <Link to={`/tournaments/${t._id}`}>
                <div>
                  <span className="tournament-title">{t.title}</span>
                  <span className="tournament-meta">{formatVariant(t.variant)}</span>
                </div>
                <div className="tournament-right">
                  <span className="tournament-meta">{new Date(t.startDate).toLocaleDateString()}</span>
                  <span className="tournament-meta">{t.participants.length} / {t.maxPlayers} players</span>
                  <span className={`status-badge status-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TournamentsPage
