const _ = require('lodash');
const { Incident } = require('../../models');

/**
 * list incident
 */
async function incidents(__, inp) {
  inp = inp || {};
  if (Object.keys(inp).length === 0) { return await Incident.find(); }

  const filter = _.get(inp, 'filter', {});
  const field = _.get(inp, 'sort.field', 'createdAt');
  const order = _.get(inp, 'sort.order', 1);
  const pageNo = _.get(inp, 'pagination.pageNo', 1);
  const pageSize = _.get(inp, 'pagination.pageSize', 100);

  return await Incident.find(filter)
    .sort({ [field]: order })
    .skip((pageNo - 1) * pageSize)
    .limit(pageSize);
}
incidents.type = 'Query';

module.exports = {
  incidents
};
