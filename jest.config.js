/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    testMatch: ['**/**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
  };
};
