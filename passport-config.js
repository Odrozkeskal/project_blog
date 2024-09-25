const LocalStrategy = require('passport-local').Strategy;
const db = require('./db'); // Импортируйте ваш файл подключения к базе данных
const bcrypt = require('bcrypt');

// Настройка стратегии
function initialize(passport) {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await db('users').where({ username }).first();

        if (!user) {
          console.log('Пользователь не найден'); // Логируем
          return done(null, false, { message: 'Пользователь не найден' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log('Неверный пароль'); // Логируем
          return done(null, false, { message: 'Неверный пароль' });
        }

        console.log('Пользователь аутентифицирован:', user); // Логируем
        return done(null, user);
      } catch (error) {
        console.error('Ошибка аутентификации:', error); // Логируем
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    console.log('Сериализация пользователя:', user.id); // Логируем
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db('users').where({ id }).first();
      console.log('Десериализация пользователя:', user); // Логируем
      done(null, user);
    } catch (error) {
      console.error('Ошибка десериализации:', error); // Логируем
      done(error);
    }
  });
}

module.exports = initialize;

