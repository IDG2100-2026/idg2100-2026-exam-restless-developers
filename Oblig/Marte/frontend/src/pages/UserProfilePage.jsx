import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatVariant(variant) {
  if (!variant) return '—'
  return `Best of ${variant.rounds} · ${variant.timePerRound}s`
}

function UserProfilePage() {
  const { username } = useParams()
  const { user: loggedInUser, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ email: '', aboutMe: '', password: '' })
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const isOwnProfile = loggedInUser?.username === username

  useEffect(() => {
    if (!loggedInUser) {
      setLoading(false)
      return
    }
    async function fetchProfile() {
      try {
        const data = await usersApi.getById(loggedInUser._id)
        setProfile(data.user)
        setRecentGames(data.recentGames)
        setEditForm({ email: data.user.email || '', aboutMe: data.user.aboutMe || '', password: '' })
      } catch (err) {
        setError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [loggedInUser])

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const maxSize = 200
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setAvatarPreview(dataUrl)
        setEditForm(f => ({ ...f, avatar: dataUrl }))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      const updates = { email: editForm.email, aboutMe: editForm.aboutMe }
      if (editForm.password) updates.password = editForm.password
      if (editForm.avatar) updates.avatar = editForm.avatar
      const data = await usersApi.update(loggedInUser._id, updates)
      setProfile(data.user)
      login({ ...loggedInUser, ...data.user })
      setEditing(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!loggedInUser) {
    return (
      <div className="page page-narrow">
        <h1>{username}'s Profile</h1>
        <p>You need to be logged in to view profiles.</p>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Log in</Link>
      </div>
    )
  }

  if (!isOwnProfile) {
    return (
      <div className="page page-narrow">
        <h1>{username}'s Profile</h1>
        <p className="placeholder">Viewing other users' profiles is not supported yet.</p>
      </div>
    )
  }

  if (loading) return <div className="page"><p className="placeholder">Loading profile…</p></div>
  if (error) return <div className="page"><p className="error">{error}</p></div>

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.username} className="avatar-img" />
            : '👤'}
        </div>
        <div>
          <h1>{profile.username}</h1>
          {isOwnProfile && <p className="profile-email">{profile.email}</p>}
        </div>
        {isOwnProfile && !editing && (
          <button className="btn-ghost" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {editing ? (
        <form className="form" onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={editForm.email}
              onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="avatar">Profile Image</label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            {(avatarPreview || profile.avatar) && (
              <img
                src={avatarPreview || profile.avatar}
                alt="Preview"
                className="avatar-preview"
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="aboutMe">About Me</label>
            <textarea
              id="aboutMe"
              className="comment-input"
              value={editForm.aboutMe}
              onChange={e => setEditForm(f => ({ ...f, aboutMe: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password <span className="label-hint">(leave blank to keep current)</span></label>
            <input
              id="password"
              type="password"
              value={editForm.password}
              onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          {saveError && <p className="error">{saveError}</p>}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        profile.aboutMe && <p className="profile-about">{profile.aboutMe}</p>
      )}

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">{profile.eloRating}</span>
          <span className="stat-label">Overall Elo</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.eloByTimeControl?.five ?? 1000}</span>
          <span className="stat-label">Elo (5s)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.eloByTimeControl?.ten ?? 1000}</span>
          <span className="stat-label">Elo (10s)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.eloByTimeControl?.fifteen ?? 1000}</span>
          <span className="stat-label">Elo (15s)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{recentGames.length}</span>
          <span className="stat-label">Recent Games</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {recentGames.filter(g => g.winner?.toString() === loggedInUser._id || g.winner === loggedInUser._id).length}
          </span>
          <span className="stat-label">Wins (last 10)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.trophies?.length ?? 0}</span>
          <span className="stat-label">Trophies</span>
        </div>
      </div>

      {profile.trophies?.length > 0 && (
        <section className="section">
          <h2>Trophies</h2>
          <ul className="trophy-list">
            {profile.trophies.map((t, i) => (
              <li key={i} className="trophy-item">
                <span>🏆</span>
                <span>{t.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <h2>Recent Games</h2>
          <Link to={`/users/${username}/games`} className="btn-ghost">View all</Link>
        </div>
        {recentGames.length === 0 ? (
          <p className="placeholder">No games played yet.</p>
        ) : (
          <ul className="game-list">
            {recentGames.map(game => {
              const won = game.winner?.toString() === loggedInUser._id || game.winner === loggedInUser._id
              return (
                <li key={game._id} className="game-card">
                  <Link to={`/games/${game._id}`}>
                    <span className="game-variant">{formatVariant(game.variant)}</span>
                    <span className="game-players">{new Date(game.createdAt).toLocaleDateString()}</span>
                    <span className={`result-badge ${won ? 'result-win' : 'result-loss'}`}>
                      {won ? 'Win' : 'Loss'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default UserProfilePage
