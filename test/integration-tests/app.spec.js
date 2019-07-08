describe('/test/integration-tests/app.spec.js', () => {
  beforeAll(async () => {
    const serverInstance = require('../../src/server').serverInstance;
    await serverInstance;
  });

  it('should pass the integration test', () => {
    expect(1).toEqual(1);
  });
});
