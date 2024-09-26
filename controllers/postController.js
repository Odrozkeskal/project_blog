
const path = require('path');
const multer = require('multer');
const knex = require('../db'); 

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
  console.log('Request to receive all posts');

  try {
    const posts = await knex('posts')
      .select('posts.*', 'users.username AS author')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .orderBy('created_at', 'desc');

    console.log('Posts have been successfully received:', posts);
    res.render('posts', { title, posts, userId: req.session.userId });
  } catch (error) {
    console.error('Error when receiving posts:', error);
    res.status(500).send('Error when receiving posts');
  }
};

exports.getPost = async (req, res) => {
  const title = 'Post';
  const postId = req.params.id;
  console.log(`Request to receive a post by ID: ${postId}`);

  try {
    const post = await knex('posts')
      .select('posts.*', 'users.username AS author')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .where('posts.id', postId)
      .first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('The post was not found:', postId);
      return res.redirect('/posts');
    }

    console.log('The post was found successfully:', post);
    res.render('post', { title, post, userId: req.session.userId });
  } catch (error) {
    console.error('Error when receiving a post:', error);
    res.status(500).send('Error when receiving a post');
  }
};


exports.searchPosts = async (req, res) => {
  const title = 'Search Results';
  const searchTerm = req.query.q; 

  console.log(`Search query for posts by term: ${searchTerm}`);

  try {
    const posts = await knex('posts')
      .select('posts.*', 'users.username AS author')
      .leftJoin('users', 'posts.user_id', 'users.id')
      .where('title', 'like', `%${searchTerm}%`) 
      .orWhere('content', 'like', `%${searchTerm}%`) 
      .orderBy('created_at', 'desc');

    console.log('Search Results:', posts);
    res.render('search-results', { title, posts, searchTerm });
  } catch (error) {
    console.error('Error when searching for posts:', error);
    res.status(500).send('Error when searching for posts');
  }
};

exports.createPost = async (req, res) => {
  console.log('Request to create a post');
  
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : null;
  const userId = req.user ? req.user.id : null;

  if (!userId) {
    req.flash('error_msg', 'You must be logged in to add a post.');
    console.warn('Unauthorized access to post creation');
    return res.redirect('/login');
  }

  console.log('the content of the post:', { title, content, imagePath, userId });

  try {
    const [post] = await knex('posts')
      .insert({ title, content, image: imagePath, user_id: userId })
      .returning('*');

    req.flash('success_msg', 'The post has been added successfully');
    console.log('The post has been added successfully:', post);
    res.redirect(`/posts/${post.id}`);
  } catch (error) {
    console.error('Error when adding a post:', error);
    req.flash('error_msg', 'Error adding a post');
    return res.redirect('/posts/add');
  }
};

exports.editPostForm = async (req, res) => {
  const postId = req.params.id;
  const title = 'Edit Post';
  console.log(`Request to edit a post by ID: ${postId}`);

  try {
    const post = await knex('posts').where('id', postId).first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('The post was not found for editing:', postId);
      return res.redirect('/posts');
    }

    const userId = req.session.userId;
    const user = await knex('users').where('id', userId).first();
    const isAdmin = user && user.role === 'admin';

   
    if (!isAdmin && post.user_id !== userId) {
      req.flash('error_msg', 'You do not have the rights to edit this post');
      console.warn('Attempt to edit a post without rights:', postId);
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

  console.log(`Request to update the post by ID: ${postId}`);
  console.log('Data for updating the post:', { title, content, imagePath });

  try {
    const post = await knex('posts').where('id', postId).first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('The post was not found when updating:', postId);
      return res.redirect('/posts');
    }

    const userId = req.session.userId;
    const user = await knex('users').where('id', userId).first();
    const isAdmin = user && user.role === 'admin';

    
    if (!isAdmin && post.user_id !== userId) {
      req.flash('error_msg', 'You do not have the rights to edit this post');
      console.warn('Attempt to update a post without rights:', postId);
      return res.redirect('/posts');
    }

    await knex('posts')
      .where('id', postId)
      .update({ title, content, image: imagePath });

    req.flash('success_msg', 'The post has been successfully updated');
    console.log('The post has been successfully updated:', postId);
    res.redirect(`/posts/${postId}`);
  } catch (error) {
    console.error('Error updating the post:', error);
    req.flash('error_msg', 'Error updating the post');
    return res.redirect(`/posts/${postId}/edit`);
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;

  console.log(`Request to delete a post by ID: ${postId}`);

  try {
    const post = await knex('posts').where('id', postId).first();

    if (!post) {
      req.flash('error_msg', 'Post has not found');
      console.warn('The post was not found when deleted:', postId);
      return res.status(404).send('The post was not found');
    }

    const userId = req.session.userId;
    const user = await knex('users').where('id', userId).first();
    const isAdmin = user && user.role === 'admin';

    console.log(`Checking user rights: userId=${userId}, post.user_id=${post.user_id}, isAdmin=${isAdmin}`);

   
    if (!isAdmin && post.user_id !== userId) {
      req.flash('error_msg', 'You do not have the rights to delete this post');
      console.warn('Attempt to delete a post without rights:', postId);
      return res.status(403).send('Access is denied');
    }

    await knex('posts').where('id', postId).del();
    req.flash('success_msg', 'The post was successfully deleted');
    console.log('The post was successfully deleted:', postId);
    res.status(204).send(); 
  } catch (error) {
    console.error('Error when deleting a post:', error);
    res.status(500).send('Error when deleting a post');
  }
};

exports.getMyPosts = async (req, res) => {
  console.log("A request for 'My Posts' from a user:", req.session.userId);
  const userId = req.session.userId;

  if (!userId) {
    req.flash('error_msg', 'You must be logged in to view your posts.');
    return res.redirect('/login');
  }

  try {
    const posts = await knex('posts')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    console.log('Posts have been successfully received:', posts);
    res.render('my-posts', { title: 'Мои посты', posts, userId });
  } catch (error) {
    console.error('Error when receiving user posts:', error);
    res.status(500).send('Error when receiving posts');
  }
};



exports.renderAddPostForm = (req, res) => {
  const title = 'Add Post';
  res.render('add-post', { title });
};

module.exports.uploadSingle = uploadSingle;
