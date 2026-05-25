import { createContext, useContext, useEffect, useState } from 'react'
import { usersApi } from '../services/api'

const AppearanceContext = createContext(null)

const DEFAULTS = {
  theme: 'system',
  boardColor: '#1e1e1e',
  sound: true,
  lobbySize: 5,
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(() => {
    try {
      const stored = localStorage.getItem('appearance')
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem('appearance', JSON.stringify(appearance))
    const root = document.documentElement

    if (appearance.theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else if (appearance.theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else {
      root.removeAttribute('data-theme')
    }

    root.style.setProperty('--board-color', appearance.boardColor)
  }, [appearance])

  function update(key, value) {
    setAppearance(prev => {
      const next = { ...prev, [key]: value }

      // save to backend if user is logged in
      const userId = localStorage.getItem('userId')
      if (userId) {
        usersApi.update(userId, { preferences: next }).catch(() => {})
      }

      return next
    })
  }

  // call this after login to load preferences saved on the backend
  function loadFromUser(userData) {
    if (userData?.preferences) {
      setAppearance(prev => ({ ...prev, ...userData.preferences }))
    }
  }

  return (
    <AppearanceContext.Provider value={{ appearance, update, loadFromUser }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  return useContext(AppearanceContext)
}
