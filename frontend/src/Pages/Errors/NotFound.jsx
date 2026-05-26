import { Link } from "react-router-dom";
import styles from "./NotFound.css";

function NotFound() {
	return (
		<main>
			<h1>404 - Page Not Found</h1>
			<p>The page you are looking for does not exist.</p>
			<Link to="/">Go to Homepage</Link>
		</main>
	);
}

export default NotFound;
