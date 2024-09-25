/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg', // Используем PostgreSQL
    connection: {
      host: 'localhost', // Хост базы данных
      user: 'postgres', // Ваш пользователь
      password: 'root', // Ваш пароль
      database: 'blog' // Название вашей базы данных
    },
    migrations: {
      tableName: 'knex_migrations' // Имя таблицы для миграций
    }
  },

  production: {
    client: 'pg', // Используем PostgreSQL
    connection: {
      host: 'ep-tight-fire-a2uwlm4w.eu-central-1.aws.neon.tech', // Хост базы данных
      user: 'medicines_owner', // Ваш пользователь
      password: 'fc5OxGyiAT4W', // Ваш пароль
      database: 'Blog', // Название вашей базы данных
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      tableName: 'knex_migrations' // Имя таблицы для миграций
    }
  },
}
