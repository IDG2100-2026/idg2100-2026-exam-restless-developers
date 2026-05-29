import { useEffect, useState } from "react";
import "./AdminComments.css";

function AdminComments() {
  const [comments, setComments] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(
          "http://localhost:6767/api/v1/comments"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not fetch comments");
        }

        setComments(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchComments();
  }, []);

  async function handleDeleteComment(commentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingCommentId(commentId);

    try {
      const response = await fetch(
        `http://localhost:6767/api/v1/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete comment");
      }

      setComments((previousComments) =>
        previousComments.filter(
          (comment) => comment._id !== commentId
        )
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingCommentId(null);
    }
  }

  const filteredComments = comments.filter((comment) => {
    const search = searchValue.toLowerCase();

    return (
      comment.content?.toLowerCase().includes(search) ||
      comment.author?.username?.toLowerCase().includes(search) ||
      comment.tournament?.title?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="admin-dashboard-page">
      <h1>Comment Administration</h1>

      <p>
        View recent comments and remove inappropriate content.
      </p>

      <section className="admin-card admin-search-section">
        <label className="admin-search-label">
          Search comments
          <input
            type="search"
            value={searchValue}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            placeholder="Search comments, users, or tournaments"
          />
        </label>
      </section>

      {error && <p className="admin-page-error">{error}</p>}

      <section className="admin-card">
        <h2>Comments</h2>

        {filteredComments.length === 0 ? (
          <p>No comments found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Tournament</th>
                  <th>Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredComments.map((comment) => (
                  <tr key={comment._id}>
                    <td>
                      {comment.author?.username || "Unknown"}
                    </td>

                    <td>
                      {comment.tournament?.title || "Unknown"}
                    </td>

                    <td>{comment.content}</td>

                    <td>
                      <button
                        className="admin-action-button"
                        onClick={() =>
                          handleDeleteComment(comment._id)
                        }
                        disabled={
                          deletingCommentId === comment._id
                        }
                      >
                        {deletingCommentId === comment._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminComments;