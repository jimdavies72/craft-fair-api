const jwt = require("jsonwebtoken");
const User = require("./userModel");

exports.addUser = async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      pw: req.body.pw,
      userType: req.body.userType
    })
    res.status(201).json({ msg: "New user added", data: newUser.username });
  } catch (error) {
    res.status(400).json({msg: "Error: ", data: error.name})
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.findAll();
    res.status(200).json({ msg: "Users found", data: allUsers });
    
  } catch (error) {
    res.status(404).json({ msg: "No users found" });
  }
}

exports.findUser = async (req, res) => {
  try {
    const foundUser = await User.findOne({
      where: {[req.body.filterKey]: req.body.filterVal}
    });
    if (foundUser) {
      res.status(200).json({msg: "User found", data: foundUser})
    } else {
      res.status(404).json({msg: `User: ${req.body.filterVal} not found`})
    }
  } catch (error) {
    res.status(500).json({error: error})
  }
}