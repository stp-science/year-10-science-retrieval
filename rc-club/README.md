# St Peter's RC Club Championship

Public dashboard: championship table, 8-week calendar, live race draw and results.

Teacher admin features: driver list, attendance tick list, random/seeded knockout generator, random/balanced heats, teams of three, knockout progression and automatic championship points from finishing positions.

## Secure admin setup

The site is intentionally read-only until Firebase is configured. This avoids putting an insecure password in public GitHub Pages code.

1. Create a Firebase project.
2. Add a Web App and copy its Firebase configuration into `firebase-config.js`.
3. Enable Google Authentication.
4. Create a Firestore database.
5. Replace `PASTE_TEACHER_GOOGLE_EMAIL` in both `firebase-config.js` and `firestore.rules.txt` with the teacher Google account.
6. Publish the rules from `firestore.rules.txt` in Firebase Firestore Rules.
7. Add the GitHub Pages domain to Firebase Authentication > Settings > Authorised domains if required.

Firestore data is stored at the single document `rcClub/data`. Reads are public; writes are restricted by the Firestore rule to the authorised teacher Google account.
