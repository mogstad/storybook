/* eslint-env node */

module.exports = function buildEnvironment(environment) {
  const ENV = {
    modulePrefix: 'routable',
    environment,
  };

  return ENV;
};
