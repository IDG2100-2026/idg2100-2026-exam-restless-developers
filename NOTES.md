# Leave below any info you want examiners to see

Including the info on the starter code (whose repository and how used), notes on seeding and launching the app, optional info on the work distribution within the team, and notes on unfinished parts of the project and unpatched bugs.

# Notes
The backend expects a .env file with the following variables: 

BACKEND_PORT=6767
DB_NAME=restless-developers
NODE_ENV=development
JWT_SECRET=development-secret
MONGO_URI=mongodb://localhost:27017/restless-developers

The project includes a database seeding script. The seed script clears existing users and tournaments, creates a seeded admin user, and inserts tournament data from tournaments.json.

Seeded admin user: 
username: seed-admin
password: Password123!

The tournament seed data includes upcoming, ongoing, and finished tournaments for showcasing tournaments functionality.

## Vilde notes 
Implementations: 
Header
Footer
Privacy policy
Terms and conditions 
Upcoming tournaments component/homepage
Admin Pages
Tournament pages
Tournament-game integration
Global error handling for tournaments
Authentication and authorization 
Rate limiting middleware

Used Privacy Policy and Terms & Conditions from my own project, but made small changes. 

## Joakim Notes
Used similar style from my project.
