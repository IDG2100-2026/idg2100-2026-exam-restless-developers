
import { Tournament } from "../models/tournament.js";
import { User } from "../models/user.js";
import { Match } from "../models/match.js";
import { Category } from "../models/category.js";

export const getTournaments = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const tournaments = await Tournament.find()
            .skip(skip)
            .limit(limit)
            .populate("players", "username elo")
            .populate("winner", "username")
            .populate("category")

        const total = await Tournament.countDocuments();

        res.json({
            page,
            limit,
            total,
            tournaments
        });
    } catch(error) {
        res.status(500).json({error: "Failed to fetch tournaments"});
    }
};

export const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
        .populate("players", "username elo")
        .populate("winner", "username")
        .populate("category")
        .populate({
            path: "rounds.matches",
            populate: [
                {path: "players", select: "username"}, 
                {path: "winner", select: "username"}
            ]
        })
        .populate("rounds.byePlayers", "username")
        .populate("comments");

        if(!tournament) return res.status(404).json({error: "Tournament not found"});

        res.json(tournament);
    }catch (error) {
        res.status(400).json({error: "Invalid ID format"});
    }
};

export const createTournament = async (req, res) => {
    try {
        const {name, description, categoryId, startTime, trophy} = req.body;
        if(!name || !categoryId || !startTime || !trophy) {
            return res.status(400).json({error: "Missing required fields"});
        }

        const category = await Category.findById(categoryId);
        if(!category) {
            return res.status(400).json({error: "Invalid category"});
        }

        const tournament = await Tournament.create({
            name, 
            description, 
            category: categoryId, 
            startTime, 
            trophy, 
            players: [],
            rounds: [], 
            status: "pending"
        });
        res.status(201).json(tournament);
    } catch (error) {
        res.status(400).json({error: "Could not create tournament"});
    }
};

export const joinTournament = async (req, res) => {
    try {
        const {userId} = req.body; 

        const tournament = await Tournament.findById(req.params.id);
        if(!tournament) return res.status(404).json({error: "Tournament not found"});

        const user = await User.findById(userId);
        if(!user) {
            return res.status(400).json({error: "User not found"});
        }

        if (tournament.status !== "pending") {
            return res.status(400).json({error: "Tournament already started"});
        }

        const alreadyJoined = tournament.players.some(
            playerId => playerId.toString() === userId.toString()
        );

        if(alreadyJoined) {
            return res.status(400).json({error: "User already joined"});
        }

        tournament.players.push(userId);
        await tournament.save();

        await User.findByIdAndUpdate(userId, {
            $push: {joinedTournaments: tournament._id}
        });

        res.json(tournament);
    } catch (error) {
        res.status(400).json({error: "could not join tournament"});
    }
};

export const startTournament = async(req, res) =>{
    try {
        const tournament = await Tournament.findById(req.params.id);
        if(!tournament) return res.status(404).json({error: "Tournament not found"});

        if (tournament.status !== "pending"){
            return res.status(400).json({error: "Tournament has already started"});
        }

        if(tournament.players.length < 2) {
            return res.status(404).json({error: "Not enough players to start"});
        }

        const shuffled = [...tournament.players].sort(() => Math.random() -0.5);

        const matches = [];
        const byePlayers = [];
        for(let i = 0; i < shuffled.length; i += 2) {
            const p1 = shuffled[i];
            const p2 = shuffled[i + 1] || null;

            if(!p2) {
                byePlayers.push(p1);
                continue;
            }

            const match = await Match.create({
                players: [p1, p2], 
                category: tournament.category, 
                rounds: [],
                isAnonymous: false,
                startedAt: new Date()
            });
            matches.push(match._id);
        }
        tournament.rounds.push({
            roundNumber: 1, 
            matches, 
            byePlayers
        });

        tournament.status = "ongoing";
        await tournament.save();

        res.json(tournament);
    } catch (error) {
        res.status(400).json({error: "Could not start tournament"});
    }
};

export const advanceTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate("rounds.matches");
        if(!tournament) return res.status(404).json({error: "Tournament not found"});

        const lastRound = tournament.rounds[tournament.rounds.length -1];

        const unfinishedMatch = lastRound.matches.some(match => !match.winner);

        if(unfinishedMatch) {
            return res.status(400).json({error:"All matches in the round must be finished before advancing"});
        }

        const winners = [
            ...lastRound.byePlayers,
            ...lastRound.matches.map(match => match.winner).filter(Boolean)
        ];

        if(winners.length < 1) {
            return res.status(400).json({error: "no winner to advance"});
        }
        if(winners.length === 1){
            tournament.winner = winners[0];
            tournament.status = "finished";

            await User.findByIdAndUpdate(winners[0], {
                $push: {trophies: tournament.trophy}
            });

            await tournament.save();
            return res.json({message: "Tournament finished", tournament});
        }

        const nextMatches = [];
        const nextByePlayers = [];

        for (let i = 0; i < winners.length; i +=2) {
            const p1 = winners[i];
            const p2 = winners[i + 1] || null;

            if(!p2) {
                nextByePlayers.push(p1);
                continue;
            }

            const match = await Match.create({
                players: [p1, p2], 
                category: tournament.category, 
                rounds: [], 
                isAnonymous: false, 
                startedAt: new Date()
            });
            nextMatches.push(match._id);
        }
        tournament.rounds.push({
            roundNumber: tournament.rounds.length + 1, 
            matches: nextMatches, 
            byePlayers: nextByePlayers
        });

        await tournament.save();
        res.json(tournament);
    } catch (error) {
        res.status(400).json({error: "Could not advance tournament"});
    }
};