module.exports = {
	PORT: process.env.PORT || 8000,
	NODE_ENV: process.env.NODE_ENV || "development",
	DATABASE_URL:
		process.env.DATABASE_URL || "postgresql://anthonystolp@localhost/dd-uploads",
	JWT_SECRET: process.env.JWT_SECRET || "you-are-the-secret",
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL
};
