

import { Match } from "../models/match.js";
import { User } from "../models/user.js";
import { Category} from "../models/category.js";


const calculateElo = (winnerElo, loserElo) => {
    const k = 32;
    const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const newWinnerElo = winnerElo + k * (1 - expectedWin);
    const newLoserElo = loserElo + k * (0 - (1 - expectedWin));
    return {newWinnerElo, newLoserElo};
};

export const getMatches = async (req, res) => {
    try{

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const matches = await Match.find()
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("players", "username elo")
        .populate("winner", "username")
        .populate("category")
        .populate("comments");

        res.json(matches);
    }catch (error) {
        res.status(500).json({error: "Failed to fetch matches"});
    }
};

export const getMatchById = async (req, res) => {
    try{
        const match = await Match.findById(req.params.id)
        .populate("players", "username elo")
        .populate("winner", "username")
        .populate("category")
        .populate("comments")

        if(!match) return res.status(404).json({error: "No match found"});
        
        res.json(match);
    }catch (error) {
        res.status(400).json({error: "Invalid ID format"});
    }
};

export const createMatch = async (req, res) => {
    try{
        const {players, categoryId, allowAnonymousPlayers} = req.body;

        //New code
        if(!players || players.length <1 || players.length > 2) {
            return res.status(400).json({error:"Match must have 1 or 2 players"});
        }

        //Changed this part of the code
        // if(!players || players.length !==2){
        //     return res.status(400).json({error: "Match must have exactly 2 players"});
        // }
        if(players[0] === players[1]){
            return res.status(400).json({error: "A player can not play again"});
        }

        const foundPlayers = await User.find({_id: { $in: players }});

        //New code
        if(foundPlayers.length !== players.length){
            return res.status(400).json({error:"One or more players does not exist"});
        }
        //Old code
        // if (foundPlayers.length !==2){
        //     return res.status(400).json({error:"One or more players does not exist"});
        // }

        const category = await Category.findById(categoryId);
        if(!category) {
            return res.status(400).json({error: "Invalid category"});
        }
//CHANGED CODE FOR OBLIG 3
        const match = await Match.create({
            players, 
            category: categoryId, 
            allowAnonymousPlayers: allowAnonymousPlayers ?? true, //changed from isAnonymous
            rounds: [], //added
            status: "waiting", //added
            maxPlayers: 2, //added
            startedAt: null
        });
        //CHANGED CODE ENDS HERE

        await User.updateMany(
            { _id: {$in: players} },
            { $push: {playedMatches: match._id}}
        );
        res.status(201).json(match);
    }catch (error) {
        res.status(400).json({error: "Could not create match"});
    }
};

//New code: 
export const joinMatch = async (req, res) => {
  try {
    const { userId } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    //New code for oblig 3
    if (!userId) {
    if (match.allowAnonymousPlayers === false) {
        return res.status(403).json({ error: "Anonymous users cannot join this match" });
    }
        return res.status(400).json({ error: "You must be logged in to join this match" });
        }
    //New code ends here 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("JOIN DEBUG");
    console.log("match id:", match._id.toString());
    console.log("userId:", userId);
    console.log("players:", match.players.map((p) => p.toString()));
    console.log("players length:", match.players.length);

    if (match.players.some((playerId) => playerId.toString() === userId)) {
      console.log("JOIN BLOCKED: already joined");
      return res.status(400).json({ error: "User already joined this match" });
    }

    if (match.players.length >= 2) {
      console.log("JOIN BLOCKED: match is full");
      return res.status(400).json({ error: "Match is already full" });
    }

    match.players.push(userId);
    //New code for oblig 3
    if (match.players.length >= (match.maxPlayers || 2)) {
    match.status = "in_progress";
    match.startedAt = new Date();
} //New code ends here
    await match.save();

    await User.findByIdAndUpdate(userId, {
      $push: { playedMatches: match._id }
    });

    return res.status(200).json({ message: "Joined match successfully", match });
  } catch (error) {
    console.error("joinMatch error:", error);
    return res.status(500).json({ error: "Could not join match" });
  }
};

//New code ends here 

export const addRound = async (req, res) => {
    try {
        const {roundNumber, rolls, result} = req.body;
        const match = await Match.findById(req.params.id);
        if(!match) return res.status(404).json({error: "Match not found"});

        match.rounds.push({
            roundNumber, 
            rolls: rolls.map(r => ({
            dice: r.dice, 
            holds: r.holds, 
            timestamp: new Date()    
            })),
            result
        });

        await match.save();
        res.json(match);
    } catch (error) {
        res.status(400).json({error: "Could not add round"});
    }
};

export const finishMatch = async (req, res) => {
    try {
        const { winnerId } = req.body;

        const match = await Match.findById(req.params.id);
        if(!match) return res.status(404).json({error: "Match not found"});

        if(match.endedAt) {
            return res.status(400).json({error:"Match is already finished"});
        }

        const isPlayerInMatch = match.players.some(
            playerId => playerId.toString() === winnerId.toString()
        );

        if(!isPlayerInMatch){
            return res.status(400).json({error:"Winner must be one of the match players"});
        }

        match.winner = winnerId;
        match.endedAt = new Date();

        if(!match.isAnonymous) {
            const [p1, p2] = await Promise.all([
                User.findById(match.players[0]),
                User.findById(match.players[1])
            ]);

            const firstPlayerIsWinner = match.players[0].toString() === winnerId.toString();


            const winner = firstPlayerIsWinner ? p1 : p2;
            const loser = firstPlayerIsWinner ? p2 : p1;

            match.eloBefore = {
                [p1._id.toString()]: p1.elo, 
                [p2._id.toString()]: p2.elo
            };

            winner.stats.wins +=1;
            loser.stats.losses +=1;

            const {newWinnerElo, newLoserElo} = calculateElo(winner.elo, loser.elo);
            winner.elo = Math.round(newWinnerElo);
            loser.elo = Math.round(newLoserElo);

            match.eloAfter = {
                [winner._id.toString()]: winner.elo, 
                [loser._id.toString()]: loser.elo
            }

            await winner.save();
            await loser.save();
        }
        await match.save();
        res.json(match);
    } catch (error) {
        res.status(400).json({error: "Could not finish match"});
    }
};

export const deleteMatch = async (req, res) => {
    try {
        const deleted = await Match.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(400).json({error: "Match not found"});

        await User.updateMany(
            {playedMatches: deleted._id}, 
            {$pull: {playedMatches: deleted._id}}
        );
        res.json({message: "match deleted"});
    } catch (error){
        res.status(400).json({error: "Could not delete match"});
    }
};

//New code for oblig 3: 
export async function getLobbyMatches(req, res) {
  try {
    const { viewerId } = req.query;

    const matches = await Match.find({
      endedAt: null
    })
      .populate("players", "username elo")
      .populate("category", "label")
      .sort({ createdAt: -1 });

    const openMatches = matches.filter((match) => {
      const statusOk = !match.status || match.status === "waiting";
      const maxPlayers = match.maxPlayers || 2;
      const playerCount = match.players?.length || 0;
      const hasRoom = playerCount < maxPlayers;

      if (!statusOk || !hasRoom) {
        return false;
      }

      // Hvis brukeren er anonym, skjul matcher som ikke tillater anonyme
      if (!viewerId && match.allowAnonymousPlayers === false) {
        return false;
      }

      return true;
    });

    res.json(openMatches);
  } catch (error) {
    console.error("Error fetching lobby matches:", error);
    res.status(500).json({ error: "Could not load lobby matches" });
  }
}

