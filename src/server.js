const { createServer } = require('../src/utils/createServer');
const connection = require('./db/connection');
const Test = require('./test/testModel');
const User = require('./user/userModel');
const port = process.env.PORT || 5001;

const app = createServer();
// goto ./src/utils/createServer.js to add new routes

app.listen(port, () => {
  connection.authenticate();
  Test.sync({ alter: true });
  User.sync({ alter: true });
  console.log(`App is listening on port ${port}`);
});

