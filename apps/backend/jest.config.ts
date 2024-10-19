/* eslint-disable */
export default {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'node'],
  moduleNameMapper: {
    // HACK: This is a workaround because @roamhq/wrtc is unable to load the native bindings in the Jest environment.
    '^@roamhq/wrtc$': 'lodash',
  },
  coverageDirectory: '../../coverage/apps/backend',
};
