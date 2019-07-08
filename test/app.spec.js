const gql = require('graphql-tag');
const _ = require('lodash');
const User = require('../src/models/User');
const { createTestClient } = require('apollo-server-testing');

describe('/test/app.spec.js', () => {
  let apolloServer;

  beforeAll(async () => {
    const serverInstance = require('../src/server').serverInstance;
    apolloServer = await serverInstance;
  });

  describe('Incident', () => {
    const INCIDENT_MUTATE = gql`
      mutation test($title: String!, $assignee: String!, $description: String, $status: String  ) {
          raiseIncidentToEngineerUser(title: $title, assignee: $assignee, description: $description, status: $status) {
            _id, title, assignee, description, status
        }
      }
    `;
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
          mutation: INCIDENT_MUTATE,
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
          mutation: INCIDENT_MUTATE,
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
  });
});
