const { ObjectId } = require('mongodb');
const { Incident } = require('../../models');

/**
 * resolve incident
 */
async function incident(__, { id }) {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Incident ${id} is not valid`);
  }
  const incident = await Incident.findById(ObjectId(id));
  return incident;
}
incident.type = 'Query';

module.exports = {
  incident
};
