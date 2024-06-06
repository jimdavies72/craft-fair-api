const { requestFilter } = require("../utils");
const supertest = require('supertest');
const { createServer } = require('../utils/createServer')

app = createServer();

jest.mock("./testModel", () => {
  const SequelizeMock = require("sequelize-mock");
  const dbMock = new SequelizeMock();
  const TestMock = dbMock.define("test");
  TestMock.create = TestMock.upsert;
  if(TestMock.$queryInterface.$useHandler){
    TestMock.$queryInterface.$useHandler((query, queryOptions) => {
      switch(query){
        case "findAll":
          return {
            count: 2,
            rows: [
              TestMock.build({ id: 1, message: "successful" }),
              TestMock.build({ id: 2, message: "successful2" }),
            ],
          };
        case "findOne":
          if (queryOptions[0].where.message === "successful") {
            return TestMock.build({ id: 1, message: "successful" })
          } else if (queryOptions[0].where.message === null) {
            throw new Error("test string not found");
          }else {
            return null;
          }
        case "upsert":
          // upsert is a workaround for sequelize-mock not handling create method
          if (queryOptions[0].message) {
            return TestMock.build(
              { id: 1, message: queryOptions[0].message },
              (isNewRecord = true))        
          } else {
            throw new Error("NotNull Violation: Test.message cannot be null");
          }  
      };
    });
  };  
  return TestMock;
});

const postRequest = (inputVal) => {
  return {
    message: inputVal,
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  supertest.clearAllMocks;
});

describe('testControllers', () => {
  describe('given the user is finding a test string', () => {
    describe('when the test string is retrieved then', () => {
      it('should return a 200 and a successful message', async () => {
        //arrange
        filterVal = "successful";
        const req = requestFilter("message", filterVal);

        //act
        await supertest(app)
          .put("/test")
          .send(req)

        //assert
          .expect(200)
          .expect((res) => {
            expect(res.body.test.message).toBe(filterVal);
          });
      });
    });

    describe('when the test string is not retrieved then', () => {
      it('should return a 404 and an unsuccessful message', async () => {
        //arrange
        const req = requestFilter("message", "unsuccessful");

        //act
        await supertest(app)
          .put("/test")
          .send(req)
        
        //assert
          .expect(404, { test: "test string not found" });
      })
    });

    describe("when the test string is not valid then", () => {
      it("should return a 500 and an error message", async () => {
        //arrange
        const req = requestFilter("message", null);

        //act
        await supertest(app)
          .put("/test")
          .send(req)
        
        //assert
          .expect(500, { error: "test string not found" });
      });
    });  
  });  

  describe('given the user is creating a test string', () => {
    describe("when the test string is created then", () => {
      it('should return a 201 and a successful message', async () => {
        //arrange
        const req = postRequest("successful");
        
        //act
        await supertest(app)
          .post("/test")
          .send(req)
          
        //assert
          .expect(201)
          .expect((res) => {
            expect(res.body.test.message).toBe(req.message);
          });
      });  
    });
    describe("when the test string is not created then", () => {
      it('should return a 500 and an error message', async () => { 
        //arrange
        const req = null

        //act
        await supertest(app)
          .post("/test")
          .send(req)

        //assert
          .expect(500)
          .expect({ error: "NotNull Violation: Test.message cannot be null" });
      });
    });  
  });
});
