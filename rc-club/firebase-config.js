// Firebase setup for the RC Club site.
// Replace the placeholder values below after creating the Firebase project.
// The public site still loads from data.json until Firebase is configured.

export const firebaseConfig = {
  apiKey: "PASTE_FIREBASE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// This must exactly match the Google account that is allowed to administer RC Club.
export const adminEmail = "PASTE_TEACHER_GOOGLE_EMAIL";
