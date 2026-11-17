# 🔥 GenzVibe

**A real-time social platform built for Gen Z.**
Post it, like it, argue in the comments, repost the good stuff, and settle debates with a Vibe Check.


📱 **Installable:** works as an app on iPhone and Android (no app store needed)

---

## 💡 What is this?

GenzVibe started as a simple question: *what would a social app feel like if it were small, fast, and built around how people actually use their phones?*

It's a full-stack social platform where everything updates live. Someone likes your post, you see it. Someone replies to your comment, you get a notification. No refreshing, no waiting.

I built it solo, deployed it for real, and it runs on free tiers. No servers to maintain.

---

## ✨ Features

**The basics**
- Sign up, log in, and stay logged in across refreshes
- Profile pages with photo upload, bio, followers and following
- Follow and unfollow people
- Posts up to 500 characters, with line breaks preserved

**Feed**
- **For You:** the hottest posts (16+ likes) pinned at the top, fresh posts right below so new content never gets buried
- **Following:** posts and reposts from the people you follow

**Interaction**
- ❤️ Likes with live counts
- 💬 Comments with threaded replies (replies count toward the total, like Instagram)
- 🔁 X-style reposts: a repost is just a pointer to the original, so likes and comments stay shared in one place
- ⚡ Optimistic UI: comments and replies appear instantly while saving in the background, so it feels quick even on slow mobile networks

**Discovery**
- #️⃣ Clickable hashtags and a Trending tab
- 🔎 People search, with new members shown first and a NEW badge
- 🎯 **Vibe Check:** any user can drop a poll, everyone votes, results animate live

**Notifications**
- 🔔 In-app notifications for likes, comments, replies, reposts and follows, with an unread badge on the bell

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore (real-time listeners) |
| Hosting | Vercel (auto-deploys on every push) |
| Mobile | Progressive Web App (manifest + service worker) |
| Fonts | Syne and Manrope via Google Fonts |

No UI libraries and no CSS frameworks. The whole frontend lives in a single `App.jsx`, which keeps it easy to navigate for a project this size.

---

## 🧠 A few decisions worth explaining

- **Firestore over SQL.** The whole experience depends on pushing changes to users instantly, and `onSnapshot` listeners do exactly that.
- **No composite indexes.** The feed fetches recent posts and filters on the client. It's simple and works well at this scale.
- **Profile pictures as base64 in Firestore.** Photos are compressed to 200×200 in the browser first. It keeps the project on the free tier without Firebase Storage.
- **Atomic counters.** Likes, follows and reposts use `arrayUnion`, `arrayRemove` and `increment`, so two people tapping at the same moment never overwrite each other.
- **Reposts as references.** Copying post data would split likes and comments across duplicates. A reference keeps one source of truth.

---

## 🚀 Run it locally

```bash
git clone https://github.com/JeroGh/genzvibe.git
cd genzvibe
npm install
npm run dev
```

You'll need your own Firebase project:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password) and **Firestore**
3. Replace the `firebaseConfig` values in `src/App.jsx` with your own
4. Set your Firestore security rules (see below)

> Firebase web config values identify your project and are not secrets. Your **Firestore security rules** are what protect your data.

### Firestore rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth.uid == uid;
      allow update: if request.auth != null;
    }
    match /posts/{postId} {
      allow read, create, update: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.uid;
    }

    match /posts/{postId}/comments/{commentId} {
      allow read, create, update: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.uid;
    }

    match /polls/{pollId} {
      allow read, create, update: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }

    match /users/{uid}/notifications/{notifId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == uid;
    }

  }
}
```

---

## 📲 Install it on your phone

- **iPhone:** open in Safari → Share → *Add to Home Screen*
- **Android:** open in Chrome → *Install app*

---

---

## 🗺️ Roadmap

-- 🎭 Anonymous mode (confession booth)
-- 🔥 Roast or Toast
-- ⚡ Hot Takes that expire in 24 hours unless they earn enough likes
-- 💬 Direct messages
-- 📊 Post analytics
-- 🌐 Custom domain
-- ☁️ Cloud Functions for notifications and counters
-- 📄 Feed pagination

---

🙌 About

Built by [@JeroGh](https://github.com/JeroGh). Feedback, ideas and bug reports are welcome. Open an issue or say hi.

If you like it, drop a ⭐ on the repo.
