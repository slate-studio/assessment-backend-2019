const gql = require('graphql-tag');
const _ = require('lodash');
const User = require('../src/models/User');
const { createTestClient } = require('apollo-server-testing');
const { randomString } = require('../src/helper');

const RAISE_INCIDENT_MUTATE = gql`
mutation test($title: String!, $assignee: String!, $description: String, $status: String  ) {
    raiseIncidentToEngineerUser(title: $title, assignee: $assignee, description: $description, status: $status) {
      _id, title, assignee, description, status
  }
}
`;

const ASSIGN_INCIDENT_MUTATE = gql`
mutation test($data: AssignIncidentRequest!) {
  assignIncident(data: $data) {
      _id, title, assignee, description, status
  }
}
`;

describe('/test/app.spec.js', () => {
  let apolloServer;

  beforeAll(async () => {
    const serverInstance = require('../src/server').serverInstance;
    apolloServer = await serverInstance;
  });

  describe('Incident', () => {
    describe('Raise incident to engineer user', () => {
      let engineerUser;
      const sampleIncident = {
        title: 'my title',
        description: 'my desc',
        assignee: '',
        status: 'Resolved'
      };
      beforeAll(async () => {
        engineerUser = await User.findOne({ role: 'Engineer' });
        sampleIncident.assignee = engineerUser._id.toString();
      });

      it('when provide valid information then create new incident', async () => {
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });

        expect(actual.data).toMatchObject({
          raiseIncidentToEngineerUser:
          {
            _id: expect.any(String),
            title: sampleIncident.title,
            assignee: sampleIncident.assignee,
            description: sampleIncident.description,
            status: sampleIncident.status
          }
        });
      });

      it('when not provide status then use default status', async () => {
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: _.omit(sampleIncident, ['status'])
        });

        expect(actual.data).toMatchObject({
          raiseIncidentToEngineerUser:
          {
            _id: expect.any(String),
            title: sampleIncident.title,
            assignee: sampleIncident.assignee,
            description: sampleIncident.description,
            status: 'Created'
          }
        });
      });
    });

    describe('assignIncident', () => {
      let user1;
      let user2;
      const sampleIncident = {
        title: 'my title',
        description: 'my desc',
        assignee: '',
        status: 'Resolved'
      };

      beforeAll(async () => {
        // create 2 users
        user1 = await new User({
          name: randomString(),
          email: randomString() + '@example.com',
          role: 'Engineer'
        }).save();

        user2 = await new User({
          name: randomString(),
          email: randomString() + '@example.com',
          role: 'Supervisor'
        }).save();

        // create an incident
        sampleIncident.assignee = user1._id.toString();
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });
        sampleIncident._id = actual.data.raiseIncidentToEngineerUser._id;
      });

      it('when giving wrong userId, it should throw exception', async () => {
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: ASSIGN_INCIDENT_MUTATE,
          variables: {
            data: {
              userId: '134abc',
              incidentId: sampleIncident._id
            }
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: 'User id 134abc is not valid'
        });
      });

      it('when giving wrong incidentId, it should throw exception', async () => {
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: ASSIGN_INCIDENT_MUTATE,
          variables: {
            data: {
              userId: sampleIncident.assignee,
              incidentId: 'zyz'
            }
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: 'Incident id zyz is not valid'
        });
      });

      it('when giving not exist user it should throw exception', async () => {
        const inputUserId = '5d1fef9f128e158d23d9ead1';
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: ASSIGN_INCIDENT_MUTATE,
          variables: {
            data: {
              userId: '5d1fef9f128e158d23d9ead1',
              incidentId: sampleIncident._id
            }
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: `User with Id ${inputUserId} doesn't exist`
        });
      });

      it('when giving not exist incident it should throw exception', async () => {
        const inputId = '5d1fef9f128e158d23d9ead1';
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: ASSIGN_INCIDENT_MUTATE,
          variables: {
            data: {
              userId: user2._id.toString(),
              incidentId: inputId
            }
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: `Incident with Id ${inputId} doesn't exist`
        });
      });

      it('when giving valid userId and incidentId then assign to that user', async () => {
        const { mutate } = createTestClient(apolloServer);

        const actual = await mutate({
          mutation: ASSIGN_INCIDENT_MUTATE,
          variables: {
            data: {
              userId: user2._id.toString(),
              incidentId: sampleIncident._id
            }
          }
        });
        expect(actual.data).toMatchObject({
          assignIncident: {
            _id: sampleIncident._id,
            "assignee": user2._id.toString(),
            "description": sampleIncident.description,
            "status": sampleIncident.status,
            "title": sampleIncident.title
          }
        });
      });

    });
  });
});
