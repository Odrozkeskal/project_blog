const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Импортируем файл подключения к базе данных
const passport = require('passport');

// GET-метод для страницы регистрации
router.get('/register', (req, res) => {
    const success_msg = req.flash('success_msg');
    const error_msg = req.flash('error_msg');
    res.render('register', { success_msg, error_msg, title: 'Register' });
});

// POST-метод для регистрации
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Пытаемся зарегистрировать пользователя:', username);

    try {
        // Используем Knex для вставки пользователя
        await db('users').insert({
            username,
            password: hashedPassword
        });
        console.log('Пользователь успешно зарегистрирован');
        req.flash('success_msg', 'Registration was successful. Now you can enter.');
        
        // Рендерим страницу с сообщением и устанавливаем задержку для редиректа
        res.render('register', { 
            success_msg: req.flash('success_msg'), 
            error_msg: '', 
            title: 'Register',
            redirect: true 
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        req.flash('error_msg', 'Registration error. Try again.');
        res.render('register', { 
            success_msg: '', 
            error_msg: req.flash('error_msg'), 
            title: 'Register',
            redirect: false 
        });
    }
});

// GET-метод для страницы входа
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
            console.log('User ID сохранен в сессии:', req.session.userId); // Логирование для отладки
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
