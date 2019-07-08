const mockMongoose = require('mongoose');

describe('/test/app.spec.js', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should log error, then throw exception if app crash', () => {
    const mockConnect = jest.spyOn(mockMongoose, 'connect');
    const spyConsoleErr = jest.spyOn(global.console, 'error');
    jest.mock('mongoose', () => mockMongoose);
    const myError = new Error('i dont like this error');

    mockConnect.mockRejectedValue(myError);
    spyConsoleErr.mockImplementation(() => { });

    const serverInstance = require('../src/server').serverInstance;
    return Promise.resolve(serverInstance)
      .catch((e) => {
        expect(e).toMatchObject(myError);
        expect(spyConsoleErr).toBeCalledWith(e);
      });
  });
});
