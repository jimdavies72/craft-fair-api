const { addS, createHashedPw, requestFilter } = require('../utils');

jest.mock("../utils", () => {
  const actualModule = jest.requireActual("../utils");
  return {
    ...actualModule,
    createHashedPw: jest.fn(() => {
      return "$2a$10$8nqPg/X9dgMDmUeUZSRwpOfxzguUDGzTWjlkaEo0PqhNoJRJyhUEK";
    }),
  };
});

describe("utility functions", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addS() - given a string may need to be single or plural ", () => {
    describe("when the number of something is > 1 then", () => {
      it("should return 's'", () => {
        //arrange
        let testWord = "user";
        const numberOfSomething = 2;

        //act
        const resultWord = `${testWord}${addS(numberOfSomething)}` 

        //assert
        expect(resultWord).toBe(`${testWord}s`)
      });
    });

    describe("when the number of something is = 0 then", () => {
      it("should return 's'", () => {
        //arrange
        let testWord = "user";
        const numberOfSomething = 0;

        //act
        const resultWord = `${testWord}${addS(numberOfSomething)}` 

        //assert
        expect(resultWord).toBe(`${testWord}s`)
      });
    });
    
    describe("when the number of something is < 0 then", () => {
      it("should return 's'", () => {
        //arrange
        let testWord = "user";
        const numberOfSomething = -1;

        //act
        const resultWord = `${testWord}${addS(numberOfSomething)}` 

        //assert
        expect(resultWord).toBe(`${testWord}s`)
      });
    });

    describe("when the number of something is = 1 then", () => {
      it("should return ''", () => {
        //arrange
        let testWord = "user";
        const numberOfSomething = 1;

        //act
        const resultWord = `${testWord}${addS(numberOfSomething)}` 

        //assert 
        expect(resultWord).toBe(`${testWord}`)
      });  
    })

    describe("when the value can convert to a number then", () => {
      it("should return 's'", () => {
        //arrange
        let testWord = "user";
        const string = "2";

        //act
        const resultWord = `${testWord}${addS(string)}`;

        //assert
        expect(resultWord).toBe(`${testWord}s`);
      });
    });

    describe("when a value cannot be a number then", () => {
      it("should throw an error", () => {
        try {
          //arrange
          const string = "t"; 
  
          //act
          const passString = () => {
            addS(string);        
          }
        } catch(error) {
          //assert
          expect(error.message).toBe("addS: val must be numeric");
        }
      });
    })
  });

  describe("requestFilter() - given a key and a value is needed as a request filter object then", () => {
    describe("when the request is made with a key and value then", () => {
      it("should return an object", () => {
        //arrange
        const key = 1
        const val = 1;
        
        //act
        const result = requestFilter(key, val);
        
        //assert
        expect(result).toEqual({filterKey: key, filterVal: val});
      });
    });

    describe("when the request is made without a key or value then", () => {
      it("should throw an error", () => {
        try {
          //arrange
          const key = "";
          const val = "test";
          
          //act
          const passString = () => {
            requestFilter(key, val);        
          }
          
        } catch(error) {
          //assert
          expect(error.message).toBe("requestFilter: valid key and val are required");
        }
      });
    }) 
  });

  describe("createHashedPw() - given a password then", () => {
    describe("when the password is hashed then", () => {
      it("should return a hashed password string", async () => {
        //arrange
        const pw = "password1";
        const mockHash =
          "$2a$10$8nqPg/X9dgMDmUeUZSRwpOfxzguUDGzTWjlkaEo0PqhNoJRJyhUEK"; 

        //act
        const result = await createHashedPw(pw)
         
        //assert
        expect(result).toBe(mockHash);
        expect(createHashedPw).toHaveBeenCalled();
      });
    });
  });

  // more functions go here
});

