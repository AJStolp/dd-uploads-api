const usersService = {
    getAllUsers(knex) {
        return knex.select('*').from('users')
    },
    insertUsers(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('users').select('*').where('id', id).first()
    },
    deleteUsers(knex, id) {
        return knex('users')
            .where({id})
            .delete()
    },
    updateUsers(knex, id, newUserFields){
        return knex('users')
            .where({id})
            .update(newUserFields)
    }
}


module.exports = usersService