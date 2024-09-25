const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const uploadSingle = postController.uploadSingle;

// Функция для проверки аутентификации
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to continue');
    res.redirect('/login');
}

// Маршруты для постов
router.get('/', postController.getAllPosts); // Получить все посты
router.get('/search', postController.searchPosts); // Поиск постов
router.get('/my-posts', ensureAuthenticated, postController.getMyPosts); // Мои посты
router.get('/:id', postController.getPost); // Получить пост по ID


// Защищенные маршруты
router.get('/add', ensureAuthenticated, postController.renderAddPostForm); // Форма добавления поста
router.post('/', ensureAuthenticated, uploadSingle, postController.createPost); // Создать пост
router.get('/edit/:id', ensureAuthenticated, postController.editPostForm); // Форма редактирования поста
router.put('/:id', ensureAuthenticated, uploadSingle, postController.updatePost); // Обновить пост
router.delete('/:id', ensureAuthenticated, postController.deletePost); // Удалить пост

module.exports = router;
