
import { beforeAll } from 'vitest';

// Configure Vitest to use React 19 act
beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});
