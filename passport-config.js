const LocalStrategy = require('passport-local').Strategy;
const db = require('./db'); 
const bcrypt = require('bcrypt');

// Настройка стратегии
function initialize(passport) {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await db('users').where({ username }).first();

        if (!user) {
          console.log('The user was not found'); 
          return done(null, false, { message: 'The user was not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log('Invalid password'); 
          return done(null, false, { message: 'Invalid password' });
        }

        console.log('The user is authenticated:', user);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error); 
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    console.log('User Serialization:', user.id); 
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db('users').where({ id }).first();
      console.log('Deserialization of the user:', user); 
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error); 
      done(error);
    }
  });
}

module.exports = initialize;

