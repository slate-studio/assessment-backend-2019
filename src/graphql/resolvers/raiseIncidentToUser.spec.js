const { mockRepo, when } = require('../../helper');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { INCIDENT_AVAILABEL_VALUES, INCIDENT_DEFAULT } = require('../../const');
const { raiseIncidentToEngineerUser } = require('./raiseIncidentToUser');

describe('/src/graphql/resolvers/raiseIncidentToUser.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(raiseIncidentToEngineerUser).toHaveProperty('type', 'Mutation');
  });

  it('should throw exception if can not find user', () => {
    const userId = '123';
    return raiseIncidentToEngineerUser(null, { assignee: userId })
      .then(() => Promise.reject(new Error('raiseIncidentToEngineerUser does not handle when userId not found')))
      .catch((e) => {
        expect(e).toHaveProperty('message', 'User 123 is not found');
      });
  });

  it('should throw exception if can not find user', () => {
    const userId = '123';
    const rawUser = { role: 'User' };
    when(mockUser.findById).calledWith(userId).mockResolvedValue(rawUser);

    return raiseIncidentToEngineerUser(null, { assignee: userId })
      .then(() => Promise.reject(new Error('raiseIncidentToEngineerUser does not handle when userId is not engineer')))
      .catch((e) => {
        expect(e).toHaveProperty('message', 'User 123 is not engineer');
      });
  });

  it('should validate incident status', () => {
    const userId = '123';
    const rawUser = { role: 'Engineer' };
    when(mockUser.findById).calledWith(userId).mockResolvedValue(rawUser);

    return raiseIncidentToEngineerUser(null, {
      assignee: userId,
      status: 'my status'
    })
      .then(() => Promise.reject(new Error('raiseIncidentToEngineerUser does not validate status')))
      .catch((e) => {
        expect(e).toHaveProperty('message', 'Status my status is invalid');
      });
  });

  it('should raise incident', async () => {
    const userId = '123';
    const inpIncident = {
      title: 'my title',
      description: 'my desc',
      assignee: userId,
      status: INCIDENT_AVAILABEL_VALUES[0]
    };
    const rawUser = { role: 'Engineer' };
    const expectOutput = { a: 1, b: 2 };

    when(mockUser.findById).calledWith(userId).mockResolvedValue(rawUser);
    mockIncident.create.mockResolvedValue(expectOutput);

    const newIncident = await raiseIncidentToEngineerUser(null, inpIncident);
    expect(newIncident).toMatchObject(expectOutput);
    expect(mockIncident.create).toBeCalledWith(inpIncident);
  });

  it('should raise incident with default status if not provide', async () => {
    const userId = '123';
    const inpIncident = {
      title: 'my title',
      description: 'my desc',
      assignee: userId
    };
    const rawUser = { role: 'Engineer' };
    const expectOutput = { a: 1, b: 2 };

    when(mockUser.findById).calledWith(userId).mockResolvedValue(rawUser);
    mockIncident.create.mockResolvedValue(expectOutput);

    const newIncident = await raiseIncidentToEngineerUser(null, inpIncident);
    expect(newIncident).toMatchObject(expectOutput);
    expect(mockIncident.create).toBeCalledWith({
      ...inpIncident,
      status: INCIDENT_DEFAULT
    });
  });
});
