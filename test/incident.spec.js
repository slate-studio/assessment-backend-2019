const gql = require('graphql-tag');
const _ = require('lodash');
const { ObjectId } = require('mongodb');
const { User, Incident } = require('../src/models');
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

const ACK_INCIDENT_MUTATE = gql`
mutation test($id: ID!) {
  acknowledgeIncident(id: $id) {
      _id, title, assignee, description, status
  }
}
`;

const RESOLVE_INCIDENT_MUTATE = gql`
mutation test($id: ID!) {
  resolveIncident(id: $id) {
      _id, title, assignee, description, status
  }
}
`;

const DELETE_INCIDENT_MUTATE = gql`
mutation test($id: ID!) {
  deleteIncident(id: $id) {
      _id, title, assignee, description, status
  }
}
`;

const INCIDENT_QUERY = gql`
query test($id: ID!) {
  incident(id: $id) {
      _id, title, assignee, description, status
  }
}
`;

const INCIDENTS_QUERY = gql`
query test {
  incidents {
      _id, title, assignee, description, status
  }
}
`;

describe('/test/app.spec.js', () => {
  let apolloServer;
  let mutate;

  beforeAll(async () => {
    const serverInstance = require('../src/server').serverInstance;
    apolloServer = await serverInstance;
    mutate = createTestClient(apolloServer).mutate;
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

        const actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });
        sampleIncident._id = actual.data.raiseIncidentToEngineerUser._id;
      });

      it('when giving wrong userId, it should throw exception', async () => {
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

    describe('acknowledgeIncident', () => {
      const sampleIncident = {
        title: randomString(),
        description: randomString(),
        assignee: '',
        status: 'Created'
      };

      const sampleIncident2 = {
        title: randomString(),
        description: randomString(),
        assignee: '',
        status: 'Resolved'
      };

      beforeAll(async () => {
        // create 2 incidents
        const engineerUser = await User.findOne({ role: 'Engineer' });
        sampleIncident.assignee = engineerUser._id.toString();
        sampleIncident2.assignee = engineerUser._id.toString();

        let actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });
        sampleIncident._id = actual.data.raiseIncidentToEngineerUser._id;

        actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident2
          }
        });
        sampleIncident2._id = actual.data.raiseIncidentToEngineerUser._id;

      });

      it('when giving wrong incidentId, it should throw exception', async () => {
        const actual = await mutate({
          mutation: ACK_INCIDENT_MUTATE,
          variables: {
            id: 'abc'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: 'Incident abc is not valid'
        });
      });

      it('when giving non exist incident id, it should throw exception', async () => {
        const actual = await mutate({
          mutation: ACK_INCIDENT_MUTATE,
          variables: {
            id: '7d1fef9f028e158d23d9ead0'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: `Incident 7d1fef9f028e158d23d9ead0 doesn't exist`
        });
      });

      it('when giving incident with status not Created, it should throw exception', async () => {
        const actual = await mutate({
          mutation: ACK_INCIDENT_MUTATE,
          variables: {
            id: sampleIncident2._id
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: `Incident ${sampleIncident2._id} can not be acknowledged`
        });
      });

      it('when ack incident then it should return new info', async () => {
        const actual = await mutate({
          mutation: ACK_INCIDENT_MUTATE,
          variables: {
            id: sampleIncident._id
          }
        });
        expect(actual.data).toMatchObject({
          acknowledgeIncident: {
            ...sampleIncident,
            status: 'Acknowledged'
          }
        });
      });

    });

    describe('resolveIncident', () => {
      const sampleIncident = {
        title: randomString(),
        description: randomString(),
        assignee: '',
        status: 'Created'
      };

      const sampleIncident2 = {
        title: randomString(),
        description: randomString(),
        assignee: '',
        status: 'Acknowledged'
      };

      beforeAll(async () => {
        // create 2 incidents
        const engineerUser = await User.findOne({ role: 'Engineer' });
        sampleIncident.assignee = engineerUser._id.toString();
        sampleIncident2.assignee = engineerUser._id.toString();

        let actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });
        sampleIncident._id = actual.data.raiseIncidentToEngineerUser._id;

        actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident2
          }
        });
        sampleIncident2._id = actual.data.raiseIncidentToEngineerUser._id;
      });

      it('when giving wrong incidentId, it should throw exception', async () => {
        const actual = await mutate({
          mutation: RESOLVE_INCIDENT_MUTATE,
          variables: {
            id: 'abc'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: 'Incident abc is not valid'
        });
      });

      it('when giving non exist incident id, it should throw exception', async () => {
        const actual = await mutate({
          mutation: RESOLVE_INCIDENT_MUTATE,
          variables: {
            id: '7d1fef9f028e158d23d9ead0'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: `Incident 7d1fef9f028e158d23d9ead0 doesn't exist`
        });
      });

      it('when ack incident with status Created then it should return new info', async () => {
        const actual = await mutate({
          mutation: RESOLVE_INCIDENT_MUTATE,
          variables: {
            id: sampleIncident._id
          }
        });
        expect(actual.data).toMatchObject({
          resolveIncident: {
            ...sampleIncident,
            status: 'Resolved'
          }
        });
      });

      it('when ack incident with status Acknowledged then it should return new info', async () => {
        const actual = await mutate({
          mutation: RESOLVE_INCIDENT_MUTATE,
          variables: {
            id: sampleIncident2._id
          }
        });
        expect(actual.data).toMatchObject({
          resolveIncident: {
            ...sampleIncident2,
            status: 'Resolved'
          }
        });
      });

    });

    describe('deleteIncident', () => {
      const sampleIncident = {
        title: randomString(),
        description: randomString(),
        assignee: '',
        status: 'Created'
      };

      beforeAll(async () => {
        // create 2 incidents
        const engineerUser = await User.findOne({ role: 'Engineer' });
        sampleIncident.assignee = engineerUser._id.toString();

        let actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });
        sampleIncident._id = actual.data.raiseIncidentToEngineerUser._id;
      });

      it('when giving wrong incidentId, it should throw exception', async () => {
        const actual = await mutate({
          mutation: DELETE_INCIDENT_MUTATE,
          variables: {
            id: 'abc'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: 'Incident abc is not valid'
        });
      });

      it('when giving non exist incident id, it should throw exception', async () => {
        const actual = await mutate({
          mutation: DELETE_INCIDENT_MUTATE,
          variables: {
            id: '7d1fef9f028e158d23d9ead0'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: `Incident 7d1fef9f028e158d23d9ead0 doesn't exist`
        });
      });

      it('when delete incident then it should return it old info', async () => {
        const actual = await mutate({
          mutation: DELETE_INCIDENT_MUTATE,
          variables: {
            id: sampleIncident._id
          }
        });
        expect(actual.data).toMatchObject({
          deleteIncident: {
            ...sampleIncident
          }
        });
        const oldIncident = await Incident.findOne({ _id: ObjectId(sampleIncident._id) });
        expect(oldIncident).toStrictEqual(null);
      });
    });

    describe('read incident', () => {
      const sampleIncident = {
        title: randomString(),
        description: randomString(),
        assignee: '',
        status: 'Created'
      };

      beforeAll(async () => {
        // create 2 incidents
        const engineerUser = await User.findOne({ role: 'Engineer' });
        sampleIncident.assignee = engineerUser._id.toString();

        let actual = await mutate({
          mutation: RAISE_INCIDENT_MUTATE,
          variables: {
            ...sampleIncident
          }
        });
        sampleIncident._id = actual.data.raiseIncidentToEngineerUser._id;
      });

      it('when giving wrong incidentId, it should throw exception', async () => {
        const actual = await mutate({
          mutation: INCIDENT_QUERY,
          variables: {
            id: 'abc'
          }
        });
        expect(actual.data).toStrictEqual(null);
        expect(actual.errors[0]).toMatchObject({
          message: 'Incident abc is not valid'
        });
      });

      it('when get incident then it should return incident info', async () => {
        const actual = await mutate({
          mutation: INCIDENT_QUERY,
          variables: {
            id: sampleIncident._id
          }
        });
        expect(actual.data).toMatchObject({
          incident: {
            ...sampleIncident
          }
        });
      });
    });

    describe('query list incidents', () => {
      it('when list of incidents then return me list data', async () => {
        const actual = await mutate({
          mutation: INCIDENTS_QUERY
        });
        expect(actual.data.incidents.length).toBeGreaterThan(0);
      });
    });
  });
});
