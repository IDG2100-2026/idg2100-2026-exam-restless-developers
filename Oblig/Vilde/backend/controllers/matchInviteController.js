import { MatchInvite } from "../models/matchInvite.js";
import { Match } from "../models/match.js";

export const createInvite = async (req, res) => {
    try {
        const { fromUser, toUser, categoryId } = req.body;

        const invite = await MatchInvite.create({
            fromUser, 
            toUser, 
            category: categoryId
        });

        res.status(201).json(invite);
    } catch (error) {
        res.status(400).json({error:"Could not create invite"});
    }
};

export const respondInvite = async (req, res) => {
    try {
        const { status } = req.body;;
        const invite = await MatchInvite.findById(req.params.id);

        if(!invite) {
            return res.status(400).json({error: "Invite not found"});
        }
        invite.status = status; 
        await invite.save();

        if(status === "accepted") {
            const match = await Match.create({
                players: [invite.fromUser, invite.toUser], 
                category: invite.category, 
                rounds: [], 
                inAnonymous: false
            });

            return res.json({
                invite, 
                match
            });
        }
        res.json(invite);
    } catch (error) {
        res.status(400).json({error: "Could not respond to invite"});
    }
};