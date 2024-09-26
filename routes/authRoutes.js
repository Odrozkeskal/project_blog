const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); 
const passport = require('passport');


router.get('/register', (req, res) => {
    const success_msg = req.flash('success_msg');
    const error_msg = req.flash('error_msg');
    res.render('register', { success_msg, error_msg, title: 'Register' });
});


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('We are trying to register a user:', username);

    try {
        // Используем Knex для вставки пользователя
        await db('users').insert({
            username,
            password: hashedPassword
        });
        console.log('The user has been successfully registered');
        req.flash('success_msg', 'Registration was successful. Now you can enter.');
        
       
        res.render('register', { 
            success_msg: req.flash('success_msg'), 
            error_msg: '', 
            title: 'Register',
            redirect: true 
        });
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Registration error. Try again.');
        res.render('register', { 
            success_msg: '', 
            error_msg: req.flash('error_msg'), 
            title: 'Register',
            redirect: false 
        });
    }
});


router.get('/login', (req, res) => {
    const success_msg = req.flash('success_msg');
    const error_msg = req.flash('error_msg');
    res.render('login', { success_msg, error_msg, title: 'Login' });
});

// POST-метод для входа с использованием Passport
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error_msg', 'Incorrect credentials');
            return res.render('login', {
                success_msg: '',
                error_msg: req.flash('error_msg'),
                title: 'Login',
                redirect: false
            });
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            // Сохраните userId в сессии
            req.session.userId = user.id;
            console.log('The user ID is saved in the session:', req.session.userId); 
            req.flash('success_msg', 'You have successfully logged in.');
            return res.render('login', {
                success_msg: req.flash('success_msg'),
                error_msg: '',
                title: 'Login',
                redirect: true
            });
        });
    })(req, res, next);
});

// Выход
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        req.flash('success_msg', 'You are logged out of the system');
        res.redirect('/');
    });
});

module.exports = router;
