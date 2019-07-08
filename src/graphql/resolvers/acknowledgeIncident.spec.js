const { mockRepo } = require('../../helper');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { acknowledgeIncident } = require('./acknowledgeIncident');

describe('/src/graphql/resolvers/acknowledgeIncident.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(acknowledgeIncident).toHaveProperty('type', 'Mutation');
  });
});
