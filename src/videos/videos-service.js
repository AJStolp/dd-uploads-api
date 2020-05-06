const videosService = {
    getAllVideos(knex) {
        return knex.select('*').from('uploaded_videos')
    },
    insertVideos(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('uploaded_videos')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('uploaded_videos').select('*').where('id', id).first()
    },
    deleteVideos(knex, id) {
        return knex('uploaded_videos')
            .where({id})
            .delete()
    },
    updateVideos(knex, id, newVideoFields){
        return knex('uploaded_videos')
            .where({id})
            .update(newVideoFields)
    }
}


module.exports = videosService