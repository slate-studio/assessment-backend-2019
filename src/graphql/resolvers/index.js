const _ = require('lodash');
const { raiseIncidentToEngineerUser } = require('./raiseIncidentToUser');

const allResolvers = {
  raiseIncidentToEngineerUser
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

