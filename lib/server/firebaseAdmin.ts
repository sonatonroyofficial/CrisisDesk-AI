import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: 'crisisdesk-ai-seu',
    });
    console.log('Firebase Admin SDK initialized successfully!');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}
