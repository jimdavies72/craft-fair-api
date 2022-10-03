require("dotenv").config();
const connection = require("./db/connection");
const express = require("express");
const cors = require("cors");
const Test = require('./test/testModel')
const testRouter = require('./test/testRoutes')
const User = require("./user/userModel");
const userRouter = require("./user/userRoutes");
const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors())
app.use(testRouter)
app.use(userRouter)

// this is default in case of unmatched routes
app.use((req, res) => {
      res.json({
        error: {
          'name':'Error',
          'status':404,
          'message':'Invalid Request',
          'statusCode':404,
          'stack':'http://localhost:5001/'
        },
         msg: 'Oops The page you requested no longer exists!'
      });
});

app.listen(port, () => {
  connection.authenticate();
  User.sync({ alter: true });
  Test.sync({ alter: true })
  console.log(`App is listening on port ${port}`)
});
