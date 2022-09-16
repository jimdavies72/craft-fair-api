const { Router } = require("express");
const { 
  loginUser,
  addUser, 
  getAllUsers, 
  findUser, 
  updateUser,
  deleteUser
} = require("./userControllers");

const {
  checkToken,
  hashPassword,
  decryptPassword,
  validateEmail,
} = require("../middleware");

const userRouter = Router()

// login with username and password
userRouter.post("/login", decryptPassword, loginUser);
// login with a jwt token
userRouter.get("/user", checkToken, loginUser);
userRouter.post("/user/create-user",validateEmail, hashPassword, addUser)
userRouter.get("/user/list-users", getAllUsers)
userRouter.post("/user/find-user", findUser)
userRouter.patch("/user", validateEmail, hashPassword, checkToken, updateUser);
userRouter.delete("/user/:username", checkToken, deleteUser);

module.exports = userRouter;