const AuthService = require("../auth/auth-service");

function requireAuth(req, res, next) {
	let reqAuthToken = req.get("Authorization");

	const authToken = req.get("Authorization") || "";

	let basicToken;
	if (!authToken.toLowerCase().startsWith("basic")) {
		return res.status(401).json({ error: "Missing Basic auth token" });
	} else {
		basicToken = authToken.slice("basic".length, authToken.length);
	}

	const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(
		basicToken
	);
	if (!tokenUserName || !tokenPassword) {
		return res.status(401).json({ error: "Unauthorized Request - no token" });
	}

	AuthService.getUserWithUserName(req.app.get("db"), tokenUserName)
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Unauthorized dude!" });
			}
			return AuthService.comparePassWords(tokenPassword, user.password).then(
				(passwordMatch) => {
					if (!passwordMatch) {
						return res
							.status(401)
							.json({ error: "Unauthorized - Sorry my dude." });
					}
					req.username = user;
					next();
				}
			);
		})
		.catch(next);
}

module.exports = {
	requireAuth,
};
