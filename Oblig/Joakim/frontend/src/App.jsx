import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./pages/About/About.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Login from "./pages/Login/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.jsx";
import Registration from "./pages/Registration/Registration.jsx";
import TermsOfService from "./pages/TermsOfService/TermsOfService.jsx";
import CreateGame from "./pages/CreateGame/CreateGame.jsx";
import Lobby from "./pages/Lobby/Lobby.jsx";
import Game from "./pages/Game/Game.jsx";
import AboutGame from "./pages/AboutGame/AboutGame.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy.jsx";
import AppShell from "./components/layout/AppShell.jsx";


// The platform should have the following pages:

// - **Homepage** introduces the 1st-time visitors to the game, shows an overview of platform activity, and allows for quickly starting a game. It should contain:
//   - brief message describing the game and platform (no more than a couple of sentences)
//   - prominent button (or a set of suitable controls) to create a new game
//   - lobby preview: a list of N games available for joining (the N is customizable). Clicking on a game should open the game's page and automatically have the user join it. Each record in the list should detail the game's variant and show other player(s) username(s) and average Elo rating.
//   - top 5 games: a list of currently running 5 games with the highest average Elo of players. Clicking on a game should open the game's page. Each record in the list should detail the game's variant and show players' usernames and average Elo rating. If less than 5 games are currently running, the component should include past games (most recent).
//   - tournament list preview: a list of 5 upcoming tournaments (5 tournaments closest to the current date/time). Clicking on a tournament should open the tournament's page. Each record in the list should detail the tournament's date/time and game variant, and show how many players have signed up.

// - **Lobby** page lists games that the player can join, i.e., the games that have not started yet because they do not have enough players and are available for the viewing user to join. Only the games that the user can join should be shown: anonymous users should not see the games they can't join (if it was created by a registered user and the user chose to not allow anonymous users to join); registered users should not see the games not suitable for their Elo rating. The appearance of the list can be similar to the Lobby Preview components on the Homepage, but can also be more detailed.
// - **Create game** page allows for creating a game. A newly created game is automatically added into the lobby and the player is matched with an appropriate another player (or players as some games may require more than 1 player). The page contains a single form that allows for choosing the variant of the game (three different sub-components), allowing/not-allowing for anonymous users to join the game (only available to registered users), and desired Elo of the opponent.
// - **Individual game** page is the central piece of the platform. If the user created this game, they are automatically added as one of the players. If not enough players have joined the game, its status is shown as "waiting for other players" (e.g., as an overlay on top of the dice board area). The page is refreshed every 15 seconds to check if somebody joined the game (no Web Sockets in this sprint - unless you choose to implement them). Non-participating users can view the game and leave/view comments. The page should include:
//   - Game board, with names and Elo ratings of participating players. The area for the actual game should be reserved, but not implemented yet in this sprint.
//   - Side bar with comments and text field with a button to leave a comment. Each comment shows the name of the user, date/time, and comment text.
// - **Tournament list** page lists upcoming tournaments. The list can be implemented as a table, grid or tiles. The info on the list should include all the info from the Tournament Preview component on the homepage, and potentially, extra information (e.g., tournament full title and what kind of trophies are awarded).
// - **Individual tournament** page details a tournament. The info should include:
//   - Full title
//   - Full description
//   - Date/Time
//   - Tournament format (game variant and any other rule, e.g., if it's open to specific geographic areas only and/or only certain Elo ranges)
//   - Tournament trophies (an image/title of a trophy/badge that will be shown on the winner's profile page)
//   - List of participants that clicked "join tournament"
//   - The list of comments and controls to leave comments should be at the bottom of the page.

// - **Logging in** page should include a form to log in: username, password, and "forgot password" button to reset the password (resetting password does not have to be implemented in this sprint).

// - **Registration** page should include a form to register: username, password, password repeat, data of birth (adults only), email, and "I agree to terms and conditions" checkbox.

// - **Individual user profile** page should show - and allow for editing - a user profile image, username (not editable), email (to the user themselves only), and about me description. The user's password should be editable, but not shown. The page should also show:
//   - list of user's trophies (and other awards if the system has them)
//   - user stats: Elo rating in the three time controls, number of played games, number of losses/wins in the last month
//   - list of user's last 10 games
//   - link to another page to view all user's games
// - **About Us** page should introduce the platform. Feel free to be imaginative and make up the history of the platform.
// - **About Spanish Dice** page should describe the game. Texts should not be copy-pasted directly. Images can be borrowed without copyright violations.
// - **Terms and Conditions** and **Privacy Policy** pages can be generated using one of existing free generators online.

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/terms",
        element: <TermsOfService />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/game/:gameId",
        element: <Game />,
      },
      {
        path: "/game/create",
        element: <CreateGame />,
      },
      {
        path: "/lobby",
        element: <Lobby />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/aboutGame",
        element: <AboutGame />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/register",
    element: <Registration />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
