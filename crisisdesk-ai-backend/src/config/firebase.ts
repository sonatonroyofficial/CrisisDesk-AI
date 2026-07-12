import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK using application credentials or projectId
if (getApps().length === 0) {
  initializeApp({
    projectId: 'crisisdesk-ai-seu',
  });
  console.log('Firebase Admin SDK initialized successfully!');
}
