import { useState } from 'react'
import { useAppearance } from '../../context/AppearanceContext'

const BOARD_COLORS = [
  { label: 'Dark',   value: '#1e1e1e' },
  { label: 'Green',  value: '#14532d' },
  { label: 'Navy',   value: '#1e3a5f' },
  { label: 'Purple', value: '#3b0764' },
  { label: 'Red',    value: '#7f1d1d' },
]

function AppearanceCustomizer() {
  const { appearance, update } = useAppearance()
  const [open, setOpen] = useState(false)

  return (
    <div className="customizer">
      <button className="btn-ghost customizer-toggle" onClick={() => setOpen(o => !o)}>
        ⚙ Appearance
      </button>

      {open && (
        <div className="customizer-panel">
          <h3>Appearance</h3>

          <div className="customizer-row">
            <label>Theme</label>
            <div className="segmented">
              {['light', 'system', 'dark'].map(t => (
                <button
                  key={t}
                  className={`segmented-btn ${appearance.theme === t ? 'segmented-btn--active' : ''}`}
                  onClick={() => update('theme', t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="customizer-row">
            <label>Board Color</label>
            <div className="color-options">
              {BOARD_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`color-swatch ${appearance.boardColor === c.value ? 'color-swatch--active' : ''}`}
                  style={{ background: c.value }}
                  title={c.label}
                  onClick={() => update('boardColor', c.value)}
                />
              ))}
            </div>
          </div>

          <div className="customizer-row">
            <label>Sound</label>
            <button
              className={`toggle ${appearance.sound ? 'toggle--on' : ''}`}
              onClick={() => update('sound', !appearance.sound)}
            >
              {appearance.sound ? 'On' : 'Off'}
            </button>
          </div>

          <div className="customizer-row">
            <label>Lobby preview size ({appearance.lobbySize})</label>
            <input
              type="range"
              min={3}
              max={10}
              value={appearance.lobbySize}
              onChange={e => update('lobbySize', Number(e.target.value))}
              className="customizer-slider"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AppearanceCustomizer
