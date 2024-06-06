const jwt = require('jsonwebtoken');
const User = require('./userModel');
const { addS } = require('../utils');

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body)

    const token = await jwt.sign({ _id: newUser.id }, process.env.SECRET);
    res.status(201).send({ message: 'New user added', data: newUser.username, token})
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    let whereClause = {}
    let resStatus = 404

    if (req.body.filterKey && req.body.filterVal) {
      whereClause =  { where: { [req.body.filterKey]: req.body.filterVal } } ;
    } 
  
    const users = await User.findAll(whereClause);

    if (users) {
      if (users.length > 0) {
        resStatus = 200;
      }
      res.status(resStatus).send({
        message: `${users.length} user${addS(users.length)} found`,
        data: {
          count: users.length,
          rows: users,
        },
      });
    }
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
};

exports.findUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { [req.body.filterKey]: req.body.filterVal }});
    if (user) {
      res.status(200).send({message: 'User found', data: user});
    } 
    else {
      res
        .status(404)
        .send({ message: `User: ${req.body.filterVal} not found` });
    }
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (await User.update(req.body, {
      where: {username: req.user.username},})){
      res.status(200).send({ message: 'User details successfully updated' });
    } else {
      res.status(304).send({ message: 'User details were not updated' })
    };
  } catch (error) {
    res.status(500).send({ error: error.message })
  };
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.username == req.params.username) {
      if (await User.destroy({ where: { username: req.params.username},})) {
        res.status(200).send({ message: `${req.params.username} has been deleted` });
      } 
    } else {
      res.status(401).send({message: 'You are not authorized to delete this user'})
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    res.status(200).send({ user: req.user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};