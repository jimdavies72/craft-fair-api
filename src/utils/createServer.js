require("dotenv").config();
const express = require("express");
const cors = require("cors");
const testRouter = require("../test/testRoutes");
const userRouter = require("../user/userRoutes");
const unmatchedRouter = require("../unmatched/unmatchedRoutes");

exports.createServer = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(testRouter);
  app.use(userRouter);
  //TODO other routes here

  //default for unmatched routes
  app.use(unmatchedRouter);

  return app;
};
