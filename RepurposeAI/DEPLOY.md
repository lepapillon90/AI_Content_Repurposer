# 🚀 RepurposeAI Deployment Guide

This guide covers how to deploy the RepurposeAI application to popular static hosting services like **Netlify** or **Vercel**. Since this is a client-side application (HTML/CSS/JS), deployment is very straightforward.

## Option 1: Deploy with Netlify (Recommended)

### Method A: Drag & Drop (Easiest)
1.  Go to [app.netlify.com](https://app.netlify.com).
2.  Log in or Sign up.
3.  Go to the **"Sites"** tab.
4.  Drag and drop the entire `RepurposeAI` folder (containing `index.html`) into the "Drag and drop your site folder here" area.
5.  **Done!** Netlify will generate a URL for your site (e.g., `repurpose-ai-xyz.netlify.app`).

### Method B: Git Integration (Best for updates)
1.  Push your code to a GitHub repository.
2.  Log in to Netlify and click **"Add new site"** -> **"Import from existing project"**.
3.  Select **GitHub** and authorize.
4.  Choose your repository(`RepurposeAI`).
5.  **Build Settings**:
    *   **Base directory**: `RepurposeAI` (if the index.html is inside this folder).
    *   **Publish directory**: `.` (or leave blank).
    *   **Build command**: (Leave blank).
6.  Click **"Deploy"**.

---

## Option 2: Deploy with Vercel

1.  Go to [vercel.com](https://vercel.com).
2.  Log in or Sign up.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your GitHub repository.
5.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select the `RepurposeAI` folder.
    *   **Framework Preset**: Select "Other" (since it's plain HTML).
6.  Click **"Deploy"**.

---

## Option 3: Deploy with Firebase Hosting

1.  **Install Firebase CLI**: `npm install -g firebase-tools`
2.  **Login**: `firebase login`
3.  **Initialize**: Inside the `RepurposeAI` folder, run `firebase init hosting`.
    *   **Public Directory**: `.` (since index.html is in the current folder).
    *   **Configure as SPA**: `Yes`.
    *   **GitHub Action**: `Optional`.
4.  **Deploy**: `firebase deploy --only hosting`

---

## 🔐 Security & API Keys

- **Environment Variables**: Since this is a Vanilla JS project without a build step, **do not** hardcode your API keys in the code.
- **User-Provided Keys**: The application is designed to use keys stored in the user's `localStorage` (via the Settings menu). This keeps your personal billing keys safe.
- **Production Warning**: For a large-scale public release, it is recommended to move AI calls to a backend (like Firebase Cloud Functions) to hide API keys from the client-side.

---

## ✅ Post-Deployment Checks
- **PWA Check**: Open the deployed URL on your phone. Checking "Share" -> "Add to Home Screen" should show the correct App Name and Icon.
- **HTTPS**: All the above services provide free SSL automatically.
- **Updates**: If using Git integration, pushing changes to GitHub will automatically trigger a redeploy.
