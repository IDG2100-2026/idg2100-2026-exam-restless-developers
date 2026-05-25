import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { gamesApi, commentsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
function formatVariant(variant) {
  if (!variant) return '—'
  const straights = variant.straightsAllowed ? 'Straights' : 'No straights'
  return `Best of ${variant.rounds} · ${variant.timePerRound}s · ${straights}`
}

function CommentsList({ comments }) {
  if (!comments?.length) return <p className="placeholder">No comments yet.</p>
  return (
    <ul className="comments-list">
      {comments.map(c => (
        <li key={c._id} className="comment">
          <div className="comment-header">
            <span className="comment-author">{c.author?.username ?? 'Anonymous'}</span>
            <span className="comment-date">{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          <p className="comment-text">{c.content}</p>
        </li>
      ))}
    </ul>
  )
}

function GamePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState(null)
  const intervalRef = useRef(null)
  const joinedRef = useRef(false)

  async function fetchGame() {
    try {
      const data = await gamesApi.getById(id)
      setGame(data.game)
      return data.game
    } catch (err) {
      setError('Could not load game.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    joinedRef.current = false
    async function init() {
      const loadedGame = await fetchGame()
      const isOwnGame = user && loadedGame?.playerOne?._id === user._id
      const canJoin = !user ? loadedGame?.isAnonymous : true
      if (
        loadedGame &&
        loadedGame.status === 'waiting' &&
        !isOwnGame &&
        canJoin &&
        !joinedRef.current
      ) {
        joinedRef.current = true
        try {
          await gamesApi.join(id)
          await fetchGame()
        } catch {
          // game may already be full or joined — just show current state
        }
      }
    }
    init()
    intervalRef.current = setInterval(() => {
      setGame(prev => {
        if (prev?.status === 'waiting') fetchGame()
        return prev
      })
    }, 15000)
    return () => clearInterval(intervalRef.current)
  }, [id])

  async function handleCommentSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentError(null)
    setSubmitting(true)
    try {
      const data = await commentsApi.add({ content: comment, gameId: id })
      setGame(prev => ({
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

  if (loading) return <div className="page"><p className="placeholder">Loading game…</p></div>
  if (error) return <div className="page"><p className="error">{error}</p></div>

  return (
    <div className="game-page">
      <div className="game-main">
        <div className="game-info">
          <h1>Game</h1>
          <p className="game-variant-label">{formatVariant(game.variant)}</p>
        </div>

        <div className="game-board-area">
          <div className="game-players">
            <div className="player-card">
              <span className="player-name">{game.playerOne?.username ?? 'Player 1'}</span>
              <span className="player-elo">Elo: {game.playerOne?.eloRating ?? '—'}</span>
            </div>
            <span className="vs">vs</span>
            <div className="player-card">
              <span className="player-name">{game.playerTwo?.username ?? 'Waiting…'}</span>
              <span className="player-elo">Elo: {game.playerTwo?.eloRating ?? '—'}</span>
            </div>
          </div>

          <div className="dice-board">
            {game.status === 'waiting' && (
              <div className="waiting-overlay">
                <div className="waiting-spinner" />
                <p>Waiting for another player to join…</p>
                <p className="waiting-hint">Page refreshes automatically every 15 seconds</p>
              </div>
            )}
            {game.status !== 'waiting' && (
              <div className="dice-area">
                <div className="dice-row">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="die die--placeholder">?</div>
                  ))}
                </div>
                <p className="placeholder">Game board not implemented in this sprint.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="game-sidebar">
        <h2>Comments</h2>
        <CommentsList comments={game.comments} />
        <form className="comment-form" onSubmit={handleCommentSubmit}>
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
      </aside>
    </div>
  )
}

export default GamePage
