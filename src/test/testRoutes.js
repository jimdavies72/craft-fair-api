const { Router } = require("express");
const { addTestString, getTestString } = require("./testControllers");

const { checkToken } = require("../middleware");

const testRouter = Router();

testRouter.post("/test", addTestString);
testRouter.patch("/test", getTestString);
testRouter.post("/test/auth", checkToken, addTestString)
testRouter.patch("/test/auth", checkToken, getTestString);

module.exports = testRouter