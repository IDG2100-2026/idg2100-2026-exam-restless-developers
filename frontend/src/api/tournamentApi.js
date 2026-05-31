const API_URL = "http://localhost:6767/api/v1";

export async function getTournament(id) {
  const response = await fetch(`${API_URL}/tournaments/${id}`);

  if (!response.ok) {
    throw new Error("Could not fetch tournament");
  }

  return response.json();
}



export async function joinTournament(id, token) {
  const response = await fetch(`${API_URL}/tournaments/${id}/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not join tournament");
  }

  return data;
}




export async function leaveTournament(id, token) {
  const response = await fetch(`${API_URL}/tournaments/${id}/players`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not leave tournament");
  }

  return data;
}




export async function updateTournamentStatus(id, token, status) {
  const response = await fetch(`${API_URL}/tournaments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not update tournament");
  }

  return data;
}




export async function deleteTournament(id, token) {
  const response = await fetch(`${API_URL}/tournaments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Could not delete tournament");
  }
}
