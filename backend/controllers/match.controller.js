// Made by: marte kaland

import matchServices from "../services/match.services.js";

export async function getAllMatches(req, res) {
  try {
    const matches = await matchServices.getAllMatches();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch matches" });
  }
}

export async function getMatchById(req, res) {
  try {
    const match = await matchServices.getMatchById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch match" });
  }
}

export async function createMatch(req, res) {
  try {
    const { maxPlayers, rounds, straightsAllowed, timeControl, buyIn } = req.body;
    const match = await matchServices.createMatch({ maxPlayers, rounds, straightsAllowed, timeControl, buyIn });
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to create match" });
  }
}

export async function joinMatch(req, res) {
  try {
    const { userId } = req.body;
    const result = await matchServices.joinMatch(req.params.id, userId);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.match);
  } catch (error) {
    res.status(500).json({ message: "Failed to join match" });
  }
}

export async function leaveMatch(req, res) {
  try {
    const { userId } = req.body;
    const result = await matchServices.leaveMatch(req.params.id, userId);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(200).json(result.match);
  } catch (error) {
    res.status(500).json({ message: "Failed to leave match" });
  }
}

export async function addComment(req, res) {
  try {
    const { userId, text } = req.body;
    const result = await matchServices.addComment(req.params.id, userId, text);
    if (result.error) return res.status(result.status).json({ message: result.error });
    res.status(201).json(result.match);
  } catch (error) {
    res.status(500).json({ message: "Failed to post comment" });
  }
}
