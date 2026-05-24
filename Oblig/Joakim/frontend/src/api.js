const API_BASE = "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return response.json();
}

// match Endpoints
export const getMatches = () => request("/matches");

export const getMatch = (id) => request(`/matches/${id}`);

export const createMatch = (payload) =>
  request("/matches", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const joinMatch = (id, payload = {}) =>
  request(`/matches/${id}/join`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const addMatchComment = (id, payload) =>
  request(`/matches/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// user Endpoints
export const getUsers = () => request("/users");

export const getUser = (uid) => request(`/users/${uid}`);

export const createUser = (payload) =>
  request("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// platform Endpoints
export const getPlatformActivity = () => request("/platform");
