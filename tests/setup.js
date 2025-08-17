// Jest setup file for test environment configuration

// Mock DOM methods that aren't available in Node
global.document = {
  createElement: jest.fn(() => ({
    type: '',
    value: '',
    required: false,
    minLength: 0,
    checkValidity: jest.fn(() => true),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => [])
};

global.window = {
  document: global.document,
  alert: jest.fn(),
  location: {
    href: '',
    reload: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
};

// Mock console methods to suppress noise during tests
global.console = {
  ...global.console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});