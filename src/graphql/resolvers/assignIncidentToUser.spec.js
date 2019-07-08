const { mockRepo, when } = require('../../helper');
const { ObjectId } = require('mongodb');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { assignIncident } = require('./assignIncidentToUser');

describe('/src/graphql/resolvers/assignIncidentToUser.js', () => {
  const userId = '5d1fef9f028e158d23d9ead0';
  const incidentId = '5d1fef9f028e999d23d9ead0';
  const sampleUser = { _id: userId };
  const sampleIncident = { _id: incidentId };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(assignIncident).toHaveProperty('type', 'Mutation');
  });

  it('should throw exception input userId is not valid', () => {
    return assignIncident(null, { data: { userId: 'abc', incidentId } })
      .then(() => Promise.resolve(new Error('assignIncident does not check userId format')))
      .catch((e) => {
        expect(e).toHaveProperty('message', 'User id abc is not valid');
      });

  });

  it('should throw exception input incidentId is not valid', () => {
    return assignIncident(null, { data: { userId, incidentId: 'abc' } })
      .then(() => Promise.resolve(new Error('assignIncident does not check incidentId format')))
      .catch((e) => {
        expect(e).toHaveProperty('message', 'Incident id abc is not valid');
      });
  });

  it('should throw exception if user not found', () => {
    when(mockUser.findById).calledWith(ObjectId(userId)).mockResolvedValue(null);

    return assignIncident(null, { data: { userId, incidentId } })
      .then(() => Promise.resolve(new Error('assignIncident does not check user exist')))
      .catch((e) => {
        expect(e).toHaveProperty('message', `User with Id ${userId} doesn't exist`);
      });
  });

  it('should throw exception if incident not found', () => {
    when(mockUser.findById).calledWith(ObjectId(userId)).mockResolvedValue(sampleUser);
    when(mockIncident.findById).calledWith(ObjectId(incidentId)).mockResolvedValue(null);

    return assignIncident(null, { data: { userId, incidentId } })
      .then(() => Promise.resolve(new Error('assignIncident does not check incident exist')))
      .catch((e) => {
        expect(e).toHaveProperty('message', `Incident with Id ${incidentId} doesn't exist`);
      });
  });

  it('should assign incident to valid user', () => {
    const expectReturn = { a: 1, b: 2 };
    when(mockUser.findById).calledWith(ObjectId(userId)).mockResolvedValue(sampleUser);
    when(mockIncident.findById).calledWith(ObjectId(incidentId)).mockResolvedValue(sampleIncident);

    mockIncident.findOneAndUpdate.mockResolvedValue(expectReturn);

    return assignIncident(null, { data: { userId, incidentId } })
      .then((ret) => {
        expect(ret).toMatchObject(expectReturn);
        expect(mockIncident.findOneAndUpdate).toBeCalledWith(
          { _id: ObjectId(incidentId) },
          { assignee: userId },
          { new: true }
        );
      });
  });
});
