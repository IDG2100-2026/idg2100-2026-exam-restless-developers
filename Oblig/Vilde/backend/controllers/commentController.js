import { Comment } from "../models/comment.js";
import { User } from "../models/user.js";
import { Match } from "../models/match.js";
import { Tournament } from "../models/tournament.js";

export const getComments = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false};

        if (req.query.match) filter.match = req.query.match;
        if(req.query.tournament) filter.tournament = req.query.tournament;

        const comments = await Comment.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("author", "username")
        .sort({createdAt: -1});

        const total = await Comment.countDocuments(filter);

        res.json({
            page,
            limit,
            total,
            comments
        });
    } catch(error){
        res.status(500).json({error: "Failed to fetch comments"});
    }
};

export const createComment = async(req, res) =>{
    try{
        const { author, text, match, tournament, type} = req.body;

        if(!author || !text || !type){
            return res.status(400).json({error: "Missing required fields"});
        }
        if(!["match", "tournament"].includes(type)){
            return res.status(400).json({error: "Invalid comment type"});
        }

        const user = await User.findById(author);
        if (!user) return res.status(400).json({error: "Author does not exist"});

        if(type === "match") {
            if (!match) return res.status(400).json({error: "Match ID required"});
            const m = await Match.findById(match);
            if(!m) return res.status(400).json({error: "Match does not exist"});
        }

        if(type === "tournament") {
            if(!tournament) return res.status(400).json({error: "Tournament ID required"});
            const t = await Tournament.findById(tournament);
            if(!t) return res.status(400).json({error: "Tournament does not exist"});
        }

        const newComment = await Comment.create({
            author, 
            text, 
            type,
            match: match || null, 
            tournament: tournament || null
        });

        if(type === "match") {
            await Match.findByIdAndUpdate(match, {
                $push: {comments: newComment._id}
            });
        }

        if(type === "tournament") {
            await Tournament.findByIdAndUpdate(tournament, {
                $push: {comments: newComment._id}
            });
        }

        res.status(201).json(newComment);
    } catch (error){
        res.status(400).json({error: "Could not create comment"});
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if(!comment) return res.status(404).json({error: "Comment not found"});
        
        comment.isDeleted = true;
        comment.deletedAt = new Date();

        await comment.save();

        res.json({message: "Comment deleted"});
    } catch (error){
        res.status(400).json({error: "Could not delete comment"});
    }
};