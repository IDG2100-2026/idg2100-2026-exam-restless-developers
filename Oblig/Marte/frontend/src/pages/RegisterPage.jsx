import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAppearance } from '../context/AppearanceContext'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { loadFromUser } = useAppearance()
  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordRepeat: '',
    dateOfBirth: '',
    email: '',
    agreeToTerms: false,
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.username || form.username.length < 3) {
      return setError('Username must be at least 3 characters')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    if (form.password !== form.passwordRepeat) {
      return setError('Passwords do not match')
    }
    if (!form.dateOfBirth) {
      return setError('Date of birth is required')
    }
    const age = new Date().getFullYear() - new Date(form.dateOfBirth).getFullYear()
    if (age < 18) {
      return setError('You must be at least 18 years old to register')
    }
    if (!form.agreeToTerms) {
      return setError('You must agree to the terms and conditions')
    }

    setLoading(true)
    try {
      const data = await usersApi.register({
        username: form.username,
        password: form.password,
        age,
        email: form.email,
      })
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
      <h1>Register</h1>
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
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
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
            autoComplete="new-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="passwordRepeat">Repeat Password</label>
          <input
            id="passwordRepeat"
            name="passwordRepeat"
            type="password"
            value={form.passwordRepeat}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="form-group form-group--checkbox">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={form.agreeToTerms}
            onChange={handleChange}
          />
          <label htmlFor="agreeToTerms">
            I agree to the <Link to="/terms">Terms and Conditions</Link>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p className="form-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default RegisterPage
