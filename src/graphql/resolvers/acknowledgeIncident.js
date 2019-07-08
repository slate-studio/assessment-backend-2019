const { ObjectId } = require('mongodb');
const { Incident } = require('../../models');

/**
 * acknowledge incident
 */
async function acknowledgeIncident(__, { id }) {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Incident ${id} is not valid`);
  }
  const incident = await Incident.findById(ObjectId(id));

  if (!incident) { throw new Error(`Incident ${id} doesn't exist`); }

  if (incident.status !== 'Created') {
    throw new Error(`Incident ${id} can not be acknowledged`);
  }

  return await Incident.findOneAndUpdate(
    { _id: ObjectId(id) },
    { status: 'Acknowledged' },
    { new: true }
  );
}
acknowledgeIncident.type = 'Mutation';

module.exports = {
  acknowledgeIncident
};
