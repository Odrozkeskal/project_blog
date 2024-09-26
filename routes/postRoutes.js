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
router.get('/', postController.getAllPosts); 
router.get('/search', postController.searchPosts); 
router.get('/my-posts', ensureAuthenticated, postController.getMyPosts); 
router.get('/:id', postController.getPost); 


// Защищенные маршруты
router.get('/add', ensureAuthenticated, postController.renderAddPostForm); а
router.post('/', ensureAuthenticated, uploadSingle, postController.createPost);
router.get('/edit/:id', ensureAuthenticated, postController.editPostForm); 
router.put('/:id', ensureAuthenticated, uploadSingle, postController.updatePost); 
router.delete('/:id', ensureAuthenticated, postController.deletePost); 

module.exports = router;
