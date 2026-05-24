import * as tournamentService from "../services/tournament.services.js";

export async function createTournament(req, res) {
  try {
    // create a new tournament
    const tournament = await tournamentService.createTournament(req.body);

    res.status(201).json({
      message: "Turneringen ble opprettet",
      tournament,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke opprette turnering: " + error.message,
    });
  }
}

export async function joinTournament(req, res) {
  try {
    // add a user to the tournament
    const tournament = await tournamentService.joinTournament(
      req.params.id,
      req.body.userId
    );

    res.status(200).json({
      message: "Du har blitt med i turneringen",
      tournament,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke bli med i turnering: " + error.message,
    });
  }
}

export async function generateFirstRound(req, res) {
  try {
    // random pairing for round 1
    const tournament = await tournamentService.generateFirstRound(
      req.params.id
    );

    res.status(200).json({
      message: "Første runde ble generert",
      tournament,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke generere første runde: " + error.message,
    });
  }
}

export async function advanceWinners(req, res) {
  try {
    // move winners to next round
    const tournament = await tournamentService.advanceWinners(req.params.id);

    res.status(200).json({
      message: "Vinnere ble flyttet til neste runde",
      tournament,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke oppdatere turnering: " + error.message,
    });
  }
}

export async function addComment(req, res) {
  try {
    // add a comment to the tournament
    const tournament = await tournamentService.addComment(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Kommentaren ble lagt til",
      tournament,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke legge til kommentar: " + error.message,
    });
  }
}

export async function getTournamentById(req, res) {
  try {
    const tournament = await tournamentService.getTournamentById(
      req.params.id
    );

    if (!tournament) {
      return res.status(404).json({
        error: "Turneringen ble ikke funnet",
      });
    }

    res.status(200).json(tournament);
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke hente turnering: " + error.message,
    });
  }
}

export async function listTournaments(req, res) {
  try {
    const filters = {
      variantRounds: req.query.rounds,
    };

    const pagination = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };

    const tournaments = await tournamentService.listTournaments(
      filters,
      pagination
    );

    res.status(200).json(tournaments);
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke hente turneringer: " + error.message,
    });
  }
}
