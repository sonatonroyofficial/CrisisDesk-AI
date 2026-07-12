// Mock firebase-admin/app for Jest test environment
module.exports = {
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
};
