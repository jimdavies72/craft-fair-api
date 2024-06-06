const { Router } = require('express');
const { respondUnmatched } = require("./unmatchedControllers");

unmatchedRouter = Router()

unmatchedRouter.use("*", respondUnmatched);

module.exports = unmatchedRouter;