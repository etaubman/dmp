module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: [
      'src/support/world.ts',
      'src/support/hooks.ts',
      'src/steps/login.steps.ts',
      'src/steps/navigation.steps.ts',
    ],
    requireModule: ['ts-node/register'],
    format: ['progress', 'summary'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
