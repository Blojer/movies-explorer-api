const router = require('express').Router();
const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const { login, createUser } = require('../controllers/users');
const { validateSignUp, validateSignIn } = require('../middlewares/validation');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');

router.post('/signup', validateSignUp, createUser);
router.post('/signin', validateSignIn, login);

router.use(auth);

router.use('/users', usersRoutes);
router.use('/movies', moviesRoutes);

router.get('/signout', (_req, res) => {
  res.clearCookie('token');
  res.send({ message: 'Кука удалена' });
});

router.use('*', (_req, res, next) => { next(new NotFoundError('Неверный путь')); });

module.exports = router;
