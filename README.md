# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

For Firebase integration to work, you need to create a `.env.local` file in the root of your project. Copy the contents of `.env.local.example` into this new file and replace the placeholder values with your actual Firebase project credentials. You can find these in your Firebase project settings.

Example `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
```
**Remember to restart your development server after creating or modifying the `.env.local` file.**

## Important Security Considerations

Securing your Firebase application involves several layers:

1.  **API Key Security**:
    *   Your Firebase API key (`NEXT_PUBLIC_FIREBASE_API_KEY`) is designed to be public for client-side SDKs. It identifies your Firebase project.
    *   **Crucially, it does NOT grant direct database access or bypass security rules.** Security is enforced by Firebase Security Rules (for Firestore/Storage) and Firebase Authentication settings.
    *   Always load your Firebase config from environment variables (`.env.local`) as configured in `src/lib/firebase.ts`, and never hardcode them directly in your client-side code if you can avoid it.

2.  **Firestore Security Rules (CRITICAL):**
    *   By default, new Firestore databases may have open rules allowing anyone to read/write data. **You MUST configure Firestore Security Rules to protect your data.**
    *   Go to your Firebase Console -> Firestore Database -> Rules tab.
    *   Here's a basic example for your `users` collection that allows users to only read and write their own profile document:
        ```firestore-rules
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow users to read and write only their own profile document
            match /users/{userId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            // Add rules for other collections as needed
            // e.g., match /workoutPlans/{planId} {
            //  allow read: if request.auth != null; // Example: allow read if user is authenticated
            //  allow write: if request.auth != null && request.resource.data.userId == request.auth.uid; // Example: only owner can write
            // }
          }
        }
        ```
    *   **Test your rules thoroughly** using the Firebase console's Rules Playground.

3.  **Firebase Authentication Settings**:
    *   In the Firebase Console -> Authentication -> Settings tab:
        *   **Authorized Domains**: Ensure only domains you trust (like your production domain and development URLs) are listed here. This helps prevent your Firebase project from being used by unauthorized websites for authentication.
    *   Review and enable only the sign-in providers you intend to use (e.g., Email/Password, Google).

4.  **Firebase App Check (Recommended for Production):**
    *   App Check helps protect your backend resources (like Firestore, Storage, Cloud Functions) from abuse by ensuring requests come from your actual app instances.
    *   This is configured in the Firebase Console.

By correctly managing your API keys with environment variables and, most importantly, implementing strong Firebase Security Rules, you significantly enhance the security of your application.
