const { ObjectId } = require('mongodb');
const { Incident } = require('../../models');

/**
 * resolve incident
 */
async function resolveIncident(__, { id }) {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Incident ${id} is not valid`);
  }
  const incident = await Incident.findById(ObjectId(id));

  if (!incident) { throw new Error(`Incident ${id} doesn't exist`); }

  return await Incident.findOneAndUpdate(
    { _id: ObjectId(id) },
    { status: 'Resolved' },
    { new: true }
  );
}
resolveIncident.type = 'Mutation';

module.exports = {
  resolveIncident
};
