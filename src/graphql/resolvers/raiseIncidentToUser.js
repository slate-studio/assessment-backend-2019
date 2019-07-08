const { User, Incident } = require('../../models');
const { INCIDENT_AVAILABEL_VALUES, INCIDENT_DEFAULT } = require('../../const');
/**
 * Raise an incident, assign to user with role `Engineer`
 */
async function raiseIncidentToEngineerUser(__, { title, assignee, description, status }) {
  const user = await User.findById(assignee);
  if (!user) {
    throw new Error(`User ${assignee} is not found`);
  }
  if (user.role !== 'Engineer') {
    throw new Error(`User ${assignee} is not engineer`);
  }

  if (status && INCIDENT_AVAILABEL_VALUES.indexOf(status) < 0) {
    throw new Error(`Status ${status} is invalid`);
  }

  const incident = await Incident.create({
    title,
    description,
    assignee,
    status: status || INCIDENT_DEFAULT
  });
  return incident;
}
raiseIncidentToEngineerUser.type = 'Mutation';

module.exports = {
  raiseIncidentToEngineerUser
};
