const Test = require("./testModel")

exports.addTestString = async (req, res) => {
  try {
    const testString = await Test.create(req.body)
    res.status(200).send({ test: testString })
  } catch (error) {
    console.log(error)
    res.status(400).send({ error: error.message })
  }
}

exports.getTestString = async (req, res) => {
  try {
    const testString = await Test.findOne({ where: { [req.body.filterKey]: req.body.filterVal }})
    if(testString){
      res.status(200).send({ success: testString })
    } else {
      res.status(404).send({ message: 'test string not found' });
    }
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}