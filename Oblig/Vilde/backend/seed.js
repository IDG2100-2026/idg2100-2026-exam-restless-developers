import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.dev"});
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

import { User } from "./models/user.js";
import { Category } from "./models/category.js";
import { Match } from "./models/match.js";
import { Tournament } from "./models/tournament.js";
import { Comment } from "./models/comment.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error){
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    console.log("Clearing old data");
    await User.deleteMany();
    await Category.deleteMany();
    await Match.deleteMany();
    await Tournament.deleteMany();
    await Comment.deleteMany();

    console.log("Seeding categories");

    //new code
    const bestOfOptions = [3,5,7];
    const timeOptions = [3, 10, 30];
    const straightsOptions = [true, false]

    const categoryData = [];

    for (const rounds of bestOfOptions) {
        for (const timePerRound of timeOptions) {
            for(const straightsAllowed of straightsOptions) {
                categoryData.push({
                    rounds, 
                    straightsAllowed,
                    timePerRound,
                    label: `Best of ${rounds} | Straights ${straightsAllowed ? "allowed" : "not allowed"} | ${timePerRound}s`,
                });
            }
        }
    }

    const categories = await Category.insertMany(categoryData);
//New code ends here 

    console.log("Seeding users");
    const users = await User.insertMany([
        {
            username: "Vilde", 
            email: "vlsivert@ntnu.no", 
            password: "somethingPassword", 
            age: 33,
            role: "admin"
        }, 
        {
            username: "Eva", 
            email: "example@something.com", 
            password: "somethingPassword", 
            age: 20,
            role: "user"
        }, 
        {
            username: "Lars", 
            email: "lars@example.com", 
            password: "somethingPassword", 
            age: 34, 
            role: "user"
        },
        { //added a guest user
            username: "Guest",
            email: "guest@example.com",
            password: "guestpassword",
            age: 30,
            role:"anonymous"
        }
    ]);

    console.log("seeding match");
    const match1 = await Match.create({
        players: [users[0]._id, users[1]._id], 
        category: categories.find(
            (c) =>
                c.rounds === 3 &&
            c.timePerRound === 3 &&
            c.straightsAllowed === true
        )._id,
        rounds: [
            {
                roundNumber: 1,
                rolls: [
                    {
                        dice: ["K", "A", "7", "8", "Q"],
                        holds: [false, false, false, false, false],
                        timestamp: new Date()
                    }
            ],
            result: "Vilde wins"
            },
            {
                roundNumber: 2,
                 rolls: [
                    {
                        dice: ["7", "A", "K", "J", "Q"],
                        holds: [false, true, false, false, true],
                        timestamp: new Date()
                    }
            ],
            result: "Eva wins"
        }
    ],
        winner: users[0]._id, 
        isAnonymous: false, 
        startedAt: new Date(), 
        endedAt: new Date()
    });

    //New code: 
    const match2 = await Match.create({
        players: [users[2]._id],
        category: categories.find(
            (c) => 
                c.rounds === 5 &&
            c.timePerRound === 10 &&
            c.straightsAllowed === false
        )._id,
        rounds: [],
        isAnonymous: true,
        startedAt: new Date(),
        endedAt: null,
    });

    const match3 = await Match.create({
        players: [users[1]._id],
        category: categories.find(
            (c) => 
                c.rounds === 7 &&
            c.timePerRound === 30 &&
            c.straightsAllowed === true
        )._id,
        rounds: [],
        isAnonymous: true, 
        startedAt: new Date(),
        endedAt: null,
    });
//New code ends here 

    await User.findByIdAndUpdate(users[0]._id, {
        $push: { playedMatches: match1._id }
    });

    //Old code/Removed: 
    // await User.findByIdAndUpdate(users[1]._id, {
    //     $push: {playedMatches: match1._id}
    // });

    //New code: 
    await User.findByIdAndUpdate(users[1]._id, {
        $push: { playedMatches: { $each: [match1._id, match3._id]}}
    });

    //Added code
    await User.findByIdAndUpdate(users[2]._id, {
        $push: {playedMatches: match2._id},
    });

    //New code ends here

    console.log("seeding tournament");
    const tournament = await Tournament.create({
        name: "Champion tournament", 
        description: "SomethingSomething description", 
        category: categories.find( //Updated
            (c) => 
                c.rounds === 5 &&
            c.timePerRound === 10 && 
            c.straightsAllowed === false 
        )._id, //Until here 
        startTime: new Date(), 
        trophy: {
            title: "Golden dice", 
            image: "http://example.com/trophy.png"
        },
        players: [users[0]._id, users[1]._id, users[2]._id],
        rounds: [
            {
                roundNumber: 1, 
                matches: [match1._id], 
                byePlayers: [users[2]._id]
            }
        ], 
        status: "pending", 
    });

    await User.findByIdAndUpdate(users[0]._id, {
        $push: {joinedTournaments: tournament._id}
    });

    await User.findByIdAndUpdate(users[1]._id, {
        $push: { joinedTournaments: tournament._id}
    });

    await User.findByIdAndUpdate(users[2]._id, {
        $push: {joinedTournaments: tournament._id}
    });


    console.log("seeding comments");
    const comment = await Comment.create({
        author: users[0]._id, 
        text: "Good luck!", 
        type: "tournament", 
        tournament: tournament._id
    });

    await Tournament.findByIdAndUpdate(tournament._id, {
        $push: { comments: comment._id}
    });

    console.log("Seed completed with success");
    process.exit();
}

seed();