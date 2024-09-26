/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg', 
    connection: {
      host: 'localhost', 
      user: 'postgres', 
      password: 'root', 
      database: 'blog' 
    },
    migrations: {
      tableName: 'knex_migrations' 
    }
  },

  production: {
    client: 'pg', 
    connection: {
      host: 'ep-tight-fire-a2uwlm4w.eu-central-1.aws.neon.tech',
      user: 'medicines_owner', 
      password: 'fc5OxGyiAT4W', 
      database: 'Blog', // 
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      tableName: 'knex_migrations' 
    }
  },
}
