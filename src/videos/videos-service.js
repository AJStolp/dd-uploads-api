const videosService = {
	getAllVideos(knex) {
		return knex.select("*").from("uploaded_video");
	},
	insertVideos(knex, newVideo) {
		return knex
			.insert(newVideo)
			.into("uploaded_video")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getById(knex, id) {
		return knex.from("uploaded_video").select("*").where("id", id).first();
	},
	deleteVideos(knex, id) {
		return knex("uploaded_video").where({ id }).delete();
	},
	updateVideos(knex, id, newVideoFields) {
		return knex("uploaded_video").where({ id }).update(newVideoFields);
	},
};

module.exports = videosService;
