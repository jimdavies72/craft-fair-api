const User = require('../user/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('email-validator');
const saltRounds = parseInt(process.env.SALT_ROUNDS)

exports.hashPassword = async(req, res, next) => {
  try{
    if (req.body.pw) {
      req.body.pw = await bcrypt.hash(req.body.pw, saltRounds);
      next();
    } else {
      res.status(401).send({ message: "no password to hash" });
    }

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.decryptPassword = async (req, res, next) => {
  try {
    req.user= await User.findOne({where: {username: req.body.username}});
    if (req.user && await bcrypt.compare(req.body.pw, req.user.pw)){
      next()
      } else {
      res.status(401).send({message: 'Incorrect credentials supplied'})
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  } 
}

exports.checkToken = async (req, res, next) => {
  try {
    const token = await jwt.verify(req.header("Authorization").
    replace("Bearer ", ""), process.env.SECRET)
    req.user = await User.findByPk(token._id)
    
    if (req.user) {
      next()
    } else {
      res.status(401).send({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  } 
};

exports.validateEmail = (req, res, next) => {
  try {
    if (validator.validate(req.body.username)) {
      next();
    } else {
      res.status(401).send({ message: 'Email address is in incorrect format' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};