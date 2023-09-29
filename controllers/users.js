const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

function getUserInfo(req, res, next) {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
}

function createUser(req, res, next) {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      })
    )
    .then((user) =>
      res.status(201).send({
        name: user.name,
        email: user.email,
      })
    )
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Передача некоректых данных'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
}

function updateUser(req, res, next) {
  const { email, name } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      upsert: true, // если пользователь не найден, он будет создан
    }
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Передача некоректых данных'));
      } else if (!req.user._id) {
        next(new NotFoundError('Пользователя с таким id не найдено'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        maxAge: 360000000,
        httpOnly: true,
        sameSite: true,
      });
      return res.send(user.toJSON());
    })
    .catch(next);
}

module.exports = {
  getUserInfo,
  createUser,
  updateUser,
  login,
};
