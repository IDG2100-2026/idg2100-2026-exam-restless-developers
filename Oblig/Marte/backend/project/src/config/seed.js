const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Game = require('../models/Game');
const Tournament = require('../models/Tournament');
const Comment = require('../models/Comment');

//Connect to database, seed data, then disconnect
const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        //Clear the existing data before seeding
        await User.deleteMany({});
        await Game.deleteMany({});
        await Tournament.deleteMany({});
        await Comment.deleteMany({});
        console.log('Cleared existing data');

        // --- USERS ---
        const users = await User.insertMany([
            {
                username: 'admin',
                email: 'admin@pokerdice.com',
                password: 'admin123',
                age: 30,
                role: 'admin',
                eloRating: 1200
            },
            {
                username: 'Nicolai',
                email: 'nico@pokerdice.com',
                password: 'nico123',
                age: 22,
                eloRating: 1100
            },
            {
                username: 'Marte',
                email: 'marty@pokerdice.com',
                password: 'marty123',
                age: 21,
                eloRating: 950
            },
            {
                username: 'Jonas',
                email: 'joni@pokerdice.com',
                password: 'joni123',
                age: 19,
                eloRating: 1050
            },
            {
                username: 'Minnie',
                email: 'minniedog@pokerdice.com',
                password: 'dog123',
                age: 70,
                eloRating: 1000
            }
        ]);
        console.log('Users seeded');

        // --- GAMES ---
        const games = await Game.insertMany([
            {
                playerOne: users[1]._id,  //Nico
                playerTwo: users[2]._id,  //Marte
                variant: { rounds: 5, straightsAllowed: true, timePerRound: 10 },
                status: 'finished',
                winner: users[1]._id,     //nico won
                result: {
                    rolls: [[1,2,3,4,5], [2,2,3,4,6]],
                    holds: [[true,true,true,true,true], [false,false,true,false,false]],
                    finalHands: ['straight', 'pair']
                },
                isAnonymous: false
            },
            {
                playerOne: users[2]._id,  //marte
                playerTwo: users[3]._id,  //jonas
                variant: { rounds: 3, straightsAllowed: false, timePerRound: 5 },
                status: 'finished',
                winner: users[3]._id,     //jonas
                result: {
                    rolls: [[2,2,2,4,5], [3,3,3,3,6]],
                    holds: [[true,true,true,false,false], [true,true,true,true,false]],
                    finalHands: ['three of a kind', 'four of a kind']
                },
                isAnonymous: false
            },
            {
                playerOne: users[1]._id,  //nico
                playerTwo: users[4]._id,  //minnie
                variant: { rounds: 7, straightsAllowed: true, timePerRound: 15 },
                status: 'ongoing',
                isAnonymous: false
            },
            {
                //anonymous game, this is not shown in platform activity
                variant: { rounds: 3, straightsAllowed: false, timePerRound: 5 },
                status: 'finished',
                isAnonymous: true
            }
        ]);
        console.log('Games seeded');

        // --- TOURNAMENT ---
        const tournament = await Tournament.create({
            title: 'Spring Championship 2026',
            description: 'The first official poker dice tournament of 2026.',
            variant: { rounds: 5, straightsAllowed: true, timePerRound: 10 },
            createdBy: users[0]._id,  //admin
            status: 'upcoming',
            startDate: new Date('2026-04-15'),
            minPlayers: 4,
            maxPlayers: 8,
            participants: [users[1]._id, users[2]._id, users[3]._id, users[4]._id],
            trophy: {
                title: 'Spring Champion Trophy',
                image: 'uploads/trophies/spring-trophy.png'
            },
            breakBetweenRounds: 15
        });
        console.log('Tournament seeded');

        // --- COMMENTS ---
        await Comment.insertMany([
            {
                author: users[1]._id,   //nico
                content: 'Great game, well played!',
                game: games[0]._id
            },
            {
                author: users[2]._id,   //marte
                content: 'I demand a rematch!',
                game: games[0]._id
            },
            {
                author: users[3]._id,   //jonas
                content: 'Looking forward to this tournament!',
                tournament: tournament._id
            }
        ]);
        console.log('Comments seeded');

        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
