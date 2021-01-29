/* eslint-env node */

module.exports = function buildEnvironment(environment) {
  const ENV = {
    modulePrefix: 'async',
    environment,
  };

  return ENV;
};
