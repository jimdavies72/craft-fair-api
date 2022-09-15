const { Router } = require("express");
const { 
  addUser, 
  getAllUsers, 
  findUser 
} = require("./userControllers");

//const {} = require("../middleware")

const userRouter = Router()

userRouter.post("/user/create-user", addUser)
userRouter.get("/user/list-users", getAllUsers)
userRouter.post("/user/find-user", findUser)

module.exports = userRouter;