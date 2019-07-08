const _ = require('lodash');
const { raiseIncidentToEngineerUser } = require('./raiseIncidentToUser');
const { assignIncident } = require('./assignIncidentToUser');
const { acknowledgeIncident } = require('./acknowledgeIncident');
const { resolveIncident } = require('./resolveIncident');
const { deleteIncident } = require('./deleteIncident');

const allResolvers = {
  raiseIncidentToEngineerUser,
  assignIncident,
  acknowledgeIncident,
  resolveIncident,
  deleteIncident
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

