import { useState } from "react";
import "./Comments.css";

const MAX_LENGTH = 300;

function Comments({
  comments,
  commentInput,
  setCommentInput,
  handleSubmitComment,
}) {
  const remaining = MAX_LENGTH - commentInput.length;
  const [expanded, setExpanded] = useState({});

  function toggleExpanded(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="detail-card">
      <h2>Comments</h2>

      <form onSubmit={handleSubmitComment} className="comment-form">
        <textarea
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          placeholder="Write a comment..."
          maxLength={MAX_LENGTH}
        />
        <span className={`comment-char-count${remaining < 30 ? " comment-char-count--warn" : ""}`}>
          {remaining} characters left
        </span>

        <button type="submit" className="primary-action-button">
          Post comment
        </button>
      </form>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="comments-list">
          {comments.map((comment) => {
            const isExpanded = expanded[comment._id];
            const isLong = comment.content?.length > 150;
            return (
              <li key={comment._id} className="comment-item">
                <strong>{comment.author?.username || "Unknown user"}</strong>
                <p className={isExpanded ? "" : "comment-text--clamped"}>{comment.content}</p>
                {isLong && (
                  <button className="comment-read-more" onClick={() => toggleExpanded(comment._id)}>
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default Comments;
