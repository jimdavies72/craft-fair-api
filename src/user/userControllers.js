const jwt = require("jsonwebtoken");
const User = require("./userModel");

exports.addUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    const token = await jwt.sign({ _id: newUser.id }, process.env.SECRET);
    res.status(201).send({ msg: "New user added", data: newUser.username, token });
  } catch (error) {
    res.status(400).send({ msg: "Error: ", data: error.name });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.findAll();
    res.status(200).send({ msg: "Users found", data: allUsers });
  } catch (error) {
    res.status(404).send({ msg: "No users found" });
  }
};

exports.findUser = async (req, res) => {
  try {
    const foundUser = await User.findOne({
      where: { [req.body.filterKey]: req.body.filterVal },
    });
    if (foundUser) {
      res.status(200).send({ msg: "User found", data: foundUser });
    } else {
      res.status(404).send({ msg: `User: ${req.body.filterVal} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    let result;
    if (req.user.username === req.params.username) {
      result = await User.destroy({
        where: { username: req.params.username },
      });
    }
    if (result && result > 0) {
      res
      .status(200)
      .json({ msg: `User: ${req.params.username} has been deleted` });
    } else {

      throw new Error(`${req.params.username} not found`);
    }
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    res.status(200).send({ user: req.user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {

  try {
    const result = await User.update(req.body, {
      where: { username: req.user.username },
    });
    if (result[0] > 0 ) {
      res.status(200).send({ msg: "User details successfully updated" });
    } else {
      throw new Error("User details were not updated")
    }
  } catch (error) {
    console.log(error)
    res.status(404).send({ error: error.message });
  }
}
