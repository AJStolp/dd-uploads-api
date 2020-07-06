const xss = require("xss");
const bcrypt = require("bcryptjs");

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const usersService = {
	getAllUsers(knex) {
		return knex.select("*").from("users");
	},
	insertUsers(knex, newUser) {
		return knex
			.insert(newUser)
			.into("users")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getById(knex, id) {
		return knex.from("users").select("*").where("id", id).first();
	},
	deleteUsers(knex, id) {
		return knex("users").where({ id }).delete();
	},
	validatePassword(password) {
		if (password.length < 8) {
			return "Password must be longer than 8 characters";
		}
		if (password.length > 72) {
			return "Password must be less than 72 charcters";
		}
		if (password.startsWith(" ") || password.endsWith(" ")) {
			return "Password must not start or end with an empty character space";
		}
		if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
			return "Password must contain 1 uppercase, 1 lowercase, 1 numbers, and 1 special character";
		}
		return null;
	},

	serializeUser(user) {
		return {
			id: user.id,
			email: xss(user.email),
			username: xss(user.username),
			date_created: new Date(user.date_created),
		};
	},

	hashPassword(password) {
		return bcrypt.hash(password, 12);
	},

	hasUserWithUsername(db, username) {
		return db("users")
			.where({ username })
			.first()
			.then((user) => !!user);
	},
};
module.exports = usersService;
