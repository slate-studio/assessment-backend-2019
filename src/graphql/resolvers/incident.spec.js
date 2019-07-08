const { mockRepo } = require('../../helper');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { incident } = require('./incident');

describe('/src/graphql/resolvers/incident.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(incident).toHaveProperty('type', 'Query');
  });
});
