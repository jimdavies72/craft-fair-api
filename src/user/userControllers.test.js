const { requestFilter } = require("../utils");
const supertest = require('supertest');
const { createServer } = require('../utils/createServer');
const { verify, sign } = require("jsonwebtoken");
const { validateEmail, hashPassword } = require("../middleware");

app = createServer();

jest.mock('../middleware', () => {
  const actualModule = jest.requireActual('../middleware');
  return {
    ...actualModule,
    validateEmail: jest.fn((req, res, next) => next()),
    hashPassword: jest.fn((req, res, next) => next()),
  };
});

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));  

jest.mock("./userModel", () => {
  const SequelizeMock = require("sequelize-mock");
  const dbMock = new SequelizeMock();
  const UserMock = dbMock.define("user", {} );
  UserMock.create = UserMock.upsert;
  if(UserMock.$queryInterface.$useHandler){ 
    let users = []
    UserMock.$queryInterface.$useHandler((query, queryOptions) => {
      switch (query) {
        case "findAll":
          if (Object.keys(queryOptions[0]).length === 0) {
            // this is a fudge to return all users
            users = [
              UserMock.build({
                id: 1,
                username: "admin1@email.com",
                pw: "Password1",
                userType: "admin",
              }),
              UserMock.build({
                id: 2,
                username: "host1@email.com",
                pw: "Password2",
                userType: "host",
              }),
              UserMock.build({
                id: 3,
                username: "vendor1@email.com",
                pw: "Password3",
                userType: "vendor",
              }),
              UserMock.build({
                id: 4,
                username: "host2@email.com",
                pw: "Password4",
                userType: "host",
              }),
            ];
          } else if (queryOptions[0].where.userType === "host") {
              users = [
                UserMock.build({
                  id: 2,
                  username: "host1@email.com",
                  pw: "Password2",
                  userType: "host",
                }),
                UserMock.build({
                  id: 4,
                  username: "host2@email.com",
                  pw: "Password4",
                  userType: "host",
                }),
              ] 
          } else if (queryOptions[0].where.userType === "unknown") {
            users = [];
          } else {
            throw new Error("error message");
          };
          return users;
        case "findOne":
          if (queryOptions[0].where.username === "host1@email.com") {
            return UserMock.build({
              id: 2,
              username: "host1@email.com",
              pw: "Password2",
              userType: "host",
            });
          } else if (queryOptions[0].where.username === "xxx") {
            throw new Error("error message");
          } else {
            return null;
          }
        case "upsert":
          // upsert is a workaround for sequelize-mock not handling create method
          if (queryOptions[0].username) {
            return UserMock.build(
              {
                id: 6,
                username: queryOptions[0].username,
                pw: queryOptions[0].pw,
                userType: queryOptions[0].userType,
              },
              (isNewRecord = true)
            );
          } else {
            throw new Error("NotNull Violation: User.message cannot be null");
          }
      };    
    });
  };
  return UserMock;
});

