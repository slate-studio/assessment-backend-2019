const { mockRepo } = require('../../helper');
const mockUser = mockRepo();
const mockIncident = mockRepo();

jest.mock('../../models', () => ({
  User: mockUser, Incident: mockIncident
}));
const { incidents } = require('./incidents');

describe('/src/graphql/resolvers/raiseIncidentToUser.js', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockIncident.sort.mockReturnValue(mockIncident);
    mockIncident.skip.mockReturnValue(mockIncident);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should define resolver type', () => {
    expect(incidents).toHaveProperty('type', 'Query');
  });

  it('should fetch all incidents if dont have any input', async () => {
    const expectReceive = [{ a: 1 }, { b: 2 }];
    mockIncident.find.mockResolvedValue(expectReceive);

    const ret = await incidents(null);
    expect(ret).toStrictEqual(expectReceive);
    expect(mockIncident.find).toBeCalledTimes(1);
    expect(mockIncident.find).toBeCalledWith();
  });

  describe('filter', () => {
    it('should support for filter', async () => {
      const rawQuery = { a: 1, b: 2 };

      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { filter: rawQuery });
      expect(mockIncident.find).toHaveBeenCalledWith(rawQuery);
    });

    it('should fetch all if not provide filter', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { a: 1 });
      expect(mockIncident.find).toHaveBeenCalledWith({});
    });
  });

  describe('sort', () => {
    it('should support for sorting', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { sort: { field: 'assignee', order: -1 } });
      expect(mockIncident.sort).toHaveBeenCalledWith({ assignee: -1 });
    });

    it('should sort asc by default', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { sort: { field: 'assignee' } });
      expect(mockIncident.sort).toHaveBeenCalledWith({ assignee: 1 });
    });

    it('should sort by createdAt field by default', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { a: 1 });
      expect(mockIncident.sort).toHaveBeenCalledWith({ createdAt: 1 });
    });
  });

  describe('pagination', () => {
    it('should support pagination by default', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { a: 1 });
      expect(mockIncident.skip).toHaveBeenCalledWith((1 - 1) * 100);
      expect(mockIncident.limit).toHaveBeenCalledWith(100);
    });

    it('should support use default page 1 for pageNo', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { pagination: { pageSize: 5 } });
      expect(mockIncident.skip).toHaveBeenCalledWith((1 - 1) * 5);
      expect(mockIncident.limit).toHaveBeenCalledWith(5);
    });

    it('should support use default page size 100', async () => {
      mockIncident.find.mockReturnValue(mockIncident);
      await incidents(null, { pagination: { pageNo: 5 } });
      expect(mockIncident.skip).toHaveBeenCalledWith((5 - 1) * 100);
      expect(mockIncident.limit).toHaveBeenCalledWith(100);
    });
  });
});
