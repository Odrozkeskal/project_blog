const express = require('express');
const path = require('path');
const morgan = require('morgan');
const postRoutes = require('./routes/postRoutes');
const postController = require('./controllers/postController');
const authRoutes = require('./routes/authRoutes');
const { Client } = require('pg');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const initializePassport = require('./passport-config');
const app = express();
const PORT = 3000;
const db = require('./db');
// Инициализация Passport
initializePassport(passport);

// Установка шаблонизатора EJS
app.set('view engine', 'ejs');

// Функция для создания пути к шаблонам
const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

// Middleware
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('styles'));
app.use('/uploads', express.static('uploads'));
app.use(methodOverride('_method'));

// Настройка сессий
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Добавьте middleware для Passport
app.use(passport.initialize());
app.use(passport.session());

// Настройка flash-сообщений
app.use(flash());

// Передача flash-сообщений в локальные переменные
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.user; // Передаем информацию о пользователе
  next();
});

// Middleware для проверки авторизации
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'You must be logged in to access this page.');
  res.redirect('/login'); // оставляем редирект на /login
}



// Использование маршрутов
app.use('/posts', postRoutes);
app.use('/', authRoutes);

// Маршрут для добавления поста
app.get('/add-post', isAuthenticated, postController.renderAddPostForm);

// Главная страница
app.get('/', (req, res) => {
  const title = 'Home';
  res.render(createPath('index'), { title });
});

// Обработка 404 ошибок
app.use((req, res) => {
  const title = 'Error Page';
  res.status(404).render(createPath('error'), { title });
});

// Запуск сервера
app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Listening on port ${PORT}`);
  }
});
