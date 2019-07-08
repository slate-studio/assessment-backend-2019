const { ObjectId } = require('mongodb');
const { Incident } = require('../../models');

/**
 * resolve incident
 */
async function deleteIncident(__, { id }) {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Incident ${id} is not valid`);
  }
  const incident = await Incident.findById(ObjectId(id));
  if (!incident) { throw new Error(`Incident ${id} doesn't exist`); }

  await Incident.deleteOne({ _id: ObjectId(id) });
  return incident;
}
deleteIncident.type = 'Mutation';

module.exports = {
  deleteIncident
};
