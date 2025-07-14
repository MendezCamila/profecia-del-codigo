// jest.d.ts
import '@types/jest';

declare global {
  const describe: jest.Describe;
  const test: jest.It;
  const expect: jest.Expect;
  const afterEach: jest.HookFunction;
  const beforeEach: jest.HookFunction;
  const beforeAll: jest.HookFunction;
  const afterAll: jest.HookFunction;
  const jest: typeof import('@jest/globals').jest;
}
