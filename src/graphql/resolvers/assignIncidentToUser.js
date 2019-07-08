const { ObjectId } = require('mongodb');
const { User, Incident } = require('../../models');

/**
 * Assign incident to a user
 */
async function assignIncident(__, { data: { userId, incidentId } }) {
  if (!ObjectId.isValid(userId)) {
    throw new Error(`User id ${userId} is not valid`);
  }
  if (!ObjectId.isValid(incidentId)) {
    throw new Error(`Incident id ${incidentId} is not valid`);
  }

  const incidentObjectId = ObjectId(incidentId);
  const user = await User.findById(ObjectId(userId));
  const incident = await Incident.findById(incidentObjectId);

  if (!user) { throw new Error(`User with Id ${userId} doesn't exist`); }
  if (!incident) { throw new Error(`Incident with Id ${incidentId} doesn't exist`); }

  return await Incident.findOneAndUpdate(
    { _id: incidentObjectId },
    { assignee: user._id },
    { new: true }
  );
}
assignIncident.type = 'Mutation';

module.exports = {
  assignIncident
};
