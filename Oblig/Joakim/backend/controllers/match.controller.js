import * as matchService from "../services/match.services.js";

// create a new match
export async function createMatch(req, res) {
  try {
    const match = await matchService.createMatch(req.body);
    res.status(201).json({
      message: "Kampen ble opprettet",
      match,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke opprette kamp: " + error.message,
    });
  }
}

// join an existing match
export async function joinMatch(req, res) {
  try {
    const match = await matchService.joinMatch(req.params.id, req.body);
    res.status(200).json({
      message: "Du har blitt med i kampen",
      match,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke bli med i kamp: " + error.message,
    });
  }
}

// save match result
export async function saveMatchResult(req, res) {
  try {
    const match = await matchService.saveMatchResult(req.params.id, req.body);
    res.status(200).json({
      message: "Resultatet ble lagret",
      match,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke lagre resultat: " + error.message,
    });
  }
}

// add a comment to a match
export async function addComment(req, res) {
  try {
    const match = await matchService.addComment(req.params.id, req.body);
    res.status(200).json({
      message: "Kommentaren ble lagt til",
      match,
    });
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke legge til kommentar: " + error.message,
    });
  }
}

// get one match
export async function getMatchById(req, res) {
  try {
    const match = await matchService.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        error: "Kampen ble ikke funnet",
      });
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke hente kamp: " + error.message,
    });
  }
}

// list matches with filters + pagination
export async function listMatches(req, res) {
  try {
    const filters = {
      variantRounds: req.query.rounds,
      straightsAllowed: req.query.straightsAllowed,
      timeControl: req.query.timeControl,
      excludeAnonymous: req.query.excludeAnonymous === "true",
    };

    const pagination = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };

    const matches = await matchService.listMatches(filters, pagination);
    res.status(200).json(matches);
  } catch (error) {
    res.status(400).json({
      error: "Kunne ikke hente kamper: " + error.message,
    });
  }
}
