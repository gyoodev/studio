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

Securing your Firebase application involves several layers. **It is crucial that you implement robust Firestore Security Rules and review your Firebase Authentication settings.**

1.  **API Key Security (Client-Side)**:
    *   Your Firebase API keys (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) are loaded from environment variables via `.env.local`, as configured in `src/lib/firebase.ts`. This is a best practice to keep them out of your source code repository.
    *   These API keys are intended to be public for client-side SDKs. They identify your Firebase project to Google's servers.
    *   **Crucially, these keys DO NOT grant direct database access or bypass your security rules.** Security for Firestore, Realtime Database, and Cloud Storage is primarily enforced by **Firebase Security Rules**.

2.  **Firestore Security Rules (CRITICAL FOR DATA PROTECTION):**
    *   By default, new Firestore databases may have rules that are too permissive (e.g., allowing all reads/writes if `request.auth != null`). **You MUST configure Firestore Security Rules to protect your data based on your application's logic.**
    *   Go to your Firebase Console -> Firestore Database -> Rules tab.
    *   Here's an example set of rules. Adapt and expand these to fit all your data collections:
        ```firestore-rules
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {

            // Users Collection:
            // - Allow users to read and write only their own profile document.
            // - No one else can read or write to other users' profiles.
            match /users/{userId} {
              allow read, update, delete: if request.auth != null && request.auth.uid == userId;
              allow create: if request.auth != null; // Allow any authenticated user to create their own profile
            }

            // WorkoutPlans Collection (Example):
            // Assume workout plans have a 'userId' field storing the owner's UID.
            match /workoutPlans/{planId} {
              // Authenticated users can read any workout plan (e.g., for sharing or public browsing).
              allow read: if request.auth != null;

              // Only the authenticated owner can create a workout plan for themselves.
              // Ensure the 'userId' in the new plan matches the creator's UID.
              allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;

              // Only the authenticated owner can update or delete their own plan.
              // For updates, ensure the 'userId' field is not changed to someone else.
              allow update: if request.auth != null && resource.data.userId == request.auth.uid
                              && request.resource.data.userId == resource.data.userId;
              allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
            }

            // Add rules for other collections (e.g., challenges, progress logs) as needed.
            // Be specific about who can read, write, create, update, and delete data.
            // Deny access by default.
          }
        }
        ```
    *   **Test your rules thoroughly** using the Firebase console's Rules Playground before deploying your app to production. Incorrect rules can lead to data breaches or data loss.

3.  **Firebase Authentication Settings (Firebase Console)**:
    *   In the Firebase Console -> Authentication -> Settings tab:
        *   **Authorized Domains**: Ensure only domains you trust (like your production domain, development URLs, and your Firebase Studio preview URL) are listed here. This helps prevent your Firebase project from being used by unauthorized websites for authentication.
    *   Review and enable only the sign-in providers you intend to use (e.g., Email/Password, Google). Disable any unused providers.

4.  **Firebase App Check (Recommended for Production):**
    *   App Check helps protect your backend resources (like Firestore, Storage, Cloud Functions) from abuse by ensuring requests come from your actual app instances and not from unauthorized clients (e.g., bots, malicious scripts).
    *   This is configured in the Firebase Console -> App Check.

By correctly managing your API keys with environment variables and, most importantly, implementing strong and specific Firebase Security Rules, you significantly enhance the security of your application. Regularly review your security rules as your application evolves.
