const _ = require('lodash');
// Mutation
const { raiseIncidentToEngineerUser } = require('./raiseIncidentToUser');
const { assignIncident } = require('./assignIncidentToUser');
const { acknowledgeIncident } = require('./acknowledgeIncident');
const { resolveIncident } = require('./resolveIncident');
const { deleteIncident } = require('./deleteIncident');

// Query
const { incident } = require('./incident');

const allResolvers = {
  raiseIncidentToEngineerUser,
  assignIncident,
  acknowledgeIncident,
  resolveIncident,
  deleteIncident,
  incident
};

module.exports = _.chain(allResolvers)
  .groupBy(r => r.type)
  .mapValues((resolvers) => {
    return _.reduce(resolvers, (carry, value) => {
      carry[value.name] = value;
      return carry;
    }, {});
  })
  .value();

