const { mockRepo } = require('../../helper');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { deleteIncident } = require('./deleteIncident');

describe('/src/graphql/resolvers/deleteIncident.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(deleteIncident).toHaveProperty('type', 'Mutation');
  });
});
