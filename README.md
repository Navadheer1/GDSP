# Humanize AI - Google Student Club Hackathon 2026

> **"Make every word sound more human."**
> 
> An AI-powered full-stack web application designed to transform robotic, repetitive, awkward, or unnecessarily complicated text into natural, readable, context-appropriate communication—without changing the original meaning.

---

## 🌟 Key Features

1. **AI Text Humanization via Gemini AI**:
   - Built on Google's official `@google/genai` SDK using `gemini-3.8-flash`.
   - Strips corporate clichés, passive phrasing, robotic cadence, and excessive filler while preserving human warmth and factual fidelity.
2. **Target Context Adaptation**:
   - Recruiter Feedback (Constructive, empathetic, clear candidate feedback)
   - Candidate Outreach (Warm, engaging, transparent recruitment outreach)
   - Interview Questions (Insightful, conversational interview inquiries)
   - Interview Summaries (Crisp, structured hiring panel summaries)
   - Professional Reports (Executive-ready, active-voice report summaries)
   - General Writing (Fluid, natural prose with balanced cadence)
3. **Tone Selection**:
   - Professional (Articulate, authoritative yet empathetic)
   - Polished (Crisp, elegant, dynamic)
   - Conversational (Warm, relatable, authentic)
4. **Truth Guard Dual-Verification Engine**:
   - **Deterministic Checks**: Real-time pattern audits examining exact preservation of numbers, percentages, decimals, calendar dates, days of the week, quarters, and proper named entities.
   - **Semantic AI Audit**: Independent secondary Gemini 3.8 Flash audit evaluating whether core author intent, nuance, and uncertainty levels ("may have", "unverified") remain faithfully preserved.
   - **Transparent Statuses**: Honest audit badges (`passed`, `warning`, `failed`, or `incomplete` if secondary API is unavailable) with interactive diff highlighting and one-click "Try Safer Rewrite".
   - **Truth Guard Challenge Sample**: Quick sample to verify numerical and uncertainty fidelity live.
5. **Firebase Authentication**:
   - Instant guest access (no login required to test).
   - Secure email/password login and registration to synchronize personal rewrite history.
6. **Cloud Firestore Rewrite History**:
   - User-isolated database architecture under `users/{userId}/history/{historyId}`.
   - Open, view, retry, or delete saved sessions.
   - Strict `firestore.rules` preventing cross-user data access.
7. **SaaS-Grade UI & UX**:
   - Light theme, navy typography, Tailwind CSS styling, and Lucide React icons.
   - Side-by-side or stacked comparisons with word and character deltas and reading-time estimations.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDK**: Google Gen AI SDK (`@google/genai`)
- **Backend / DB**: Firebase Authentication & Cloud Firestore
- **Icons**: Lucide React
- **Deployment**: Vercel ready

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **npm**: `v10+`

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
# Gemini API Key (Server-side only - NEVER expose with NEXT_PUBLIC_)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web App Configuration (Client-side safe)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Where to get keys:**
> - Gemini API key: [Google AI Studio](https://aistudio.google.com/)
> - Firebase configuration: [Firebase Console](https://console.firebase.google.com/) -> Project Settings -> General -> Your apps -> Web app.

### 3. Running Locally

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build Verification

```bash
# Compile and build Next.js optimized bundles
npm run build

# Start production server
npm start
```

---

## 🔒 Firestore Security Rules

To enforce strict user privacy, deploy the included `firestore.rules` via the Firebase Console or Firebase CLI:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /history/{historyId} {
        allow read, write, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import this repository.
4. Add the environment variables specified in `.env.example` in Vercel's Project Settings:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**.
