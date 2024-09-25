
const path = require('path');
const multer = require('multer');
const knex = require('../db'); // Подключение к Knex

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const uploadSingle = upload.single('image');

exports.getAllPosts = async (req, res) => {
  const title = 'Posts';
  console.log('Запрос на получение всех постов');

  try {
    const posts = await knex('posts')
      .select('posts.*', 'users.username AS author')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .orderBy('created_at', 'desc');

    console.log('Посты успешно получены:', posts);
    res.render('posts', { title, posts, userId: req.session.userId });
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    res.status(500).send('Ошибка при получении постов');
  }
};

exports.getPost = async (req, res) => {
  const title = 'Post';
  const postId = req.params.id;
  console.log(`Запрос на получение поста с ID: ${postId}`);

  try {
    const post = await knex('posts')
      .select('posts.*', 'users.username AS author')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .where('posts.id', postId)
      .first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('Пост не найден:', postId);
      return res.redirect('/posts');
    }

    console.log('Пост успешно найден:', post);
    res.render('post', { title, post, userId: req.session.userId });
  } catch (error) {
    console.error('Ошибка при получении поста:', error);
    res.status(500).send('Ошибка при получении поста');
  }
};


exports.searchPosts = async (req, res) => {
  const title = 'Search Results';
  const searchTerm = req.query.q; // Получаем поисковый термин из запроса

  console.log(`Запрос на поиск постов по термин: ${searchTerm}`);

  try {
    const posts = await knex('posts')
      .select('posts.*', 'users.username AS author')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .where('title', 'like', `%${searchTerm}%`) // Ищем по заголовку
      .orWhere('content', 'like', `%${searchTerm}%`) // Ищем по содержимому
      .orderBy('created_at', 'desc');

    console.log('Результаты поиска:', posts);
    res.render('search-results', { title, posts, searchTerm });
  } catch (error) {
    console.error('Ошибка при поиске постов:', error);
    res.status(500).send('Ошибка при поиске постов');
  }
};

exports.createPost = async (req, res) => {
  console.log('Запрос на создание поста');
  
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : null;
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    req.flash('error_msg', 'You must be logged in to add a post.');
    console.warn('Неавторизованный доступ к созданию поста');
    return res.redirect('/login');
  }

  console.log('Данные поста:', { title, content, imagePath, userId });

  try {
    const [post] = await knex('posts')
      .insert({ title, content, image: imagePath, user_id: userId })
      .returning('*');

    req.flash('success_msg', 'The post has been added successfully');
    console.log('Пост успешно добавлен:', post);
    res.redirect(`/posts/${post.id}`);
  } catch (error) {
    console.error('Ошибка при добавлении поста:', error);
    req.flash('error_msg', 'Error adding a post');
    return res.redirect('/posts/add');
  }
};

exports.editPostForm = async (req, res) => {
  const postId = req.params.id;
  const title = 'Edit Post';
  console.log(`Запрос на редактирование поста с ID: ${postId}`);

  try {
    const post = await knex('posts').where('id', postId).first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('Пост не найден для редактирования:', postId);
      return res.redirect('/posts');
    }

    const userId = req.session.userId;
    const user = await knex('users').where('id', userId).first();
    const isAdmin = user && user.role === 'admin';

    // Проверка прав доступа
    if (!isAdmin && post.user_id !== userId) {
      req.flash('error_msg', 'You do not have the rights to edit this post');
      console.warn('Попытка редактирования поста без прав:', postId);
      return res.redirect('/posts');
    }

    console.log('Форма редактирования поста:', post);
    res.render('edit-post', { title, post });
  } catch (error) {
    console.error('Ошибка при получении поста для редактирования:', error);
    res.status(500).send('Ошибка при получении поста');
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : null;

  console.log(`Запрос на обновление поста с ID: ${postId}`);
  console.log('Данные для обновления поста:', { title, content, imagePath });

  try {
    const post = await knex('posts').where('id', postId).first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('Пост не найден при обновлении:', postId);
      return res.redirect('/posts');
    }

    const userId = req.session.userId;
    const user = await knex('users').where('id', userId).first();
    const isAdmin = user && user.role === 'admin';

    // Проверка прав доступа
    if (!isAdmin && post.user_id !== userId) {
      req.flash('error_msg', 'You do not have the rights to edit this post');
      console.warn('Попытка обновления поста без прав:', postId);
      return res.redirect('/posts');
    }

    await knex('posts')
      .where('id', postId)
      .update({ title, content, image: imagePath });

    req.flash('success_msg', 'The post has been successfully updated');
    console.log('Пост успешно обновлен:', postId);
    res.redirect(`/posts/${postId}`);
  } catch (error) {
    console.error('Ошибка при обновлении поста:', error);
    req.flash('error_msg', 'Error updating the post');
    return res.redirect(`/posts/${postId}/edit`);
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;

  console.log(`Запрос на удаление поста с ID: ${postId}`);

  try {
    const post = await knex('posts').where('id', postId).first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('Пост не найден при удалении:', postId);
      return res.status(404).send('Пост не найден');
    }

    const userId = req.session.userId;
    const user = await knex('users').where('id', userId).first();
    const isAdmin = user && user.role === 'admin';

    console.log(`Проверка прав пользователя: userId=${userId}, post.user_id=${post.user_id}, isAdmin=${isAdmin}`);

    // Проверка прав доступа
    if (!isAdmin && post.user_id !== userId) {
      req.flash('error_msg', 'You do not have the rights to delete this post');
      console.warn('Попытка удаления поста без прав:', postId);
      return res.status(403).send('Доступ запрещен');
    }

    await knex('posts').where('id', postId).del();
    req.flash('success_msg', 'The post was successfully deleted');
    console.log('Пост успешно удален:', postId);
    res.status(204).send(); // Отправляем статус 204
  } catch (error) {
    console.error('Ошибка при удалении поста:', error);
    res.status(500).send('Ошибка при удалении поста');
  }
};

exports.getMyPosts = async (req, res) => {
  console.log("Запрос на 'Мои посты' от пользователя:", req.session.userId);
  const userId = req.session.userId;

  if (!userId) {
    req.flash('error_msg', 'You must be logged in to view your posts.');
    return res.redirect('/login');
  }

  try {
    const posts = await knex('posts')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    console.log('Посты успешно получены:', posts);
    res.render('my-posts', { title: 'Мои посты', posts, userId });
  } catch (error) {
    console.error('Ошибка при получении постов пользователя:', error);
    res.status(500).send('Ошибка при получении постов');
  }
};



exports.renderAddPostForm = (req, res) => {
  const title = 'Add Post';
  res.render('add-post', { title });
};

module.exports.uploadSingle = uploadSingle;
