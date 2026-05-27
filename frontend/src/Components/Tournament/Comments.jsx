import "./Comments.css";

function Comments({
  comments,
  commentInput,
  setCommentInput,
  handleSubmitComment,
}) {
  return (
    <section className="detail-card">
      <h2>Comments</h2>

      <form onSubmit={handleSubmitComment} className="comment-form">
        <textarea
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          placeholder="Write a comment..."
          maxLength={500}
        />

        <button type="submit" className="primary-action-button">
          Post comment
        </button>
      </form>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <strong>{comment.author?.username || "Unknown user"}</strong>
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Comments;