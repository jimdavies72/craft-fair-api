const { Router } = require('express');
const {
  loginUser,
  createUser,
  listUsers,
  findUser,
  updateUser,
  deleteUser
} = require('./userControllers');

const {
  checkToken,
  hashPassword,
  decryptPassword,
  validateEmail,
} = require('../middleware');

const userRouter = Router()

// login with un & pw
userRouter.post('/user/login', decryptPassword, loginUser);
// login with token
userRouter.get('/user', checkToken, loginUser);
userRouter.post('/user/create', validateEmail, hashPassword, createUser);
userRouter.put('/user', listUsers);
userRouter.post('/user/find', findUser);
userRouter.patch('/user', validateEmail, hashPassword, checkToken, updateUser);
userRouter.delete('/user/:username', checkToken, deleteUser);

module.exports = userRouter;