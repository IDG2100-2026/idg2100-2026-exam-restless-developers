import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gamesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

function VariantOption({ label, name, value, selected, onChange }) {
  return (
    <label className={`variant-option ${selected ? 'variant-option--selected' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onChange}
      />
      {label}
    </label>
  )
}

function CreateGamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    rounds: 3,
    straightsAllowed: false,
    timePerRound: 10,
    isAnonymous: false,
    desiredElo: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await gamesApi.create({
        rounds: Number(form.rounds),
        straightsAllowed: form.straightsAllowed === 'true' || form.straightsAllowed === true,
        timePerRound: Number(form.timePerRound),
        isAnonymous: user ? form.isAnonymous : true,
      })
      navigate(`/games/${data.game._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <h1>Create a Game</h1>
      <form className="form" onSubmit={handleSubmit}>

        <fieldset className="variant-fieldset">
          <legend>Rounds</legend>
          <div className="variant-options">
            {[3, 5, 7].map(n => (
              <VariantOption
                key={n}
                label={`Best of ${n}`}
                name="rounds"
                value={n}
                selected={Number(form.rounds) === n}
                onChange={handleChange}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="variant-fieldset">
          <legend>Straights</legend>
          <div className="variant-options">
            <VariantOption
              label="Allowed"
              name="straightsAllowed"
              value="true"
              selected={form.straightsAllowed === 'true' || form.straightsAllowed === true}
              onChange={handleChange}
            />
            <VariantOption
              label="Not allowed"
              name="straightsAllowed"
              value="false"
              selected={form.straightsAllowed === 'false' || form.straightsAllowed === false}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        <fieldset className="variant-fieldset">
          <legend>Time per round</legend>
          <div className="variant-options">
            {[5, 10, 15].map(n => (
              <VariantOption
                key={n}
                label={`${n}s`}
                name="timePerRound"
                value={n}
                selected={Number(form.timePerRound) === n}
                onChange={handleChange}
              />
            ))}
          </div>
        </fieldset>

        {/* desiredElo is collected here but not sent to the backend — no backend support yet */}
        {user && (
          <div className="form-group">
            <label htmlFor="desiredElo">Desired opponent Elo <span className="label-hint">(optional)</span></label>
            <input
              id="desiredElo"
              name="desiredElo"
              type="number"
              min={100}
              max={3000}
              value={form.desiredElo}
              onChange={handleChange}
              placeholder="e.g. 1200"
            />
          </div>
        )}

        {user ? (
          <div className="form-group form-group--checkbox">
            <input
              id="isAnonymous"
              name="isAnonymous"
              type="checkbox"
              checked={form.isAnonymous}
              onChange={handleChange}
            />
            <label htmlFor="isAnonymous">Allow anonymous players to join</label>
          </div>
        ) : (
          <p className="placeholder">You are not logged in — this game will be created as anonymous.</p>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Game'}
        </button>
      </form>
    </div>
  )
}

export default CreateGamePage
