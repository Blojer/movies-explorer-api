const usersRoutes = require('express').Router();
const {
  getUserInfo, updateUser,
} = require('../controllers/users');
const { validateUpdateUser } = require('../middlewares/validation');

usersRoutes.get('/me', getUserInfo);

usersRoutes.patch('/me', validateUpdateUser, updateUser);

module.exports = usersRoutes;
