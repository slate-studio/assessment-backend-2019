const { when } = require('jest-when');

module.exports.randomString = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

/**
 * Util to help mock repo faster
 */
module.exports.mockRepo = () => ({
  findById: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn()
});

module.exports.when = when;
