const Test = require('./testModel')

exports.createTest = async (req, res) => {
  try {
    const testString = await Test.create(req.body)
    res.status(201).send({ test: testString }) 
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
};

exports.getTest = async (req, res) => {
  try {
    const testString = await Test.findOne({ where: { [req.body.filterKey]: req.body.filterVal }});
    if(testString){
      res.status(200).send({ test: testString });
    } else {
      res.status(404).send({ test: "test string not found" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}