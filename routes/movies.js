const moviesRoutes = require('express').Router();
const {
  getMoviesUser, createMovie, deleteMovie,
} = require('../controllers/movies');
const { validateCreateMovie, validateDeleteMovie } = require('../middlewares/validation');

moviesRoutes.get('/', getMoviesUser);

moviesRoutes.post('/', validateCreateMovie, createMovie);

moviesRoutes.delete('/:movieId', validateDeleteMovie, deleteMovie);

module.exports = moviesRoutes;
