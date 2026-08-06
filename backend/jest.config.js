/* BlogAuth V1 jest.config.js — Jest Test Suite Configurer */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 20000,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'routes/**/*.js'
  ]
};
