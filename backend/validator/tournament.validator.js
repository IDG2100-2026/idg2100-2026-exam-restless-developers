import mongoose from "mongoose";

export function validateTournamentId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid tournament id",
    });
  }

  next();
}

export function validateJoinTournament(req, res, next) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "User id is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }

  next();
}