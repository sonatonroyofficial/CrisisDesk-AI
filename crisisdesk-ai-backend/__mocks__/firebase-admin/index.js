// Mock firebase-admin (default) for Jest test environment
module.exports = {
  apps: [],
  initializeApp: jest.fn(() => ({})),
};
