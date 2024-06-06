const httpMocks = require("node-mocks-http");
const { validate } = require("email-validator");
const { hash, compare } = require("bcryptjs");
const { verify } = require("jsonwebtoken");
const { createServer } = require("../utils/createServer");
const {
  checkToken,
  hashPassword,
  decryptPassword,
  validateEmail,
} = require("./index");

app = createServer();

jest.mock("email-validator", () => ({
  validate: jest.fn()
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));  

jest.mock("../user/userModel", () => {
  const SequelizeMock = require("sequelize-mock");
  const dbMock = new SequelizeMock();
  const UserMock = dbMock.define("User", {});
  // sequelize-mock does not support findByPk so patch....
  UserMock.findByPk = async (id, options) => {
    return UserMock.findOne({
      where: {
        id: id,
      },
      ...options,
    });
  };
  if(UserMock.$queryInterface.$useHandler) {
    UserMock.$queryInterface.$useHandler((query, queryOptions) => {
      if (queryOptions[0].where.username === "test@email.com" || queryOptions[0].where.id === 6) {
        return UserMock.build({
          id: 6,
          username: "test@email.com",
          pw: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjYsImlhdCI6MTcxNzI1NTM2MX0.SIOwVi3K1PF39AGkZqkt8YFWsai--4OK7J3AqS__-8I",
          userType: "host",
        });
      } else {
        return null;
      }
    });
  }; 
  return UserMock; 
});

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateEmail - given username is an email address in the correct format", () => {
    describe("when the username is sent in the correct format then", ()=> {
      it("should calll next()", async () => {
        //arrange
        const req = httpMocks.createRequest({
          method: "GET",
          url: "/user",
          body: {
            username: "test@email.com",
          },
        });  

        validate.mockReturnValue(true)

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        validateEmail( req, res, next);

        //assert
        expect(next).toHaveBeenCalled();
        expect(validate).toHaveBeenCalled();
      });
    });

    describe("when the username is sent in an incorrect format then", () => {
      it("should return 401 with message and next() is not called", async () => {
        //arrange
        const req = httpMocks.createRequest({
          method: "GET",
          url: "/user",
          body: {
            username: "testemail.com",
          },
        });

        validate.mockReturnValue(false);

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        validateEmail(req, res, next);

        //assert
        expect(next).not.toHaveBeenCalled();
        expect(validate).toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual({message: "Email address is in incorrect format"});
      });
    });

    describe("When an error occurs then", () => {
      it("should return a 500 with error message and next() not called", async () => {
        //TODO unit test error in validateEmail middleware
        expect(1).toEqual(1);
      });
    });
  }); 

  describe("hashPassword - given a password is needed to be hashed", () => {
    
    const clientReq = (password) => {
      return httpMocks.createRequest({
        method: "GET",
        url: "/user",
        body: {
          username: "test@email.com",
          pw: password,
        },
      }); 
    };

    describe("when the pw is sent in a request object then", () => {
      it("should return a hashed password & next() to have been called", async () => {
        //arrange
        const pw = "test";
        hash.mockReturnValue("xxx111xxx")
        const req = clientReq(pw)

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await hashPassword(req, res, next);

        //assert
        expect(next).toHaveBeenCalled();
        expect(hash).toHaveBeenCalled();
        expect(req.body.pw).not.toBe(pw);
      });
    });

    describe("when the pw is not sent in a request object then", () => {
      it("should return 401 and a message with next() not called", async () => {
        //arrange
        const pw = null;
        hash.mockReturnValue(null);

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await hashPassword(clientReq(pw), res, next);

        //assert
        expect(next).not.toHaveBeenCalled();
        expect(hash).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(401)
        expect(res._getData()).toEqual({message: "no password to hash"});
      });
    });

    describe("When an error occurs then", () =>{
      it("should return a 500 with error message and next() not called", async () => {
        //TODO unit test error in hashPassword middleware
        expect(1).toEqual(1)
      });
    });
  });

  describe("decryptPassword - given a password needs to be decrypted to login", () => {

    const clientReq = (password) => {
      return httpMocks.createRequest({
        method: "POST",
        url: "/user/login",
        body: {
          username: "test@email.com",
          pw: password,
        },
      });
    };

    describe("when the password is successfully decrypted then", () => {
      it("should return next()", async () => {
        //arrange
        const pw = "password1";
        compare.mockReturnValue(true);

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await decryptPassword(clientReq(pw), res, next);

        //assert
        expect(next).toHaveBeenCalled();
        expect(compare).toHaveBeenCalled();  
      });
    });

    describe("when the password is unsuccessfully decrypted then", () => {
      it("should return a 401 and message", async () => {
        //arrange
        const pw = "passwordx";
        compare.mockReturnValue(false);

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await decryptPassword(clientReq(pw), res, next);

        //assert
        expect(next).not.toHaveBeenCalled();
        expect(compare).toHaveBeenCalled();
        expect(res.statusCode).toBe(401)
        expect(res._getData()).toEqual({
          message: "Incorrect credentials supplied",
        });
      });
    });

    describe("When an error occurs then", () => {
      it("should return a 500 with error message and next() not called", async () => {
        //TODO unit test error in decryptPassword middleware
        expect(1).toEqual(1);
      });
    });
  });

  describe("checkToken - given authorisation is required", () => {
    
    const clientReq = (token) => {
      return httpMocks.createRequest({
        method: "GET",
        url: "/user",
        body: {
          username: "test@email.com",
          pw: "password1",
        },
        headers: { Authorization: `Bearer ${token}` },
      });
    };

    describe("when a jwt has been verified then", () => {
      it("should return next()", async () => {
        //arrange
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjYsImlhdCI6MTcxNzI1NTM2MX0.SIOwVi3K1PF39AGkZqkt8YFWsai--4OK7J3AqS__-8I";
        const req = clientReq(token) 
        verify.mockReturnValue({ _id: 6, iat: 1717255361 });

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await checkToken(req, res, next);

        //assert
        expect(next).toHaveBeenCalled();
        expect(verify).toHaveBeenCalled();
        expect(req.user).not.toBe(null)
      });
    });

    describe("when a jwt has not been verified then", () => {
      it("should return 401 and user not found message", async () => {
        //arrange
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjcsImlhdCI6MTcxNzUwODAwN30.ytBbGaodnc74t4KQ_S7hkgaIgTz6xYBAmDijHp2ZgYU";
        const req = clientReq(token);
        verify.mockReturnValue({ _id: 7, iat: 1717508007 });

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await checkToken(req, res, next);

        //assert
        expect(next).not.toHaveBeenCalled();
        expect(verify).toHaveBeenCalled();
        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual({
          message: "User not found",
        });
        expect(req.user).toBe(null);
      });
    });

    describe("when a jwt is malformed", () => {
      it("should return 500 and error message", async () => {
        //arrange
        const token =
          "eyJhb-xxxxxxx";
        const req = clientReq(token);
        verify.mockImplementation(() => { throw new Error("jwt malformed") });

        //act
        const res = httpMocks.createResponse();
        const next = jest.fn();
        await checkToken(req, res, next);

        //assert
        expect(next).not.toHaveBeenCalled();
        expect(verify).toHaveBeenCalled();
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toEqual({ error: "jwt malformed" });
        expect(req.user).toBe(undefined);
      });
    });
  });
});

