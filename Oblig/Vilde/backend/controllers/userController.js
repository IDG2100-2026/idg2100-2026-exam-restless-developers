
import { User } from "../models/user.js";
import { Match } from "../models/match.js";
import { Tournament } from "../models/tournament.js";


const sanitizeUser = (user) => {
    const obj = user.toObject();
    delete obj.password;
    return obj;
};

//Get users 
export const getUsers = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
        .skip(skip)
        .limit(limit)
        .select("-password");

        const total = await User.countDocuments();

        res.json({
            page, 
            limit, 
            total, 
            users
        });

    } catch (error) {
        res.status(500).json({error: "Failed to fetch users"});
    }
};

//get users by id 
export const getUserById = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select("-password");
        if(!user) return res.status(404).json({error: "User not found"});
        res.json(user);
    } catch (error) {
        res.status(400).json({error: "Invalid ID format"});
    }
};

//POST - user registration 
export const createUser = async (req, res) => {
    try {
        const {username, email, password, age} = req.body;

        if(!username || !email || !password || !age){
            return res.status(400).json({error: "Missing required fields"});
        }

        if(age < 18){
            return res.status(400).json({error: "User must be minimum 18 years old"});
        }

        const emailExists = await User.findOne({ email });
        if(emailExists) {
            return res.status(400).json({error: "Email already registered"})
        }

        const usernameExists = await User.findOne({ username });
        if(usernameExists) {
            return res.status(400).json({error: "Username already taken"});
        }

        const newUser = await User.create({
            username, 
            email, 
            password, 
            age, 
            role: "user", 
            elo: 1000, 
            stats: {wins: 0, losses: 0}
        });

        res.status(201).json(sanitizeUser(newUser));
    } catch (error) {
        res.status(400).json({error: "Could not create user"});
    }
};

export const updateUser = async (req, res) => {
    try {
        if(req.body.username || req.body.elo){
            return res.status(400).json({message: "Cannot update username or elo manually"});
        }

    if (req.body.age && req.body.age < 18){
        return res.status(400).json({message: "User must be at least 18 years old"});
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {new: true, runValidators: true}
    ).select("-password");

    if(!updatedUser){
        return res.status(404).json({error: "User not found"});
    }
    res.json(updatedUser);

    } catch (error){
        res.status(400).json({error: "Could not update user"});
    }
};   

export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if(!deleted) return res.status(404).json({error: "User not found"});
        res.json({message: "User deleted"});
    } catch (error){
        res.status(400).json({error: "Could not delete user"});
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const sortBy = req.query.sortBy || "wins";
        const users = await User.find({role: {$ne: "anonymous" }}).select("-password");
       
        const leaderboard = users.map((u) => {
            const wins = u.stats?.wins || 0;
            const losses = u.stats?.losses || 0;
            const matchesPlayed = wins + losses;
            const winPercentage = matchesPlayed === 0 ? 0 : Number(((wins / matchesPlayed) * 100).toFixed(2));
            
            return {
                username: u.username, 
                elo: u.elo, 
                wins, 
                losses, 
                winPercentage, 
                matchesPlayed
            };
        });
        leaderboard.sort((a, b) => {
            if(sortBy === "winPercentage") return b.winPercentage - a.winPercentage;
            if(sortBy === "matchesPlayed") return b.matchesPlayed - a.matchesPlayed;
            return b.wins - a.wins;
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({error: "Failed to generate leaderboard"});
    }
};

export const getPlatformActivity = async (req, res) => {
    try {

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const ongoingMatches = await Match.countDocuments({
            endedAt: null,
            isAnonymous: false
        });

        const activeUsersThisWeek = await User.countDocuments({
            lastActiveAt: { $gte: oneWeekAgo }, 
            role: { $ne: "anonymous" }
        });

        const last10Matches = await Match.find({
            isAnonymous: false, 
            endedAt: { $ne: null }
        })
        .sort({endedAt: -1})
        .limit(10)
        .populate("players", "username")
        .populate("winner", "username");

        const upcomingTournaments = await Tournament.find({
            startTime: { $gte: new Date() }
        })
        .sort({ startTime: 1 })
        .limit(5)
        .populate("winner", "username")
        .populate("players", "username");

        const pastTournaments = await Tournament.find({
            startTime: { $lt: new Date() }
        })
        .sort({ startTime: -1 })
        .limit(5)
        .populate("winner", "username")
        .populate("players", "username");

        res.json({
            ongoingMatches,
            activeUsersThisWeek, 
            last10Matches,
            upcomingTournaments, 
            pastTournaments
        });
    } catch (error) {
        res.status(500).json({error: "Failed to fetch platform activity"});
    }
};

export const loginUser =  async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({error:"Email and password are required"});
        }

        const user = await User.findOne({email});

        if(!user || user.password !== password) {
            return res.status(400).json({error:"Invalid email or password"});
        }
        const safeUser = sanitizeUser(user);

        res.json({
            message: "Login successful", 
            user: safeUser
        });
    } catch (error){
        res.status(500).json({error:"Could not log in user"});
    }
};

export const banUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            {isBanned: true}, 
            {new: true}
        );
        if(!user) {
            return res.status(404).json({error:"User not found"});
        }
        res.json({
            message: "User banned", 
            user: sanitizeUser(user)
        });
    } catch (error){
        res.status(500).json({error:"Could not ban user"});
    }
};