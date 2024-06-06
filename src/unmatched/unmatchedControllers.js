exports.respondUnmatched = async (req, res) => {
  resObj = {
    error: {
      name: "Error",
      status: 404,
      message: "Invalid Request",
      statusCode: 404,
      stack: `/${req.hostname}${req.baseUrl}`,
    },
    msg: "oops! something went wrong, the page does not exist!",
  }
  res.status(404).send(resObj)
}