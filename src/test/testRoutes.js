const { Router } = require('express');
const { 
  createTest,
  getTest,
} = require('./testControllers')

testRouter = Router();

testRouter.post('/test', createTest);
testRouter.put('/test', getTest);

module.exports = testRouter;