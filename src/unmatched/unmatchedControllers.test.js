const supertest = require("supertest");
const { createServer } = require("../utils/createServer");

app = createServer();

describe("given the user is making a request", () => {
  describe("when the request is made and unmatched then", () => {
    it("should return a 404 and an error message", async () => {
      //arrange
      const unmatchedRoute = "/unmatched";
      //act
      await supertest(app)
        .get(unmatchedRoute)
      
      //assert
        .expect(404)
        .expect((res) => {
          expect(res.body.msg).toBe("oops! something went wrong, the page does not exist!");
        });

    })    
  })
})  