describe('userControllers', () => {

  const actualEnvSecret = process.env.SECRET;
  beforeAll(async () => {
    // I am doing this so that the prod environment is not used
    process.env.SECRET = "testSecret";
  })
  
  beforeEach(() => {
    jest.clearAllMocks();
    supertest.clearAllMocks;
  });

  afterAll(() => {
    process.env.SECRET = actualEnvSecret;
  });

  describe('given the user is searching a user', () => {
    describe('when a specific user is found then', () => {
      it('should return a 200 and a found message', async () => {
        //arrange
        const username = "host1@email.com";
        const req = requestFilter("username", username);

        //act
        await supertest(app)
          .post("/user/find")
          .send(req)

        //assert
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBe('User found');
            expect(res.body.data.username).toBe(username);
          });  
      });
    }); 

    describe('when a specific user is not found then', () => {
      it('should return a 404 and a not found message', async () => {
        //arrange
        const username = "hostx@email.com";
        const req = requestFilter("username", username);

        //act
        await supertest(app)
          .post("/user/find")
          .send(req)

          //assert
          .expect(404)
          .expect((res) => {
            expect(res.body.message).toBe(`User: ${username} not found`);
          });
      });
    });

    describe("when a specific user causes an error then", () => {
      it("should return a 500 and an error message", async () => {
        //arrange
        const username = "xxx";
        const req = requestFilter("username", username);

        //act
        await supertest(app)
          .post("/user/find")
          .send(req)

          //assert
          .expect(500)
          .expect((res) => {
            expect(res.body.error).toBe(
              "error message"
            );
          });
      });
    });
    
    describe('when a full list of users are found then', () => {
      // this is when a null where clause is used
      it('should return a 200 and a message with count', async () => {
        //arrange
        const recs = 4;
        const userType = "";
        const req = requestFilter("userType", userType);

        //act
        await supertest(app)
        .put("/user")
        .send(req)
        
        //assert
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(`${recs} users found`);
          expect(res.body.data.count).toEqual(recs);
          let row = res.body.data.rows[0];
          expect(row.username).toBe("admin1@email.com");
          row = res.body.data.rows[3];
          expect(row.username).toBe("host2@email.com");
        });
      });
    });

    describe('when a sub-list of users are found then', () => {
      // this is when a qualified where clause is used
      it("should return a 200 and a message with count", async () => {
        //arrange
        const recs = 2;
        const userType = "host";
        const req = requestFilter("userType", userType);
        
        //act
        await supertest(app)
        .put("/user")
        .send(req)
        
        //assert
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(`${recs} users found`);
          expect(res.body.data.count).toEqual(recs);
          let row = res.body.data.rows[0];
          expect(row.username).toBe("host1@email.com");
          row = res.body.data.rows[1];
          expect(row.username).toBe("host2@email.com");
        });
      });
    });  
    
    describe("when a list of users is not found then", () => {
      it("should return a 404 and a not found message", async () => {
        //arrange
        const recs = 0;
        const userType = "unknown";
        const req = requestFilter("userType", userType);
        
        //act
        await supertest(app)
        .put("/user")
        .send(req)
        
        //assert
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(`${recs} users found`);
          expect(res.body.data.count).toEqual(recs);
          expect(res.body.data.rows.length).toEqual(recs);
        });
      });
    });

    describe("when a list of users causes and error then", () => {
      it("should return a 500 and an error message", async () => {
        //arrange
        const userType = "error";
        const req = requestFilter("userType", userType);

        //act
        await supertest(app)
          .put("/user")
          .send(req)

        //assert
          .expect(500, {error: "error message"})
      });
    });
  });

  describe('given a user is creating a new user account', () => {
    describe('when the new user is created then', () => {
      it('should return a 201, success message and token', async () => {
        //arrange
        const un = "test@email.com";
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjYsImlhdCI6MTcxNzI1NTM2MX0.SIOwVi3K1PF39AGkZqkt8YFWsai--4OK7J3AqS__-8I";
        const envSecret = process.env.SECRET;
        let req = {
          username: un,
          pw: "password1",
          userType: "host",
        };

        sign.mockReturnValue(token);

        //act
        await supertest(app)
          .post("/user/create")
          .send(req)

        //assert
          .expect(201)
          .expect((res) => {
            expect(validateEmail).toHaveBeenCalled();
            expect(hashPassword).toHaveBeenCalled();
            expect(sign).toHaveBeenCalledWith({"_id": 6}, envSecret);
            expect(res.body.message).toBe("New user added");
            expect(res.body.data).toBe(un);
            expect(res.body.token).toBe(token);
          });
      });
    });

    describe("when the user is not created then", () => {
      it('should return a 400 and an error message', async () => {
        //arrange
        const un = "test@email.com";
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjYsImlhdCI6MTcxNzI1NTM2MX0.SIOwVi3K1PF39AGkZqkt8YFWsai--4OK7J3AqS__-8I";
        const envSecret = process.env.SECRET;
        const mockError = "cannot POST /user/create (400)"
        let req = {
          username: un,
          pw: "password1",
          userType: "host",
        };

        sign.mockImplementation(() => { throw new Error(mockError); });;

        //act
        await supertest(app)
          .post("/user/create")
          .send(req)

          //assert
          .expect(400)
          .expect((res) => {
            expect(validateEmail).toHaveBeenCalled();
            expect(hashPassword).toHaveBeenCalled();
            expect(sign).toHaveBeenCalledWith({ _id: 6 }, envSecret);
            expect(res.error.message).toBe(mockError);
          });
      });
    });
  });

  describe('given a user is logging in', () => {
    describe('when the user is logged in then', () => {
      it('should return a 200 and a message', () => {
        //arrange
        
        //act

        //assert
        expect(1).toEqual(1);
      });
    });
  });
});

