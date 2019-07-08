const { mockRepo } = require('../../helper');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { resolveIncident } = require('./resolveIncident');

describe('/src/graphql/resolvers/resolveIncident.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(resolveIncident).toHaveProperty('type', 'Mutation');
  });
});
