// Mock firebase-admin/auth for Jest test environment
module.exports = {
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(async () => ({
      uid: 'rxiVG15KuRTtYitVvcbHKwvj1kt1',
    })),
  })),
};
