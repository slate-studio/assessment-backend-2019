const { when } = require('jest-when');

/**
 * Util to help mock repo faster
 */
module.exports.mockRepo = () => ({
  findById: jest.fn(),
  create: jest.fn()
});

module.exports.when = when;
