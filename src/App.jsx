import { useState, useCallback, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "firebase/auth";
import {
  getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc,
  updateDoc, deleteDoc, query, orderBy, where, onSnapshot,
  arrayUnion, arrayRemove, serverTimestamp, limit
} from "firebase/firestore";
// Storage: using Firestore base64 (free, no Firebase Storage needed)

// ─── FIREBASE SETUP ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAVx0JRNfSh5ycEsFv88anaRTS_umw40w0",
  authDomain: "genzvibe-f8e64.firebaseapp.com",
  projectId: "genzvibe-f8e64",
  storageBucket: "genzvibe-f8e64.firebasestorage.app",
  messagingSenderId: "1086443885764",
  appId: "1:1086443885764:web:95305b76d59e5f865f6591",
  measurementId: "G-RFMEGP618S"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);

// ─── FIRESTORE HELPERS ────────────────────────────────────────────────────────
const usersCol  = () => collection(db, "users");
const postsCol  = () => collection(db, "posts");
const commentsCol = (postId) => collection(db, "posts", postId, "comments");

async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function createUserDoc(uid, { name, handle, bio }) {
  const av = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  await setDoc(doc(db, "users", uid), {
    name, handle, bio: bio || "", av,
    imgUrl: null,
    followers: [], following: [],
    createdAt: serverTimestamp()
  });
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0f; --surface: #111118; --card: #16161f;
      --border: #1e1e2e; --border2: #2a2a3a;
      --text: #eeeef5; --sub: #7070a0; --muted: #3a3a55;
      --accent: #7c3aed; --accent2: #a855f7; --glow: rgba(124,58,237,0.18);
      --green: #22c55e; --red: #f43f5e;
      --font-head: 'Syne', sans-serif; --font-body: 'Manrope', sans-serif;
      --radius: 14px; --radius-sm: 8px;
    }
    html { height: 100%; background: var(--bg); }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); min-height: 100%; -webkit-font-smoothing: antialiased; }
    #root { min-height: 100vh; }
    * { -webkit-tap-highlight-color: transparent; }
    button { touch-action: manipulation; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 4px; }

    .app { display: flex; flex-direction: column; min-height: 100vh; }

    /* TOPBAR */
    .topbar {
      position: sticky; top: 0; z-index: 200;
      background: rgba(10,10,15,0.88); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border); height: 56px;
      display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem;
    }
    .logo { font-family: var(--font-head); font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em;
      background: linear-gradient(135deg, #a855f7, #7c3aed); -webkit-background-clip: text;
      -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; user-select: none; }
    .topbar-right { display: flex; align-items: center; gap: 0.5rem; }

    /* BOTTOM NAV */
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: rgba(10,10,15,0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-around; align-items: center;
      height: 60px; padding-bottom: env(safe-area-inset-bottom);
    }
    .bnav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 3px; background: none; border: none; cursor: pointer; color: var(--sub);
      font-size: 0.55rem; font-family: var(--font-body); text-transform: uppercase; letter-spacing: 0.08em;
      transition: color 0.15s; padding: 0.5rem 0; }
    .bnav-btn.active { color: var(--accent2); }
    .bnav-btn svg { width: 22px; height: 22px; }

    /* SHELL */
    .shell { display: flex; max-width: 1000px; margin: 0 auto; width: 100%; padding: 1.5rem 1rem 5rem; gap: 1.5rem; }

    /* SIDEBAR */
    .sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.35rem; position: sticky; top: 70px; align-self: flex-start; }
    .snav-btn { display: flex; align-items: center; gap: 0.75rem; background: none; border: none; cursor: pointer;
      color: var(--sub); font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
      padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); transition: all 0.15s; text-align: left; width: 100%; }
    .snav-btn:hover { background: var(--card); color: var(--text); }
    .snav-btn.active { background: var(--card); color: var(--text); }
    .snav-btn.active svg { color: var(--accent2); }
    .snav-btn svg { width: 20px; height: 20px; flex-shrink: 0; }
    .main { flex: 1; min-width: 0; }

    /* CARDS */
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem 1.25rem; transition: border-color 0.2s; }

    /* COMPOSE */
    .compose { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 1rem; }
    .compose-top { display: flex; gap: 0.85rem; align-items: flex-start; }
    .compose textarea { flex: 1; background: none; border: none; outline: none; resize: none;
      color: var(--text); font-family: var(--font-body); font-size: 0.95rem; line-height: 1.6;
      min-height: 64px; padding-top: 0.2rem; white-space: pre-wrap; overflow-y: hidden; }
    .compose textarea::placeholder { color: var(--muted); }
    .compose-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }
    .char { font-size: 0.75rem; color: var(--sub); }
    .char.warn { color: var(--red); }

    /* BUTTONS */
    .btn { font-family: var(--font-body); font-weight: 600; border: none; cursor: pointer;
      border-radius: 100px; transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; }
    .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; padding: 0.5rem 1.25rem; font-size: 0.85rem; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-ghost { background: var(--surface); color: var(--sub); padding: 0.4rem 1rem; font-size: 0.8rem; border: 1px solid var(--border); }
    .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
    .btn-follow { background: var(--accent); color: white; padding: 0.35rem 0.9rem; font-size: 0.78rem; }
    .btn-follow:hover { background: var(--accent2); }
    .btn-following { background: transparent; color: var(--sub); border: 1px solid var(--border2); padding: 0.35rem 0.9rem; font-size: 0.78rem; }
    .btn-following:hover { border-color: var(--red); color: var(--red); }
    .btn-icon { background: none; border: none; cursor: pointer; color: var(--sub); display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.82rem; font-family: var(--font-body); padding: 0.35rem 0.6rem; border-radius: var(--radius-sm); transition: all 0.15s; }
    .btn-icon:hover { background: var(--surface); color: var(--text); }
    .btn-icon.liked { color: var(--red); }
    .btn-icon.commented { color: var(--accent2); }
    .btn-icon.reposted { color: var(--green); }
    .btn-icon svg { width: 17px; height: 17px; }

    /* REPOST */
    .repost-label {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.72rem; color: var(--sub); margin-bottom: 0.6rem;
      font-weight: 600;
    }
    .repost-label svg { width: 13px; height: 13px; color: var(--green); }
    .repost-border {
      border-left: 2px solid var(--border2);
      padding-left: 0.85rem;
      margin-bottom: 0.85rem;
    }

    /* POSTS */
    .post { margin-bottom: 0.75rem; animation: fadeUp 0.25s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .post-head { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
    .post-meta { flex: 1; min-width: 0; }
    .post-name { font-family: var(--font-head); font-size: 0.9rem; font-weight: 700; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .post-name:hover { color: var(--accent2); }
    .post-handle { font-size: 0.75rem; color: var(--sub); }
    .post-time { font-size: 0.72rem; color: var(--muted); }
    .post-body { font-size: 0.92rem; line-height: 1.65; margin-bottom: 0.85rem; color: var(--text); word-break: break-word; white-space: pre-wrap; }
    .post-actions { display: flex; gap: 0.25rem; margin: -0.35rem; }

    /* COMMENTS */
    .comments { margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.65rem; }
    .comment { display: flex; gap: 0.65rem; }
    .comment-body { flex: 1; }
    .comment-author { font-size: 0.78rem; font-weight: 600; font-family: var(--font-head); margin-bottom: 0.15rem; cursor: pointer; }
    .comment-author:hover { color: var(--accent2); }
    .comment-text { font-size: 0.82rem; color: var(--sub); line-height: 1.5; }
    .comment-input { display: flex; gap: 0.65rem; align-items: center; margin-top: 0.65rem; }
    .comment-input input { flex: 1; background: var(--surface); border: 1px solid var(--border);
      border-radius: 100px; padding: 0.5rem 1rem; font-family: var(--font-body); font-size: 0.82rem; color: var(--text); outline: none; transition: border-color 0.15s; }
    .comment-input input:focus { border-color: var(--accent); }
    .comment-input input::placeholder { color: var(--muted); }

    /* AVATAR */
    .av { border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-family: var(--font-head); font-weight: 700; flex-shrink: 0; cursor: pointer; transition: transform 0.15s; overflow: hidden; }
    .av:hover { transform: scale(1.05); }
    .av-md { width: 40px; height: 40px; font-size: 0.78rem; }
    .av-sm { width: 30px; height: 30px; font-size: 0.65rem; }
    .av-lg { width: 60px; height: 60px; font-size: 1.1rem; }
    .av img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

    /* USER ROW */
    .user-row { display: flex; align-items: center; gap: 0.85rem; padding: 0.7rem 0; border-bottom: 1px solid var(--border); }
    .user-row:last-child { border-bottom: none; }
    .user-info { flex: 1; min-width: 0; }
    .user-name { font-size: 0.88rem; font-weight: 600; font-family: var(--font-head); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-name:hover { color: var(--accent2); }
    .user-handle { font-size: 0.73rem; color: var(--sub); }

    /* PROFILE */
    .profile-banner { height: 110px; border-radius: var(--radius) var(--radius) 0 0;
      background: linear-gradient(135deg, #1a0533, #0f0520, #1a0a2e); position: relative; overflow: hidden; }
    .profile-banner::after { content: ''; position: absolute; inset: 0;
      background: repeating-linear-gradient(60deg, transparent, transparent 30px, rgba(124,58,237,0.04) 30px, rgba(124,58,237,0.04) 31px); }
    .profile-body { background: var(--card); border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--radius) var(--radius); padding: 0 1.25rem 1.25rem; margin-bottom: 1rem; }
    .profile-av-wrap { margin-top: -30px; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: flex-end; }
    .profile-name { font-family: var(--font-head); font-size: 1.2rem; font-weight: 800; }
    .profile-handle { font-size: 0.82rem; color: var(--sub); margin-bottom: 0.5rem; }
    .profile-bio { font-size: 0.88rem; color: var(--sub); line-height: 1.5; margin-bottom: 0.85rem; }
    .profile-stats { display: flex; gap: 1.5rem; }
    .pstat-num { font-family: var(--font-head); font-size: 1rem; font-weight: 700; }
    .pstat-label { font-size: 0.7rem; color: var(--sub); text-transform: uppercase; letter-spacing: 0.08em; }

    /* TABS */
    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
    .tab-btn { flex: 1; background: none; border: none; cursor: pointer; color: var(--sub);
      font-family: var(--font-body); font-size: 0.82rem; font-weight: 500;
      padding: 0.75rem; border-bottom: 2px solid transparent; transition: all 0.15s; margin-bottom: -1px; }
    .tab-btn.active { color: var(--text); border-bottom-color: var(--accent2); }

    /* AUTH */
    .auth-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 1.5rem; background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), var(--bg); }
    .auth-box { width: 100%; max-width: 380px; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 2rem 1.75rem; }
    .auth-logo { font-family: var(--font-head); font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #a855f7, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .auth-sub { color: var(--sub); font-size: 0.88rem; margin-bottom: 1.75rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.73rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sub); margin-bottom: 0.4rem; }
    .field input { width: 100%; background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 0.7rem 0.9rem; font-family: var(--font-body);
      font-size: 16px; color: var(--text); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
    .auth-err { color: var(--red); font-size: 0.8rem; margin-bottom: 0.75rem; background: rgba(244,63,94,0.08); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); }
    .auth-toggle { margin-top: 1.25rem; text-align: center; font-size: 0.83rem; color: var(--sub); }
    .auth-toggle button { background: none; border: none; cursor: pointer; color: var(--accent2); font-family: var(--font-body); font-weight: 600; }

    /* SEARCH */
    .search-wrap { position: relative; margin-bottom: 1rem; }
    .search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--muted); width: 16px; height: 16px; }
    .search-wrap input { width: 100%; background: var(--card); border: 1px solid var(--border);
      border-radius: 100px; padding: 0.6rem 1rem 0.6rem 2.5rem; font-family: var(--font-body);
      font-size: 16px; color: var(--text); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .search-wrap input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
    .search-wrap input::placeholder { color: var(--muted); }

    /* EMPTY */
    .empty { text-align: center; padding: 3rem 1rem; color: var(--sub); }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .empty-title { font-family: var(--font-head); font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem; }

    /* TOAST */
    .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: var(--card); border: 1px solid var(--border2); color: var(--text);
      padding: 0.65rem 1.25rem; border-radius: 100px; font-size: 0.83rem; z-index: 9999;
      white-space: nowrap; animation: toastIn 0.2s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

    /* LOADING */
    .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); flex-direction: column; gap: 1rem; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent2); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* MODAL */
    .modal-backdrop { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.15s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal { background: var(--card); border: 1px solid var(--border2); border-radius: 20px;
      width: 100%; max-width: 400px; padding: 1.75rem; position: relative; animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-title { font-family: var(--font-head); font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; }
    .modal-close { position: absolute; top: 1.1rem; right: 1.1rem; background: var(--surface);
      border: 1px solid var(--border); color: var(--sub); width: 30px; height: 30px; border-radius: 50%;
      cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .modal-close:hover { color: var(--text); }

    /* AVATAR UPLOAD */
    .av-upload-wrap { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .av-upload-ring { position: relative; cursor: pointer; }
    .av-upload-ring:hover .av-upload-overlay { opacity: 1; }
    .av-upload-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; font-size: 1.2rem; }
    .av-upload-label { font-size: 0.75rem; color: var(--sub); text-align: center; line-height: 1.4; }
    .av-upload-input { display: none; }
    .av-edit-badge { position: absolute; bottom: 2px; right: 2px; width: 22px; height: 22px; border-radius: 50%;
      background: var(--accent); border: 2px solid var(--card); display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; color: white; pointer-events: none; }

    /* FEED TABS */
    .feed-tabs {
      display: flex; border-bottom: 1px solid var(--border);
      margin-bottom: 1rem; position: sticky; top: 56px; z-index: 100;
      background: rgba(10,10,15,0.95); backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    @supports (padding-top: env(safe-area-inset-top)) {
      .feed-tabs { top: calc(56px + env(safe-area-inset-top)); }
    }
    .feed-tab {
      flex: 1; background: none; border: none; cursor: pointer;
      color: var(--sub); font-family: var(--font-body); font-size: 0.88rem; font-weight: 600;
      padding: 0.85rem 0.5rem; border-bottom: 2px solid transparent;
      transition: all 0.15s; margin-bottom: -1px;
    }
    .feed-tab.active { color: var(--text); border-bottom-color: var(--accent2); }
    .feed-tab:hover { color: var(--text); }

    /* FOR YOU badge on hot posts */
    .hot-badge {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--accent2);
      background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.2);
      border-radius: 100px; padding: 0.15rem 0.5rem; margin-left: auto;
    }

    /* HASHTAG */
    .hashtag { color: var(--accent2); cursor: pointer; font-weight: 600; transition: color 0.15s; }
    .hashtag:hover { color: var(--accent); text-decoration: underline; }

    /* TRENDING */
    .trending-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.85rem 1.1rem; background: var(--card);
      border: 1px solid var(--border); border-radius: var(--radius);
      margin-bottom: 0.6rem; cursor: pointer; transition: border-color 0.15s, transform 0.15s;
    }
    .trending-item:hover { border-color: var(--accent2); transform: translateX(3px); }
    .trending-rank { font-family: var(--font-head); font-size: 1.3rem; font-weight: 800; color: var(--muted); min-width: 24px; text-align: center; }
    .trending-rank.top { color: var(--accent2); }
    .trending-tag { font-family: var(--font-head); font-size: 0.95rem; font-weight: 700; color: var(--text); }
    .trending-count { font-size: 0.73rem; color: var(--sub); margin-top: 0.1rem; }

    /* HASHTAG PAGE */
    .hashtag-header {
      background: linear-gradient(135deg, #1a0533, #0f0520);
      border-radius: var(--radius); padding: 1.25rem 1.5rem;
      margin-bottom: 1rem; border: 1px solid var(--border);
    }
    .hashtag-title { font-family: var(--font-head); font-size: 1.5rem; font-weight: 800; color: var(--accent2); }
    .hashtag-sub { font-size: 0.82rem; color: var(--sub); margin-top: 0.25rem; }

    /* BACK */
    .back { background: none; border: none; cursor: pointer; color: var(--sub); font-family: var(--font-body);
      font-size: 0.82rem; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1rem; transition: color 0.15s; }
    .back:hover { color: var(--text); }
    .back svg { width: 16px; height: 16px; }

    /* RESPONSIVE */
    @media (max-width: 374px) {
      .topbar { padding: 0 0.75rem; height: 50px; }
      .logo { font-size: 1.05rem; }
      .shell { padding: 0.6rem 0.5rem 5rem; }
      .card { padding: 0.85rem 0.9rem; }
      .av-md { width: 34px; height: 34px; font-size: 0.68rem; }
      .av-lg { width: 52px; height: 52px; }
      .profile-banner { height: 80px; }
      .auth-box { padding: 1.5rem 1.25rem; }
    }
    @media (max-width: 639px) {
      .sidebar { display: none; }
      .shell { padding: 0.85rem 0.75rem 5.5rem; gap: 0; }
      .profile-stats { gap: 1.1rem; }
      .post-actions { gap: 0; }
      input, textarea { font-size: 16px !important; }
      .card { border-radius: 12px; }
      .profile-banner { height: 90px; }
      .toast { bottom: 72px; }
      .modal-backdrop { align-items: flex-end; padding: 0; }
      .modal { border-radius: 20px 20px 0 0; max-width: 100%; padding-bottom: calc(1.75rem + env(safe-area-inset-bottom)); }
      .auth-screen { align-items: flex-end; padding: 0; }
      .auth-box { border-radius: 24px 24px 0 0; max-width: 100%; padding: 1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom)); }
    }
    @media (min-width: 640px) {
      .bottom-nav { display: none; }
      .shell { padding-bottom: 2rem; }
    }
    @media (min-width: 640px) and (max-width: 767px) {
      .sidebar { width: 56px; }
      .snav-btn { justify-content: center; padding: 0.65rem; }
      .snav-btn span { display: none; }
      .sidebar-card { display: none; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .shell { max-width: 720px; padding: 1.25rem 1rem 2rem; gap: 1rem; }
      .sidebar { width: 180px; }
    }
    @media (min-width: 1024px) {
      .shell { max-width: 1000px; }
    }
    @supports (padding-top: env(safe-area-inset-top)) {
      .topbar { padding-top: env(safe-area-inset-top); height: calc(56px + env(safe-area-inset-top)); }
      .bottom-nav { height: calc(60px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); }
    }
    @media (max-width: 767px) and (orientation: landscape) {
      .bottom-nav { height: 48px; }
      .bnav-btn { font-size: 0; }
      .shell { padding-bottom: 4rem; }
      .auth-screen { align-items: center; }
      .auth-box { border-radius: 20px; max-width: 420px; padding: 1.25rem 1.5rem; }
      .modal-backdrop { align-items: center; padding: 1rem; }
      .modal { border-radius: 20px; max-width: 400px; }
    }
    @media (hover: hover) {
      .card:hover { border-color: var(--border2); }
      .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 20px var(--glow); }
    }
    @media (hover: none) {
      .btn-primary:active { opacity: 0.85; }
    }
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Home:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Explore: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart: ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Comment: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Repost: ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Send:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Back:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Plus:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const AV_COLORS = [
  ["#7c3aed","#a855f7"], ["#db2777","#f472b6"], ["#0891b2","#22d3ee"],
  ["#059669","#34d399"], ["#d97706","#fbbf24"], ["#dc2626","#f87171"],
];
function avColor(name = "") { return AV_COLORS[(name.charCodeAt(0) || 0) % AV_COLORS.length]; }

function Av({ user, size = "av-md", onClick }) {
  if (!user) return null;
  const [a, b] = avColor(user.name);
  return (
    <div className={`av ${size}`} onClick={onClick} style={{ background: `linear-gradient(135deg,${a},${b})`, color: "white" }}>
      {user.imgUrl ? <img src={user.imgUrl} alt={user.name} /> : user.av}
    </div>
  );
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function ago(ts) {
  if (!ts) return "";
  const d = Date.now() - (ts.toMillis ? ts.toMillis() : ts);
  if (d < 60000) return "now";
  if (d < 3600000) return Math.floor(d / 60000) + "m";
  if (d < 86400000) return Math.floor(d / 3600000) + "h";
  return Math.floor(d / 86400000) + "d";
}

const VIBES = ["✨","🔥","💀","😭","🫶","💜","🤙","🫠","💯","🎯","🧠","👀"];
function Toast({ msg }) { return msg ? <div className="toast">{msg}</div> : null; }

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function Auth() {
  const [mode, setMode]   = useState("login");
  const [form, setForm]   = useState({ name:"", handle:"", bio:"", email:"", password:"" });
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        if (!form.name.trim() || !form.handle.trim()) throw new Error("Name and handle are required");
        // Step 1: Create auth account first
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        try {
          // Step 2: Now authenticated — check handle uniqueness
          const q = query(usersCol(), where("handle", "==", form.handle.trim().toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            // Handle taken — delete the auth account we just made and show error
            await cred.user.delete();
            throw new Error("Handle already taken, try another");
          }
          // Step 3: Create Firestore user doc
          await createUserDoc(cred.user.uid, {
            name: form.name.trim(),
            handle: form.handle.trim().toLowerCase(),
            bio: form.bio.trim()
          });
          await updateProfile(cred.user, { displayName: form.name.trim() });
        } catch (innerErr) {
          // If Firestore write fails, sign out so user isn't stuck logged in with no profile
          if (innerErr.message !== "Handle already taken, try another") {
            await signOut(auth);
          }
          throw innerErr;
        }
      }
    } catch (e) {
      const msg = e.code === "auth/email-already-in-use" ? "Email already in use"
        : e.code === "auth/wrong-password" || e.code === "auth/user-not-found" ? "Invalid email or password"
        : e.code === "auth/weak-password" ? "Password must be at least 6 characters"
        : e.code === "auth/invalid-email" ? "Invalid email address"
        : e.message;
      setErr(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">GenzVibe</div>
        <div className="auth-sub">{mode === "login" ? "welcome back bestie 👋" : "join the vibe ✨"}</div>

        {mode === "register" && <>
          <div className="field"><label>name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="your full name" />
          </div>
          <div className="field"><label>handle</label>
            <input value={form.handle} onChange={e => set("handle", e.target.value)} placeholder="@yourhandle" />
          </div>
          <div className="field"><label>bio <span style={{color:"var(--muted)",textTransform:"none",letterSpacing:0}}>(optional)</span></label>
            <input value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="something short and real" />
          </div>
        </>}

        <div className="field"><label>email</label>
          <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field"><label>password</label>
          <input type="password" value={form.password} onChange={e => set("password", e.target.value)}
            placeholder={mode === "register" ? "min 6 characters" : "your password"}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {err && <div className="auth-err">⚠ {err}</div>}

        <button className="btn btn-primary" disabled={loading}
          style={{width:"100%",padding:"0.75rem",borderRadius:"var(--radius-sm)",fontSize:"0.9rem",marginTop:"0.25rem"}}
          onClick={submit}>
          {loading ? "..." : mode === "login" ? "sign in" : "create account"}
        </button>

        <div className="auth-toggle">
          {mode === "login"
            ? <>new here? <button onClick={() => { setMode("register"); setErr(""); }}>create account</button></>
            : <>already on here? <button onClick={() => { setMode("login"); setErr(""); }}>sign in</button></>}
        </div>
      </div>
    </div>
  );
}

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
function EditProfileModal({ currentUser, onClose, onSave }) {
  const [name, setName]     = useState(currentUser?.name || "");
  const [bio, setBio]       = useState(currentUser?.bio  || "");
  const [imgUrl, setImgUrl] = useState(currentUser?.imgUrl || null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return; }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Compress image before saving to Firestore
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200;
        const ratio = Math.min(MAX / img.width, MAX / img.height);
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        setImgUrl(canvas.toDataURL("image/jpeg", 0.7));
        setLoading(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const av = name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    await updateDoc(doc(db, "users", currentUser.id), { name: name.trim(), bio, imgUrl, av });
    onSave(); onClose();
    setLoading(false);
  };

  const preview = { ...currentUser, name, imgUrl, av: name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">edit profile</div>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="av-upload-wrap">
          <div className="av-upload-ring" onClick={() => fileRef.current?.click()}>
            <Av user={preview} size="av-lg" />
            <div className="av-upload-overlay">{loading ? "⏳" : "📷"}</div>
            <div className="av-edit-badge">✏</div>
          </div>
          <div className="av-upload-label">tap to upload photo<br/><span style={{color:"var(--muted)",fontSize:"0.7rem"}}>jpg, png · max 5mb</span></div>
          <input ref={fileRef} className="av-upload-input" type="file" accept="image/*" onChange={handleFile} />
          {imgUrl && <button className="btn btn-ghost" style={{fontSize:"0.75rem",padding:"0.3rem 0.85rem"}} onClick={() => setImgUrl(null)}>remove photo</button>}
        </div>
        <div className="field"><label>name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label>bio</label><input value={bio} onChange={e => setBio(e.target.value)} maxLength={100} /></div>
        <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
          <button className="btn btn-ghost" style={{flex:1,padding:"0.65rem"}} onClick={onClose}>cancel</button>
          <button className="btn btn-primary" style={{flex:2,padding:"0.65rem",borderRadius:"var(--radius-sm)"}}
            onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? "saving..." : "save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post: initialPost, currentUser, onNav, toast, onHashtagClick }) {
  const [post, setPost]               = useState(initialPost);
  const [author, setAuthor]           = useState(null);
  const [repostAuthor, setRepostAuthor] = useState(null); // original author if repost
  const [comments, setComments]       = useState([]);
  const [commentAuthors, setCAuthors] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState("");
  const inputRef = useRef();

  // ── Live listener on this post doc ──
  useEffect(() => {
    return onSnapshot(doc(db, "posts", initialPost.id), snap => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
  }, [initialPost.id]);

  // fetch the person who reposted (post.uid) and original author if repost
  useEffect(() => { getUser(post.uid).then(setAuthor); }, [post.uid]);
  useEffect(() => {
    if (post.repostOf) getUser(post.originalUid).then(setRepostAuthor);
  }, [post.repostOf, post.originalUid]);

  useEffect(() => {
    if (!showComments) return;
    const q = query(commentsCol(post.id), orderBy("ts", "asc"));
    return onSnapshot(q, async snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(list);
      const missing = [...new Set(list.map(c => c.uid))].filter(uid => !commentAuthors[uid]);
      if (missing.length) {
        const results = await Promise.all(missing.map(uid => getUser(uid)));
        setCAuthors(prev => {
          const next = { ...prev };
          results.forEach((u, i) => { if (u) next[missing[i]] = u; });
          return next;
        });
      }
    });
  }, [showComments, post.id]);

  if (!author) return null;
  const liked    = currentUser && post.likes?.includes(currentUser.id);
  const reposted = currentUser && post.repostedBy?.includes(currentUser.id);
  const isOwn    = currentUser?.id === post.uid;

  const handleLike = async () => {
    const ref2 = doc(db, "posts", post.id);
    if (liked) await updateDoc(ref2, { likes: arrayRemove(currentUser.id) });
    else       await updateDoc(ref2, { likes: arrayUnion(currentUser.id) });
  };

  const handleRepost = async () => {
    if (reposted) {
      // undo repost — find and delete the repost doc
      const q = query(postsCol(), where("repostOf", "==", post.id), where("uid", "==", currentUser.id));
      const snap = await getDocs(q);
      snap.forEach(d => deleteDoc(d.ref));
      await updateDoc(doc(db, "posts", post.id), {
        repostedBy: arrayRemove(currentUser.id),
        repostCount: Math.max((post.repostCount || 1) - 1, 0)
      });
      toast("Repost removed");
    } else {
      // create a new repost doc that references the original
      await addDoc(postsCol(), {
        uid: currentUser.id,          // who reposted
        repostOf: post.id,            // original post id
        originalUid: post.uid,        // original author id
        text: post.text,              // copy text for feed rendering
        likes: [], commentCount: 0, repostedBy: [], repostCount: 0,
        ts: serverTimestamp()
      });
      await updateDoc(doc(db, "posts", post.id), {
        repostedBy: arrayUnion(currentUser.id),
        repostCount: (post.repostCount || 0) + 1
      });
      toast("Reposted! 🔁");
    }
  };

  const handleDelete = async () => {
    await deleteDoc(doc(db, "posts", post.id));
    toast("deleted ✓");
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addDoc(commentsCol(post.id), { uid: currentUser.id, text: commentText.trim(), ts: serverTimestamp() });
    await updateDoc(doc(db, "posts", post.id), { commentCount: (post.commentCount || 0) + 1 });
    setCommentText("");
  };

  // who to show as the "header" author
  const displayAuthor = post.repostOf ? repostAuthor : author;
  const reposterName  = post.repostOf ? author?.name : null;

  return (
    <div className="card post">
      {/* Reposted-by label */}
      {post.repostOf && reposterName && (
        <div className="repost-label">
          <Icon.Repost filled={false} /> {reposterName} reposted
        </div>
      )}
      <div className="post-head">
        <Av user={displayAuthor || author} onClick={() => onNav("profile", (displayAuthor || author).id)} />
        <div className="post-meta">
          <div className="post-name" onClick={() => onNav("profile", (displayAuthor || author).id)}>
            {displayAuthor ? displayAuthor.name : author.name}
          </div>
          <span className="post-handle">@{displayAuthor ? displayAuthor.handle : author.handle}</span>
          <span className="post-time"> · {ago(post.ts)}</span>
        </div>
        {isOwn && <button className="btn-icon" onClick={handleDelete} style={{marginLeft:"auto"}}>✕</button>}
      </div>
      <div className="post-body">
        <HighlightedText text={post.text} onHashtagClick={onHashtagClick || (() => {})} />
      </div>
      <div className="post-actions">
        <button className={`btn-icon ${liked ? "liked" : ""}`} onClick={handleLike}>
          <Icon.Heart filled={liked} /> {post.likes?.length > 0 && post.likes.length}
        </button>
        <button className={`btn-icon ${showComments ? "commented" : ""}`} onClick={() => { setShowComments(s => !s); setTimeout(() => inputRef.current?.focus(), 100); }}>
          <Icon.Comment /> {post.commentCount > 0 && post.commentCount}
        </button>
        <button className={`btn-icon ${reposted ? "reposted" : ""}`} onClick={handleRepost}>
          <Icon.Repost filled={reposted} /> {post.repostCount > 0 && post.repostCount}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {comments.map(c => {
            const cu = commentAuthors[c.uid]; if (!cu) return null;
            return (
              <div key={c.id} className="comment">
                <Av user={cu} size="av-sm" onClick={() => onNav("profile", cu.id)} />
                <div className="comment-body">
                  <div className="comment-author" onClick={() => onNav("profile", cu.id)}>
                    {cu.name} <span style={{color:"var(--muted)",fontWeight:400}}>· {ago(c.ts)}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            );
          })}
          <div className="comment-input">
            <Av user={currentUser} size="av-sm" />
            <input ref={inputRef} value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="drop a comment..." onKeyDown={e => e.key === "Enter" && handleComment()} />
            <button className="btn btn-primary" style={{padding:"0.4rem 0.75rem"}} onClick={handleComment} disabled={!commentText.trim()}>
              <Icon.Send />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HASHTAG UTILS ────────────────────────────────────────────────────────────
function extractHashtags(text) {
  return [...new Set((text.match(/#[\w]+/g) || []).map(h => h.toLowerCase()))];
}

function HighlightedText({ text, onHashtagClick }) {
  const parts = text.split(/(#[\w]+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        /^#[\w]+$/.test(part)
          ? <span key={i} className="hashtag" onClick={e => { e.stopPropagation(); onHashtagClick(part.toLowerCase()); }}>{part}</span>
          : part
      )}
    </span>
  );
}

// ─── COMPOSE ─────────────────────────────────────────────────────────────────
function Compose({ currentUser, onHashtagClick }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const MAX = 500;

  const submit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    const hashtags = extractHashtags(text);
    await addDoc(postsCol(), {
      uid: currentUser.id, text: text.trim(),
      likes: [], commentCount: 0, repostedBy: [], repostCount: 0,
      hashtags,
      ts: serverTimestamp()
    });
    setText(""); setLoading(false);
  };

  return (
    <div className="compose">
      <div className="compose-top">
        <Av user={currentUser} />
        <textarea value={text} onChange={e => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} rows={2}
          placeholder={`what's on your mind? use #hashtags 🔥`}
          maxLength={MAX} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }} />
      </div>
      <div className="compose-footer">
        <span style={{fontSize:"0.75rem",color:"var(--sub)"}}>
          {extractHashtags(text).length > 0 && <span style={{color:"var(--accent2)"}}>{extractHashtags(text).join(" ")} · </span>}
          <span className={text.length > MAX * 0.85 ? "char warn" : "char"}>{MAX - text.length}</span>
        </span>
        <button className="btn btn-primary" onClick={submit} disabled={!text.trim() || loading}>
          <Icon.Plus /> {loading ? "posting..." : "post"}
        </button>
      </div>
    </div>
  );
}

// ─── FEED VIEW ────────────────────────────────────────────────────────────────
function FeedView({ currentUser, onNav, toast }) {
  const [feedTab, setFeedTab]   = useState("foryou");
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTag, setActiveTag] = useState(null);

  // Single listener — fetch all recent posts, filter client-side per tab
  useEffect(() => {
    const q = query(postsCol(), orderBy("ts", "desc"), limit(200));
    return onSnapshot(q, snap => {
      setAllPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => { console.error("Feed error:", err); setLoading(false); });
  }, []);

  // For You: ALL posts sorted by likes desc
  const forYouPosts = [...allPosts]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

  // Following: only posts from followed users + self, sorted newest first
  const followingIds = new Set([currentUser.id, ...(currentUser.following || [])]);
  const followingPosts = allPosts.filter(p => followingIds.has(p.uid));

  const posts = feedTab === "foryou" ? forYouPosts : followingPosts;

  if (loading) return <div className="empty"><div className="spinner" style={{margin:"3rem auto"}} /></div>;

  if (activeTag) return (
    <HashtagView tag={activeTag} currentUser={currentUser} onNav={onNav} toast={toast} onBack={() => setActiveTag(null)} />
  );

  return (
    <div>
      <Compose currentUser={currentUser} />

      {/* Feed tabs */}
      <div className="feed-tabs">
        <button className={`feed-tab ${feedTab === "foryou" ? "active" : ""}`} onClick={() => setFeedTab("foryou")}>
          ✨ For You
        </button>
        <button className={`feed-tab ${feedTab === "following" ? "active" : ""}`} onClick={() => setFeedTab("following")}>
          👥 Following
        </button>
      </div>

      {posts.length === 0
        ? <div className="empty">
            <div className="empty-icon">{feedTab === "foryou" ? "🌍" : "👥"}</div>
            <div className="empty-title">{feedTab === "foryou" ? "no posts yet" : "nothing here yet"}</div>
            <p>{feedTab === "foryou" ? "be the first to post something 🔥" : "follow people to see their posts"}</p>
          </div>
        : posts.map((p, i) => (
            <div key={p.id} style={{position:"relative"}}>
              {/* Hot badge on For You tab for top liked posts */}
              {feedTab === "foryou" && (p.likes?.length || 0) >= 3 && (
                <div style={{position:"absolute",top:"0.85rem",right:"1rem",zIndex:10}}>
                  <span className="hot-badge">🔥 hot</span>
                </div>
              )}
              <PostCard post={p} currentUser={currentUser} onNav={onNav} toast={toast} onHashtagClick={setActiveTag} />
            </div>
          ))
      }
    </div>
  );
}

// ─── HASHTAG VIEW ─────────────────────────────────────────────────────────────
function HashtagView({ tag, currentUser, onNav, onBack, toast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(postsCol(), orderBy("ts", "desc"), limit(100));
    return onSnapshot(q, snap => {
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.hashtags?.includes(tag));
      setPosts(filtered);
      setLoading(false);
    });
  }, [tag]);

  return (
    <div>
      <button className="back" onClick={onBack}><Icon.Back /> back</button>
      <div className="hashtag-header">
        <div className="hashtag-title">{tag}</div>
        <div className="hashtag-sub">{loading ? "loading..." : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}</div>
      </div>
      {loading
        ? <div className="empty"><div className="spinner" style={{margin:"2rem auto"}} /></div>
        : posts.length === 0
          ? <div className="empty"><div className="empty-icon">🏷️</div><div className="empty-title">no posts yet</div><p>be the first to use {tag}</p></div>
          : posts.map(p => <PostCard key={p.id} post={p} currentUser={currentUser} onNav={onNav} toast={toast} onHashtagClick={() => {}} />)
      }
    </div>
  );
}

// ─── EXPLORE VIEW ─────────────────────────────────────────────────────────────
function ExploreView({ currentUser, onNav, toast, onRefresh }) {
  const [tab, setTab]       = useState("people");
  const [users, setUsers]   = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [q, setQ]           = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    getDocs(usersCol()).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser.id));
    });
  }, [currentUser.id]);

  useEffect(() => {
    if (tab !== "trending") return;
    setLoading(true);
    const q2 = query(postsCol(), orderBy("ts", "desc"), limit(200));
    return onSnapshot(q2, snap => {
      setAllPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [tab]);

  useEffect(() => { if (tab === "people") setLoading(false); }, [tab]);

  // compute trending hashtags from posts
  const trending = (() => {
    const counts = {};
    allPosts.forEach(p => (p.hashtags || []).forEach(h => { counts[h] = (counts[h] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  })();

  const filtered = q
    ? users.filter(u => u.name?.toLowerCase().includes(q.toLowerCase()) || u.handle?.toLowerCase().includes(q.toLowerCase()))
    : users;

  const toggle = async (uid) => {
    const meRef = doc(db, "users", currentUser.id);
    const themRef = doc(db, "users", uid);
    if (currentUser.following?.includes(uid)) {
      await updateDoc(meRef,   { following: arrayRemove(uid) });
      await updateDoc(themRef, { followers: arrayRemove(currentUser.id) });
      toast("Unfollowed");
    } else {
      await updateDoc(meRef,   { following: arrayUnion(uid) });
      await updateDoc(themRef, { followers: arrayUnion(currentUser.id) });
      toast("Following! 🔥");
    }
    onRefresh();
  };

  // Show hashtag page
  if (activeTag) return (
    <HashtagView tag={activeTag} currentUser={currentUser} onNav={onNav} toast={toast} onBack={() => setActiveTag(null)} />
  );

  return (
    <div>
      {/* Tabs */}
      <div className="tabs" style={{marginBottom:"1rem"}}>
        <button className={`tab-btn ${tab === "people" ? "active" : ""}`} onClick={() => { setTab("people"); setLoading(false); }}>People</button>
        <button className={`tab-btn ${tab === "trending" ? "active" : ""}`} onClick={() => setTab("trending")}>🏷️ Trending</button>
      </div>

      {/* People tab */}
      {tab === "people" && (
        <>
          <div className="search-wrap">
            <Icon.Explore />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="search people..." />
          </div>
          {filtered.length === 0
            ? <div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">no one found</div></div>
            : filtered.map(u => {
              const following = currentUser.following?.includes(u.id);
              return (
                <div key={u.id} className="card" style={{marginBottom:"0.6rem"}}>
                  <div className="user-row" style={{padding:0,border:"none"}}>
                    <Av user={u} onClick={() => onNav("profile", u.id)} />
                    <div className="user-info">
                      <div className="user-name" onClick={() => onNav("profile", u.id)}>{u.name}</div>
                      <div className="user-handle">@{u.handle}</div>
                      {u.bio && <div style={{fontSize:"0.78rem",color:"var(--sub)",marginTop:"0.2rem"}}>{u.bio}</div>}
                    </div>
                    <button className={`btn ${following ? "btn-following" : "btn-follow"}`} onClick={() => toggle(u.id)}>
                      {following ? "following" : "+ follow"}
                    </button>
                  </div>
                </div>
              );
            })
          }
        </>
      )}

      {/* Trending tab */}
      {tab === "trending" && (
        loading
          ? <div className="empty"><div className="spinner" style={{margin:"3rem auto"}} /></div>
          : trending.length === 0
            ? <div className="empty">
                <div className="empty-icon">🏷️</div>
                <div className="empty-title">no hashtags yet</div>
                <p>use #hashtags in your posts to see them trend</p>
              </div>
            : <>
                <div className="section-label">Trending Hashtags</div>
                {trending.map(([tag, count], i) => (
                  <div key={tag} className="trending-item" onClick={() => setActiveTag(tag)}>
                    <div className={`trending-rank ${i < 3 ? "top" : ""}`}>#{i + 1}</div>
                    <div style={{flex:1}}>
                      <div className="trending-tag">{tag}</div>
                      <div className="trending-count">{count} post{count !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{color:"var(--muted)",fontSize:"0.75rem"}}>→</div>
                  </div>
                ))}
              </>
      )}
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function ProfileView({ uid, currentUser, onNav, toast, onRefresh }) {
  const [user, setUser]     = useState(null);
  const [posts, setPosts]   = useState([]);
  const [tab, setTab]       = useState("posts");
  const [editing, setEditing] = useState(false);
  const [followerUsers, setFollowerUsers]   = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    getUser(uid).then(setUser);
    const q = query(postsCol(), orderBy("ts", "desc"), limit(100));
    return onSnapshot(q, snap => {
      const filtered = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.uid === uid);
      setPosts(filtered);
    });
  }, [uid]);

  useEffect(() => {
    if (!user) return;
    if (tab === "followers" && user.followers?.length) {
      Promise.all(user.followers.map(getUser)).then(r => setFollowerUsers(r.filter(Boolean)));
    }
    if (tab === "following" && user.following?.length) {
      Promise.all(user.following.map(getUser)).then(r => setFollowingUsers(r.filter(Boolean)));
    }
  }, [tab, user]);

  // Re-fetch user on refresh
  useEffect(() => { getUser(uid).then(setUser); }, [uid, currentUser]);

  if (!user) return <div className="empty"><div className="spinner" style={{margin:"3rem auto"}} /></div>;

  const isMe = currentUser?.id === uid;
  const following = currentUser?.following?.includes(uid);

  const toggle = async () => {
    const meRef   = doc(db, "users", currentUser.id);
    const themRef = doc(db, "users", uid);
    if (following) {
      await updateDoc(meRef,   { following: arrayRemove(uid) });
      await updateDoc(themRef, { followers: arrayRemove(currentUser.id) });
      toast("Unfollowed");
    } else {
      await updateDoc(meRef,   { following: arrayUnion(uid) });
      await updateDoc(themRef, { followers: arrayUnion(currentUser.id) });
      toast("Following! 🔥");
    }
    onRefresh();
    getUser(uid).then(setUser);
  };

  return (
    <div>
      {editing && <EditProfileModal currentUser={currentUser} onClose={() => setEditing(false)} onSave={() => { onRefresh(); getUser(uid).then(setUser); }} />}
      <button className="back" onClick={() => onNav("feed")}><Icon.Back /> back</button>
      <div className="profile-banner" />
      <div className="profile-body">
        <div className="profile-av-wrap">
          <div className="av-upload-ring" style={{cursor: isMe ? "pointer" : "default"}} onClick={() => isMe && setEditing(true)}>
            <Av user={user} size="av-lg" />
            {isMe && <div className="av-upload-overlay">✏</div>}
            {isMe && <div className="av-edit-badge">✏</div>}
          </div>
          {isMe
            ? <button className="btn btn-ghost" style={{fontSize:"0.8rem",padding:"0.4rem 1rem"}} onClick={() => setEditing(true)}>edit profile</button>
            : <button className={`btn ${following ? "btn-following" : "btn-follow"}`} onClick={toggle}>{following ? "following" : "+ follow"}</button>
          }
        </div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-handle">@{user.handle}</div>
        {user.bio && <div className="profile-bio">{user.bio}</div>}
        <div className="profile-stats">
          <div><div className="pstat-num">{posts.length}</div><div className="pstat-label">posts</div></div>
          <div><div className="pstat-num">{user.followers?.length || 0}</div><div className="pstat-label">followers</div></div>
          <div><div className="pstat-num">{user.following?.length || 0}</div><div className="pstat-label">following</div></div>
        </div>
      </div>

      <div className="tabs">
        {["posts","followers","following"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "posts" && (
        activeTag
          ? <HashtagView tag={activeTag} currentUser={currentUser} onNav={onNav} toast={toast} onBack={() => setActiveTag(null)} />
          : posts.length === 0
            ? <div className="empty"><div className="empty-icon">✨</div><div className="empty-title">no posts yet</div></div>
            : posts.map(p => <PostCard key={p.id} post={p} currentUser={currentUser} onNav={onNav} toast={toast} onHashtagClick={setActiveTag} />)
      )}

      {(tab === "followers" || tab === "following") && (() => {
        const list = tab === "followers" ? followerUsers : followingUsers;
        return list.length === 0
          ? <div className="empty"><div className="empty-icon">👀</div><div className="empty-title">nobody here yet</div></div>
          : list.map(u => (
            <div key={u.id} className="card" style={{marginBottom:"0.6rem"}}>
              <div className="user-row" style={{padding:0,border:"none"}}>
                <Av user={u} onClick={() => onNav("profile", u.id)} />
                <div className="user-info">
                  <div className="user-name" onClick={() => onNav("profile", u.id)}>{u.name}</div>
                  <div className="user-handle">@{u.handle}</div>
                </div>
                {currentUser.id !== u.id && (
                  <button className={`btn ${currentUser.following?.includes(u.id) ? "btn-following" : "btn-follow"}`}
                    onClick={async () => {
                      const meRef = doc(db, "users", currentUser.id);
                      const themRef = doc(db, "users", u.id);
                      if (currentUser.following?.includes(u.id)) {
                        await updateDoc(meRef, { following: arrayRemove(u.id) });
                        await updateDoc(themRef, { followers: arrayRemove(currentUser.id) });
                        toast("Unfollowed");
                      } else {
                        await updateDoc(meRef, { following: arrayUnion(u.id) });
                        await updateDoc(themRef, { followers: arrayUnion(currentUser.id) });
                        toast("Following! 🔥");
                      }
                      onRefresh();
                    }}>
                    {currentUser.following?.includes(u.id) ? "following" : "+ follow"}
                  </button>
                )}
              </div>
            </div>
          ));
      })()}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser]       = useState(undefined); // undefined = loading
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView]               = useState("feed");
  const [profileId, setProfileId]     = useState(null);
  const [toastMsg, setToastMsg]       = useState("");

  const toast = useCallback(msg => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); }, []);

  const loadCurrentUser = useCallback(async (uid) => {
    const u = await getUser(uid);
    setCurrentUser(u);
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) await loadCurrentUser(user.uid);
      else setCurrentUser(null);
    });
  }, [loadCurrentUser]);

  // Real-time listener for currentUser doc (so follow counts update live)
  useEffect(() => {
    if (!authUser) return;
    return onSnapshot(doc(db, "users", authUser.uid), snap => {
      if (snap.exists()) setCurrentUser({ id: snap.id, ...snap.data() });
    });
  }, [authUser]);

  const nav = useCallback((v, id = null) => {
    setView(v); if (id) setProfileId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLogout = async () => { await signOut(auth); setView("feed"); };

  // Loading state
  if (authUser === undefined) {
    return <><CSS /><div className="loading-screen"><div className="spinner" /><div style={{color:"var(--sub)",fontSize:"0.85rem"}}>loading...</div></div></>;
  }

  // Not logged in
  if (!authUser || !currentUser) return <><CSS /><Auth /></>;

  const NAV_ITEMS = [
    { id: "feed",    label: "home",    Icon: Icon.Home },
    { id: "explore", label: "explore", Icon: Icon.Explore },
    { id: "profile", label: "me",      Icon: Icon.Profile, action: () => nav("profile", currentUser.id) },
  ];

  return (
    <div className="app">
      <CSS />

      <header className="topbar">
        <div className="logo" onClick={() => nav("feed")}>GenzVibe</div>
        <div className="topbar-right">
          <Av user={currentUser} onClick={() => nav("profile", currentUser.id)} />
          <button className="btn btn-ghost" style={{borderRadius:"100px",padding:"0.3rem 0.8rem",fontSize:"0.75rem"}} onClick={handleLogout}>
            out
          </button>
        </div>
      </header>

      <div className="shell">
        <nav className="sidebar">
          {NAV_ITEMS.map(n => (
            <button key={n.id} className={`snav-btn ${view === n.id ? "active" : ""}`}
              onClick={n.action || (() => nav(n.id))}>
              <n.Icon /> <span>{n.label}</span>
            </button>
          ))}
          <div className="sidebar-card" style={{marginTop:"1rem",padding:"0.85rem",background:"var(--card)",border:"1px solid var(--border)",borderRadius:"var(--radius)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.6rem"}}>
              <Av user={currentUser} size="av-sm" onClick={() => nav("profile", currentUser.id)} />
              <div style={{minWidth:0}}>
                <div style={{fontSize:"0.82rem",fontWeight:700,fontFamily:"var(--font-head)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.name}</div>
                <div style={{fontSize:"0.7rem",color:"var(--sub)"}}>@{currentUser.handle}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"1rem",fontSize:"0.75rem",color:"var(--sub)"}}>
              <span><b style={{color:"var(--text)"}}>{currentUser.following?.length || 0}</b> following</span>
              <span><b style={{color:"var(--text)"}}>{currentUser.followers?.length || 0}</b> followers</span>
            </div>
          </div>
        </nav>

        <main className="main">
          {view === "feed" && <FeedView currentUser={currentUser} onNav={nav} toast={toast} />}
          {view === "explore" && <ExploreView currentUser={currentUser} onNav={nav} toast={toast} onRefresh={() => loadCurrentUser(authUser.uid)} />}
          {view === "profile" && profileId && <ProfileView uid={profileId} currentUser={currentUser} onNav={nav} toast={toast} onRefresh={() => loadCurrentUser(authUser.uid)} />}
        </main>
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(n => (
          <button key={n.id} className={`bnav-btn ${view === n.id ? "active" : ""}`}
            onClick={n.action || (() => nav(n.id))}>
            <n.Icon /> <span>{n.label}</span>
          </button>
        ))}
      </nav>

      <Toast msg={toastMsg} />
    </div>
  );
}