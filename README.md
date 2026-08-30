# Gemini Journal & Reflection Studio

A production-grade, user-authenticated AI journaling and reflection web application powered by **Gemini 3.6 Flash**, **Cloud Firestore**, and **Firebase Authentication** (Google Sign-In).

---

## 🌟 Key Features

1. **Secure Federated Authentication**: Google Sign-In with Firebase Auth (OAuth 2.0). Zero plaintext password handling.
2. **Per-User Isolated Firestore Storage**: User data isolation enforced strictly via `request.auth.uid == userId` security rules in Cloud Firestore.
3. **Multi-Turn Reflective Dialogue**: Intelligent journaling companion powered by Gemini 3.6 Flash with Socratic questioning and empathetic feedback.
4. **Resilient Model Fallback Ladder**: Automated fallback mechanism across `gemini-3.6-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, and `gemini-3.7-flash` to guarantee high availability.
5. **AI Synthesis & Brainstorming Engine**: Automated extraction of key themes, emotional tone, mindset clarity metrics, actionable takeaways, and deep follow-up questions.
6. **Complete History & Export**: Search, filter, inspect past reflection transcripts, export to Markdown (`.md`), and resume previous sessions.

---

## 🔒 Firestore Security Rules

Deploy the following security rules to guarantee complete tenant isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-isolated rules ensuring strict tenant privacy
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /journal_entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🔑 Secret Management Setup (Google Cloud Secret Manager)

Store API credentials securely without hardcoding:

```bash
# 1. Create the Secret Manager secret for the Gemini API Key
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API Key as the latest secret version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run default compute service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Google Cloud Run Deployment

Deploy directly to Google Cloud Run using the gcloud CLI and bind the Secret Manager secret:

```bash
# 1. Build and Deploy to Cloud Run
gcloud run deploy gemini-journal-studio \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production"

# 2. Mandatory Campaign Verification Labeling
gcloud run services update gemini-journal-studio \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Functional Walkthrough & Test Suite

| Test ID | Flow / Action | Expected Result |
| :--- | :--- | :--- |
| **TC-01** | Open app in unauthenticated state | Shows `AuthCard` explaining Google Sign-In, zero-password policy, and Firestore tenant isolation. |
| **TC-02** | Click `Continue with Google Sign-In` | Triggers Firebase popup OAuth flow; transitions into private dashboard upon successful token acquisition. |
| **TC-03** | Select an Inspiration Starter pill | Fills reflection prompt in textarea and sets context-specific title (e.g. *Daily Mindfulness Check-in*). |
| **TC-04** | Type a reflection & press `Reflect` | Message is added to chat stream; Gemini 3.6 Flash responds with empathetic reflection; auto-persists to Firestore. |
| **TC-05** | Click `Summarize & Brainstorm` | Calls server-side synthesis route with fallback ladder; displays structured themes, tone, takeaways, and questions in *AI Insights* view. |
| **TC-06** | Click `Past Entries` | Queries Firestore collection `/users/{userId}/journal_entries` and renders past sessions with search & filter support. |
| **TC-07** | Click `Download .md` on an entry | Generates formatted Markdown transcript containing full reflection notes, metadata, and structured AI summaries. |
| **TC-08** | Click `Sign Out` | Closes active session, clears local state, and returns to the secure authentication gate. |
