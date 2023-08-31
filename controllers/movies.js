const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const ConflictError = require('../errors/conflict-err');

function getMoviesUser(req, res, next) {
  return Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
}

function createMovie(req, res, next) {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  }).then((movie) => {
    res.status(200).send(movie);
  })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Передача некоректых данных'));
      } else if (err.code === 11000) {
        next(new ConflictError('Фильм уже в избранном'));
      } else {
        next(err);
      }
    });
}

function deleteMovie(req, res, next) {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .then((movie) => {
      if (movie.owner !== req.user._id) {
        next(new ForbiddenError('Недостаточно прав для удаления'));
      } else {
        movie.deleteOne();
        res.send({ message: 'Фильм удален из избранного' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректное id фильма'));
      } else {
        next(err);
      }
    });
}
module.exports = {
  getMoviesUser,
  createMovie,
  deleteMovie,
};
