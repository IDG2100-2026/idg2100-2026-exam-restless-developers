import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAppearance } from '../context/AppearanceContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { loadFromUser } = useAppearance()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await usersApi.login(form)
      login(data.user)
      loadFromUser(data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Log In</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="button" className="btn-link">Forgot password?</button>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="form-footer">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}

export default LoginPage
