const API_URL = "http://localhost:6767/api/v1";

export async function getComments(tournamentId) {
  const response = await fetch(`${API_URL}/comments/${tournamentId}`);

  if (!response.ok) {
    throw new Error("Could not fetch comments");
  }

  return response.json();
}


export async function createComment(tournamentId, token, content) {
  const response = await fetch(`${API_URL}/comments/${tournamentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Could not post comment");
  }

  return response.json();
}