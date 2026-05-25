const BASE_URL = '/api'

async function request(path, options = {}) {
  const userId = localStorage.getItem('userId')
  const userRole = localStorage.getItem('userRole')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const gamesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/games${query ? `?${query}` : ''}`)
  },
  getById: (id) => request(`/games/${id}`),
  getActivity: () => request('/games/activity'),
  create: (body) => request('/games', { method: 'POST', body: JSON.stringify(body) }),
  join: (id) => request(`/games/${id}/join`, { method: 'POST' }),
}

export const tournamentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/tournaments${query ? `?${query}` : ''}`)
  },
  getById: (id) => request(`/tournaments/${id}`),
  join: (id) => request(`/tournaments/${id}/join`, { method: 'POST' }),
}

export const commentsApi = {
  add: (body) => request('/comments', { method: 'POST', body: JSON.stringify(body) }),
}

export const usersApi = {
  getById: (id) => request(`/users/${id}`),
  register: (body) => request('/users/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/users/login', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
