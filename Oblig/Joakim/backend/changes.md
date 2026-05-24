
- Added login post route in api.router.js

- Importing user schema and hash into user.controller.js

- Made createUser in services/user.services.js real: now creates and saves a User to the database.

- Added password comparison method in models/users.js.

- Registration was already using the existing POST /api/users route.

- Added user POST route

- Added a seperate validator for creating a use