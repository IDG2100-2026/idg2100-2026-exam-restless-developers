import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { tournamentsApi, commentsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatVariant(variant) {
  if (!variant) return '—'
  const straights = variant.straightsAllowed ? 'Straights' : 'No straights'
  return `Best of ${variant.rounds} · ${variant.timePerRound}s · ${straights}`
}

function TournamentPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)

  useEffect(() => {
    async function fetchTournament() {
      try {
        const data = await tournamentsApi.getById(id)
        setTournament(data.tournament)
      } catch (err) {
        setError('Could not load tournament.')
      } finally {
        setLoading(false)
      }
    }
    fetchTournament()
  }, [id])

  async function handleJoin() {
    setJoinError(null)
    setJoining(true)
    try {
      await tournamentsApi.join(id)
      const data = await tournamentsApi.getById(id)
      setTournament(data.tournament)
    } catch (err) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentError(null)
    setSubmitting(true)
    try {
      const data = await commentsApi.add({ content: comment, tournamentId: id })
      setTournament(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment],
      }))
      setComment('')
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page"><p className="placeholder">Loading tournament…</p></div>
  if (error) return <div className="page"><p className="error">{error}</p></div>

  const isParticipant = user && tournament.participants?.some(p => p._id === user._id)
  const isFull = tournament.participants?.length >= tournament.maxPlayers

  return (
    <div className="page">
      <div className="tournament-detail-header">
        <div>
          <h1>{tournament.title}</h1>
          <span className={`status-badge status-${tournament.status}`}>{tournament.status}</span>
        </div>
        {user && tournament.status === 'upcoming' && !isParticipant && !isFull && (
          <button className="btn-primary" onClick={handleJoin} disabled={joining}>
            {joining ? 'Joining…' : 'Join Tournament'}
          </button>
        )}
        {isParticipant && <span className="joined-badge">✓ Joined</span>}
      </div>

      {tournament.description && <p>{tournament.description}</p>}

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">{new Date(tournament.startDate).toLocaleDateString()}</span>
          <span className="stat-label">Start Date</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tournament.participants?.length} / {tournament.maxPlayers}</span>
          <span className="stat-label">Players</span>
        </div>
      </div>

      <section className="section">
        <h2>Format</h2>
        <p>{formatVariant(tournament.variant)}</p>
        {tournament.breakBetweenRounds && (
          <p className="profile-email">{tournament.breakBetweenRounds} min break between rounds</p>
        )}
      </section>

      {tournament.trophy && (
        <section className="section">
          <h2>Trophy</h2>
          <div className="trophy-item">
            <span>🏆</span>
            <span>{tournament.trophy.title}</span>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Participants ({tournament.participants?.length})</h2>
        {tournament.participants?.length === 0 ? (
          <p className="placeholder">No participants yet.</p>
        ) : (
          <ul className="participants-list">
            {tournament.participants.map(p => (
              <li key={p._id} className="participant-item">{p.username}</li>
            ))}
          </ul>
        )}
        {joinError && <p className="error">{joinError}</p>}
      </section>

      <section className="section">
        <h2>Comments</h2>
        {!tournament.comments?.length && <p className="placeholder">No comments yet.</p>}
        {tournament.comments?.length > 0 && (
          <ul className="comments-list">
            {tournament.comments.map(c => (
              <li key={c._id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{c.author?.username ?? 'Anonymous'}</span>
                  <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="comment-text">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
        <form className="comment-form" onSubmit={handleCommentSubmit} style={{ marginTop: '1rem' }}>
          <textarea
            className="comment-input"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Leave a comment…"
            rows={3}
          />
          {commentError && <p className="error">{commentError}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default TournamentPage
