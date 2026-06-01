export default function errorHandler(error, req, res, next) {
  console.error(error.message);

  res.status(error.statusCode || 500).json({
    message: error.message || "Something went wrong",
  });
}