import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp({
    projectId: 'crisisdesk-ai-seu',
  });
  console.log('Firebase Admin SDK initialized successfully!');
}
