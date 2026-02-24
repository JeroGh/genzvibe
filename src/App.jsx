import { useState, useCallback, useRef, useEffect } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #0a0a0f;
      --surface:  #111118;
      --card:     #16161f;
      --border:   #1e1e2e;
      --border2:  #2a2a3a;
      --text:     #eeeef5;
      --sub:      #7070a0;
      --muted:    #3a3a55;
      --accent:   #7c3aed;
      --accent2:  #a855f7;
      --glow:     rgba(124,58,237,0.18);
      --green:    #22c55e;
      --red:      #f43f5e;
      --font-head: 'Syne', sans-serif;
      --font-body: 'Manrope', sans-serif;
      --radius:   14px;
      --radius-sm: 8px;
    }

    html { height: 100%; background: var(--bg); }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      min-height: 100%;
      -webkit-font-smoothing: antialiased;
    }
    #root { min-height: 100vh; }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 4px; }

    /* ── LAYOUT ── */
    .app { display: flex; flex-direction: column; min-height: 100vh; }

    .topbar {
      position: sticky; top: 0; z-index: 200;
      background: rgba(10,10,15,0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      height: 56px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.25rem;
    }
    .logo {
      font-family: var(--font-head);
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      cursor: pointer;
      user-select: none;
    }
    .topbar-right { display: flex; align-items: center; gap: 0.5rem; }
    .avatar-btn {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700;
      font-family: var(--font-head);
      border: none; cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      flex-shrink: 0;
    }
    .avatar-btn:hover { transform: scale(1.07); box-shadow: 0 0 0 2px var(--accent2); }

    /* ── BOTTOM NAV (mobile) ── */
    .bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: rgba(10,10,15,0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-around; align-items: center;
      height: 60px;
      padding-bottom: env(safe-area-inset-bottom);
    }
    .bnav-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px;
      background: none; border: none; cursor: pointer;
      color: var(--sub); font-size: 0.55rem; font-family: var(--font-body);
      text-transform: uppercase; letter-spacing: 0.08em;
      transition: color 0.15s;
      padding: 0.5rem 0;
    }
    .bnav-btn.active { color: var(--accent2); }
    .bnav-btn svg { width: 22px; height: 22px; }

    /* ── DESKTOP SIDEBAR ── */
    .shell {
      display: flex;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
      padding: 1.5rem 1rem 5rem;
      gap: 1.5rem;
    }
    .sidebar {
      width: 220px; flex-shrink: 0;
      display: flex; flex-direction: column; gap: 0.35rem;
      position: sticky; top: 70px; align-self: flex-start;
    }
    .snav-btn {
      display: flex; align-items: center; gap: 0.75rem;
      background: none; border: none; cursor: pointer;
      color: var(--sub); font-family: var(--font-body);
      font-size: 0.9rem; font-weight: 500;
      padding: 0.65rem 0.85rem; border-radius: var(--radius-sm);
      transition: all 0.15s; text-align: left; width: 100%;
    }
    .snav-btn:hover { background: var(--card); color: var(--text); }
    .snav-btn.active { background: var(--card); color: var(--text); }
    .snav-btn.active svg { color: var(--accent2); }
    .snav-btn svg { width: 20px; height: 20px; flex-shrink: 0; }

    .main { flex: 1; min-width: 0; }

    /* ── CARDS ── */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.1rem 1.25rem;
      transition: border-color 0.2s;
    }
    .card:hover { border-color: var(--border2); }

    /* ── COMPOSE ── */
    .compose {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
    }
    .compose-top { display: flex; gap: 0.85rem; align-items: flex-start; }
    .compose textarea {
      flex: 1; background: none; border: none; outline: none; resize: none;
      color: var(--text); font-family: var(--font-body);
      font-size: 0.95rem; line-height: 1.6;
      min-height: 64px; padding-top: 0.2rem;
    }
    .compose textarea::placeholder { color: var(--muted); }
    .compose-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 0.75rem; padding-top: 0.75rem;
      border-top: 1px solid var(--border);
    }
    .char { font-size: 0.75rem; color: var(--sub); }
    .char.warn { color: var(--red); }

    /* ── BUTTONS ── */
    .btn {
      font-family: var(--font-body); font-weight: 600;
      border: none; cursor: pointer;
      border-radius: 100px; transition: all 0.15s;
      display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white; padding: 0.5rem 1.25rem; font-size: 0.85rem;
    }
    .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 20px var(--glow); }
    .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-ghost {
      background: var(--surface); color: var(--sub);
      padding: 0.4rem 1rem; font-size: 0.8rem;
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
    .btn-follow {
      background: var(--accent); color: white;
      padding: 0.35rem 0.9rem; font-size: 0.78rem;
    }
    .btn-follow:hover { background: var(--accent2); }
    .btn-following {
      background: transparent; color: var(--sub);
      border: 1px solid var(--border2);
      padding: 0.35rem 0.9rem; font-size: 0.78rem;
    }
    .btn-following:hover { border-color: var(--red); color: var(--red); }
    .btn-icon {
      background: none; border: none; cursor: pointer;
      color: var(--sub); display: flex; align-items: center; gap: 0.35rem;
      font-size: 0.82rem; font-family: var(--font-body);
      padding: 0.35rem 0.6rem; border-radius: var(--radius-sm);
      transition: all 0.15s;
    }
    .btn-icon:hover { background: var(--surface); color: var(--text); }
    .btn-icon.liked { color: var(--red); }
    .btn-icon.liked:hover { background: rgba(244,63,94,0.1); }
    .btn-icon svg { width: 17px; height: 17px; }

    /* ── POST ── */
    .post { margin-bottom: 0.75rem; animation: fadeUp 0.25s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .post-head { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
    .post-meta { flex: 1; min-width: 0; }
    .post-name {
      font-family: var(--font-head); font-size: 0.9rem; font-weight: 700;
      cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .post-name:hover { color: var(--accent2); }
    .post-handle { font-size: 0.75rem; color: var(--sub); }
    .post-time { font-size: 0.72rem; color: var(--muted); }
    .post-body { font-size: 0.92rem; line-height: 1.65; margin-bottom: 0.85rem; color: var(--text); word-break: break-word; }
    .post-actions { display: flex; gap: 0.25rem; margin: -0.35rem; }

    /* ── COMMENTS ── */
    .comments {
      margin-top: 0.85rem; padding-top: 0.85rem;
      border-top: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 0.65rem;
    }
    .comment { display: flex; gap: 0.65rem; }
    .comment-body { flex: 1; }
    .comment-author { font-size: 0.78rem; font-weight: 600; font-family: var(--font-head); margin-bottom: 0.15rem; cursor: pointer; }
    .comment-author:hover { color: var(--accent2); }
    .comment-text { font-size: 0.82rem; color: var(--sub); line-height: 1.5; }
    .comment-input { display: flex; gap: 0.65rem; align-items: center; margin-top: 0.65rem; }
    .comment-input input {
      flex: 1; background: var(--surface); border: 1px solid var(--border);
      border-radius: 100px; padding: 0.5rem 1rem;
      font-family: var(--font-body); font-size: 0.82rem; color: var(--text);
      outline: none; transition: border-color 0.15s;
    }
    .comment-input input:focus { border-color: var(--accent); }
    .comment-input input::placeholder { color: var(--muted); }

    /* ── AVATAR ── */
    .av {
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-family: var(--font-head); font-weight: 700; flex-shrink: 0; cursor: pointer;
      transition: transform 0.15s;
    }
    .av:hover { transform: scale(1.05); }
    .av-md { width: 40px; height: 40px; font-size: 0.78rem; }
    .av-sm { width: 30px; height: 30px; font-size: 0.65rem; }
    .av-lg { width: 60px; height: 60px; font-size: 1.1rem; }

    /* ── USER ROW ── */
    .user-row {
      display: flex; align-items: center; gap: 0.85rem;
      padding: 0.7rem 0; border-bottom: 1px solid var(--border);
    }
    .user-row:last-child { border-bottom: none; }
    .user-info { flex: 1; min-width: 0; }
    .user-name { font-size: 0.88rem; font-weight: 600; font-family: var(--font-head); cursor: pointer; }
    .user-name:hover { color: var(--accent2); }
    .user-handle { font-size: 0.73rem; color: var(--sub); }

    /* ── PROFILE ── */
    .profile-banner {
      height: 110px; border-radius: var(--radius) var(--radius) 0 0;
      background: linear-gradient(135deg, #1a0533, #0f0520, #1a0a2e);
      position: relative; overflow: hidden;
    }
    .profile-banner::after {
      content: ''; position: absolute; inset: 0;
      background: repeating-linear-gradient(
        60deg, transparent, transparent 30px,
        rgba(124,58,237,0.04) 30px, rgba(124,58,237,0.04) 31px
      );
    }
    .profile-body { background: var(--card); border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--radius) var(--radius); padding: 0 1.25rem 1.25rem; margin-bottom: 1rem; }
    .profile-av-wrap { margin-top: -30px; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: flex-end; }
    .profile-name { font-family: var(--font-head); font-size: 1.2rem; font-weight: 800; }
    .profile-handle { font-size: 0.82rem; color: var(--sub); margin-bottom: 0.5rem; }
    .profile-bio { font-size: 0.88rem; color: var(--sub); line-height: 1.5; margin-bottom: 0.85rem; }
    .profile-stats { display: flex; gap: 1.5rem; }
    .pstat-num { font-family: var(--font-head); font-size: 1rem; font-weight: 700; }
    .pstat-label { font-size: 0.7rem; color: var(--sub); text-transform: uppercase; letter-spacing: 0.08em; }

    /* ── TABS ── */
    .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
    .tab-btn {
      flex: 1; background: none; border: none; cursor: pointer;
      color: var(--sub); font-family: var(--font-body); font-size: 0.82rem; font-weight: 500;
      padding: 0.75rem; border-bottom: 2px solid transparent;
      transition: all 0.15s; margin-bottom: -1px;
    }
    .tab-btn.active { color: var(--text); border-bottom-color: var(--accent2); }

    /* ── AUTH ── */
    .auth-screen {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
      background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), var(--bg);
    }
    .auth-box {
      width: 100%; max-width: 380px;
      background: var(--card); border: 1px solid var(--border);
      border-radius: 20px; padding: 2rem 1.75rem;
    }
    .auth-logo { font-family: var(--font-head); font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #a855f7, #7c3aed);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .auth-sub { color: var(--sub); font-size: 0.88rem; margin-bottom: 1.75rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.73rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sub); margin-bottom: 0.4rem; }
    .field input, .field select {
      width: 100%; background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 0.7rem 0.9rem;
      font-family: var(--font-body); font-size: 16px; color: var(--text);
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
      appearance: none;
    }
    .field input:focus, .field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
    .field select option { background: var(--surface); }
    .auth-err { color: var(--red); font-size: 0.8rem; margin-bottom: 0.75rem; }
    .auth-toggle { margin-top: 1.25rem; text-align: center; font-size: 0.83rem; color: var(--sub); }
    .auth-toggle button { background: none; border: none; cursor: pointer; color: var(--accent2); font-family: var(--font-body); font-weight: 600; }

    /* ── SEARCH ── */
    .search-wrap { position: relative; margin-bottom: 1rem; }
    .search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--muted); width: 16px; height: 16px; }
    .search-wrap input {
      width: 100%; background: var(--card); border: 1px solid var(--border);
      border-radius: 100px; padding: 0.6rem 1rem 0.6rem 2.5rem;
      font-family: var(--font-body); font-size: 16px; color: var(--text); outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-wrap input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--glow); }
    .search-wrap input::placeholder { color: var(--muted); }

    /* ── EMPTY STATE ── */
    .empty { text-align: center; padding: 3rem 1rem; color: var(--sub); }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .empty-title { font-family: var(--font-head); font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.35rem; }

    /* ── TOAST ── */
    .toast {
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: var(--card); border: 1px solid var(--border2);
      color: var(--text); padding: 0.65rem 1.25rem; border-radius: 100px;
      font-size: 0.83rem; z-index: 9999; white-space: nowrap;
      animation: toastIn 0.2s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

    /* ── SECTION LABEL ── */
    .section-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 0.75rem; }

    /* ── GLOW DOT ── */
    .online-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); display: inline-block; margin-right: 4px; box-shadow: 0 0 6px var(--green); }

    /* ── MODAL ── */
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal {
      background: var(--card); border: 1px solid var(--border2);
      border-radius: 20px; width: 100%; max-width: 400px;
      padding: 1.75rem; position: relative;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-title { font-family: var(--font-head); font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; }
    .modal-close {
      position: absolute; top: 1.1rem; right: 1.1rem;
      background: var(--surface); border: 1px solid var(--border);
      color: var(--sub); width: 30px; height: 30px; border-radius: 50%;
      cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .modal-close:hover { color: var(--text); border-color: var(--border2); }

    /* ── AVATAR UPLOAD ── */
    .av-upload-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .av-upload-ring {
      position: relative; cursor: pointer;
    }
    .av-upload-ring:hover .av-upload-overlay { opacity: 1; }
    .av-upload-overlay {
      position: absolute; inset: 0; border-radius: 50%;
      background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
      font-size: 1.2rem;
    }
    .av-upload-label {
      font-size: 0.75rem; color: var(--sub);
      text-align: center; line-height: 1.4;
    }
    .av-img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
    }
    .av-upload-input { display: none; }

    /* edit pencil badge */
    .av-edit-badge {
      position: absolute; bottom: 2px; right: 2px;
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--accent); border: 2px solid var(--card);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.6rem; color: white; pointer-events: none;
    }

    /* ── BACK ── */
    .back { background: none; border: none; cursor: pointer; color: var(--sub); font-family: var(--font-body); font-size: 0.82rem; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1rem; transition: color 0.15s; }
    .back:hover { color: var(--text); }
    .back svg { width: 16px; height: 16px; }

    /* ════════════════════════════════════════
       RESPONSIVE — mobile-first, every device
       ════════════════════════════════════════ */

    /* ── BASE (all screens) ── */
    * { -webkit-tap-highlight-color: transparent; }
    img { max-width: 100%; display: block; }
    button { touch-action: manipulation; }

    /* ── XS: tiny phones 320–374px ── */
    @media (max-width: 374px) {
      :root { --radius: 10px; --radius-sm: 6px; }
      .topbar { padding: 0 0.75rem; height: 50px; }
      .logo { font-size: 1.05rem; }
      .shell { padding: 0.6rem 0.5rem 5rem; }
      .card { padding: 0.85rem 0.9rem; }
      .compose { padding: 0.75rem 0.9rem; }
      .compose textarea { font-size: 15px; min-height: 56px; }
      .post-body { font-size: 0.87rem; }
      .post-name { font-size: 0.82rem; }
      .btn-icon { padding: 0.3rem 0.45rem; font-size: 0.75rem; }
      .btn-icon svg { width: 15px; height: 15px; }
      .av-md { width: 34px; height: 34px; font-size: 0.68rem; }
      .av-lg { width: 52px; height: 52px; font-size: 0.95rem; }
      .profile-banner { height: 80px; }
      .profile-av-wrap { margin-top: -26px; }
      .profile-name { font-size: 1rem; }
      .profile-stats { gap: 0.85rem; }
      .pstat-num { font-size: 0.9rem; }
      .auth-box { padding: 1.5rem 1.25rem; border-radius: 16px; }
      .auth-logo { font-size: 1.5rem; }
      .modal { padding: 1.25rem 1rem; }
      .bnav-btn svg { width: 20px; height: 20px; }
      .bnav-btn { font-size: 0.5rem; }
      .tab-btn { padding: 0.6rem 0.5rem; font-size: 0.75rem; }
      .comment-input input { padding: 0.45rem 0.75rem; font-size: 14px; }
      .btn-follow, .btn-following { padding: 0.3rem 0.7rem; font-size: 0.72rem; }
    }

    /* ── SM: phones 375–639px ── */
    @media (max-width: 639px) {
      .sidebar { display: none; }
      .shell { padding: 0.85rem 0.75rem 5.5rem; gap: 0; }
      .profile-stats { gap: 1.1rem; flex-wrap: wrap; }
      .post-actions { gap: 0; }
      /* prevent iOS zoom on inputs */
      input, textarea, select { font-size: 16px !important; }
      /* full-width cards feel more native */
      .card { border-radius: 12px; }
      .compose { border-radius: 12px; }
      /* profile banner shorter on mobile */
      .profile-banner { height: 90px; }
      /* toast sits above bottom nav */
      .toast { bottom: 72px; }
      /* modal slides up from bottom on mobile */
      .modal-backdrop { align-items: flex-end; padding: 0; }
      .modal {
        border-radius: 20px 20px 0 0;
        max-width: 100%;
        padding-bottom: calc(1.75rem + env(safe-area-inset-bottom));
      }
      /* comment input tighter */
      .comment-input { gap: 0.45rem; }
      /* search bar */
      .search-wrap input { padding: 0.65rem 1rem 0.65rem 2.4rem; }
      /* user cards in explore */
      .user-name { font-size: 0.85rem; }
      .btn-follow, .btn-following { padding: 0.32rem 0.8rem; font-size: 0.75rem; }
      /* auth screen padding */
      .auth-screen { align-items: flex-end; padding: 0; }
      .auth-box {
        border-radius: 24px 24px 0 0;
        max-width: 100%;
        padding: 1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom));
      }
    }

    /* ── Show bottom nav only on mobile ── */
    @media (min-width: 640px) {
      .bottom-nav { display: none; }
      .shell { padding-bottom: 2rem; }
    }

    /* ── MD: tablets 640–1023px ── */
    @media (min-width: 640px) and (max-width: 1023px) {
      .shell { max-width: 720px; padding: 1.25rem 1rem 2rem; gap: 1rem; }
      .sidebar { width: 180px; }
      .snav-btn { font-size: 0.82rem; padding: 0.55rem 0.7rem; }
      /* hide sidebar text labels, show icon-only on narrow tablets */
    }

    /* ── MD narrow: hide sidebar label text on 640–767px ── */
    @media (min-width: 640px) and (max-width: 767px) {
      .sidebar { width: 56px; }
      .snav-btn { justify-content: center; padding: 0.65rem; }
      .snav-btn span { display: none; }
      .sidebar-card { display: none; }
    }

    /* ── LG: small laptops 1024–1279px ── */
    @media (min-width: 1024px) {
      .shell { max-width: 900px; padding: 1.5rem 1.5rem 2rem; gap: 1.5rem; }
      .sidebar { width: 200px; }
    }

    /* ── XL: desktop 1280px+ ── */
    @media (min-width: 1280px) {
      .shell { max-width: 1000px; gap: 2rem; }
      .sidebar { width: 220px; }
      .card { padding: 1.2rem 1.4rem; }
    }

    /* ── Safe area for notched phones ── */
    @supports (padding-top: env(safe-area-inset-top)) {
      .topbar { padding-top: env(safe-area-inset-top); height: calc(56px + env(safe-area-inset-top)); }
      .bottom-nav {
        height: calc(60px + env(safe-area-inset-bottom));
        padding-bottom: env(safe-area-inset-bottom);
      }
    }

    /* ── Landscape phones ── */
    @media (max-width: 767px) and (orientation: landscape) {
      .bottom-nav { height: 48px; }
      .bnav-btn { font-size: 0; } /* hide labels in landscape to save space */
      .bnav-btn svg { width: 20px; height: 20px; }
      .shell { padding-bottom: 4rem; }
      .auth-screen { align-items: center; }
      .auth-box { border-radius: 20px; max-width: 420px; padding: 1.25rem 1.5rem; }
      .modal-backdrop { align-items: center; padding: 1rem; }
      .modal { border-radius: 20px; max-width: 400px; }
      .profile-banner { height: 70px; }
    }

    /* ── Hover only on devices that support it (not touch) ── */
    @media (hover: hover) {
      .card:hover { border-color: var(--border2); }
      .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 20px var(--glow); }
      .snav-btn:hover { background: var(--card); color: var(--text); }
      .post-name:hover { color: var(--accent2); }
    }
    @media (hover: none) {
      .card:hover { border-color: var(--border); }
      .btn-primary:active { opacity: 0.85; }
      .btn-follow:active { opacity: 0.8; }
    }
  `}</style>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Explore: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Profile: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Heart: ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Comment: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ─── AVATAR COLORS ─────────────────────────────────────────────────────────────
const AV_COLORS = [
  ["#7c3aed","#a855f7"], ["#db2777","#f472b6"], ["#0891b2","#22d3ee"],
  ["#059669","#34d399"], ["#d97706","#fbbf24"], ["#dc2626","#f87171"],
];
function avColor(name) { return AV_COLORS[(name.charCodeAt(0) || 0) % AV_COLORS.length]; }
function Av({ user, size = "av-md", onClick }) {
  const [a, b] = avColor(user.name);
  if (user.imgUrl) {
    return (
      <div className={`av ${size}`} onClick={onClick} style={{overflow:"hidden",background:`linear-gradient(135deg,${a},${b})`}}>
        <img src={user.imgUrl} alt={user.name} className="av-img" />
      </div>
    );
  }
  return (
    <div className={`av ${size}`} onClick={onClick}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})`, color: "white" }}>
      {user.av}
    </div>
  );
}

// ─── TIME ────────────────────────────────────────────────────────────────────
function ago(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return "now";
  if (d < 3600000) return Math.floor(d / 60000) + "m";
  if (d < 86400000) return Math.floor(d / 3600000) + "h";
  return Math.floor(d / 86400000) + "d";
}

// ─── IN-MEMORY DATABASE ──────────────────────────────────────────────────────
const VIBES = ["✨","🔥","💀","😭","🫶","💜","🤙","🫠","💯","🎯","🧠","👀"];

const SEED_USERS = [
  { id:"u1", name:"Zara Moon",    handle:"zaramoon",  bio:"chaotic good energy 🌙", av:"ZM", imgUrl:null, followers:["u2","u3"], following:["u2"] },
  { id:"u2", name:"Kai Drip",     handle:"kaidrip",   bio:"no cap just vibes 🔥",  av:"KD", imgUrl:null, followers:["u1"], following:["u1","u3"] },
  { id:"u3", name:"Mia Flux",     handle:"miaflux",   bio:"main character era 💜",  av:"MF", imgUrl:null, followers:["u1","u2"], following:[] },
];

const SEED_POSTS = [
  { id:"p1", uid:"u1", text:"hot take: sleep is the most underrated productivity hack fr fr 😭💀", likes:["u2","u3"], comments:[{ id:"c1", uid:"u2", text:"no literally bestie", ts: Date.now()-1200000 }], ts: Date.now()-7200000 },
  { id:"p2", uid:"u2", text:"we need to normalize saying 'i don't know' instead of making stuff up. that's the real big brain move 🧠", likes:["u1"], comments:[], ts: Date.now()-3600000 },
  { id:"p3", uid:"u3", text:"ok so i just realized that every 'limited time offer' is just marketing manipulation and now i can't unsee it 👀🎯", likes:["u1","u2"], comments:[{ id:"c2", uid:"u1", text:"mind blown rn", ts: Date.now()-600000 }], ts: Date.now()-1800000 },
  { id:"p4", uid:"u1", text:"reminder that you're allowed to change your mind. growth isn't betrayal 💯✨", likes:[], comments:[], ts: Date.now()-900000 },
];

class DB {
  constructor() {
    this.users = SEED_USERS.map(u => ({...u, followers:[...u.followers], following:[...u.following]}));
    this.posts = SEED_POSTS.map(p => ({...p, likes:[...p.likes], comments:[...p.comments]}));
    this.me = null;
  }
  user(id) { return this.users.find(u => u.id === id) || null; }
  allUsers() { return [...this.users]; }

  login(handle) {
    const u = this.users.find(u => u.handle === handle);
    if (!u) throw new Error("User not found");
    this.me = u; return {...u};
  }
  register({ name, handle, bio }) {
    if (this.users.find(u => u.handle === handle)) throw new Error("Handle taken");
    const u = { id:"u"+Date.now(), name, handle, bio: bio||"", av: name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(), imgUrl:null, followers:[], following:[] };
    this.users.push(u); this.me = u; return {...u};
  }
  logout() { this.me = null; }
  getMe() { return this.me ? this.users.find(u => u.id === this.me.id) : null; }

  feed() {
    const me = this.getMe(); if (!me) return [];
    const ids = [me.id, ...me.following];
    return [...this.posts].filter(p => ids.includes(p.uid)).sort((a,b) => b.ts - a.ts);
  }
  userPosts(uid) { return [...this.posts].filter(p => p.uid === uid).sort((a,b) => b.ts - a.ts); }

  post(text) {
    const me = this.getMe(); if (!me || !text.trim()) return;
    const p = { id:"p"+Date.now(), uid:me.id, text:text.trim(), likes:[], comments:[], ts:Date.now() };
    this.posts.unshift(p); return p;
  }
  deletePost(id) {
    const me = this.getMe(); if (!me) return;
    const i = this.posts.findIndex(p => p.id === id && p.uid === me.id);
    if (i !== -1) this.posts.splice(i, 1);
  }
  like(id) {
    const me = this.getMe(); if (!me) return;
    const p = this.posts.find(p => p.id === id); if (!p) return;
    if (p.likes.includes(me.id)) p.likes = p.likes.filter(x => x !== me.id);
    else p.likes.push(me.id);
  }
  comment(postId, text) {
    const me = this.getMe(); if (!me || !text.trim()) return;
    const p = this.posts.find(p => p.id === postId); if (!p) return;
    const c = { id:"c"+Date.now(), uid:me.id, text:text.trim(), ts:Date.now() };
    p.comments.push(c); return c;
  }
  follow(uid) {
    const me = this.getMe(); if (!me || me.id === uid) return;
    if (!me.following.includes(uid)) { me.following.push(uid); }
    const them = this.users.find(u => u.id === uid);
    if (them && !them.followers.includes(me.id)) them.followers.push(me.id);
  }
  unfollow(uid) {
    const me = this.getMe(); if (!me) return;
    me.following = me.following.filter(x => x !== uid);
    const them = this.users.find(u => u.id === uid);
    if (them) them.followers = them.followers.filter(x => x !== me.id);
  }
  updateProfile({ name, bio, imgUrl }) {
    const me = this.getMe(); if (!me) return;
    if (name && name.trim()) {
      me.name = name.trim();
      me.av = name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    }
    if (bio !== undefined) me.bio = bio;
    if (imgUrl !== undefined) me.imgUrl = imgUrl;
    return {...me};
  }
}
const db = new DB();

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg }) { return msg ? <div className="toast">{msg}</div> : null; }

// ─── POST CARD ────────────────────────────────────────────────────────────────
function PostCard({ post, onNav, onRefresh, toast }) {
  const author = db.user(post.uid);
  const me = db.getMe();
  if (!author || !me) return null;
  const liked = post.likes.includes(me.id);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef();

  const handleLike = () => { db.like(post.id); onRefresh(); };
  const handleComment = () => {
    if (!commentText.trim()) return;
    db.comment(post.id, commentText);
    setCommentText(""); onRefresh();
  };
  const handleDelete = () => { db.deletePost(post.id); toast("Deleted ✓"); onRefresh(); };

  return (
    <div className="card post">
      <div className="post-head">
        <Av user={author} onClick={() => onNav("profile", author.id)} />
        <div className="post-meta">
          <div className="post-name" onClick={() => onNav("profile", author.id)}>{author.name}</div>
          <span className="post-handle">@{author.handle}</span>
          <span className="post-time" style={{marginLeft:"0.4rem"}}>· {ago(post.ts)}</span>
        </div>
        {me.id === post.uid && (
          <button className="btn-icon" onClick={handleDelete} style={{marginLeft:"auto",fontSize:"0.75rem"}}>✕</button>
        )}
      </div>
      <div className="post-body">{post.text}</div>
      <div className="post-actions">
        <button className={`btn-icon ${liked ? "liked" : ""}`} onClick={handleLike}>
          <Icon.Heart filled={liked} /> {post.likes.length > 0 && post.likes.length}
        </button>
        <button className="btn-icon" onClick={() => { setShowComments(s => !s); setTimeout(() => inputRef.current?.focus(), 100); }}>
          <Icon.Comment /> {post.comments.length > 0 && post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {post.comments.map(c => {
            const cu = db.user(c.uid); if (!cu) return null;
            return (
              <div key={c.id} className="comment">
                <Av user={cu} size="av-sm" onClick={() => onNav("profile", cu.id)} />
                <div className="comment-body">
                  <div className="comment-author" onClick={() => onNav("profile", cu.id)}>{cu.name} <span style={{color:"var(--muted)",fontWeight:400}}>· {ago(c.ts)}</span></div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            );
          })}
          <div className="comment-input">
            <Av user={me} size="av-sm" />
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

// ─── COMPOSE ─────────────────────────────────────────────────────────────────
function Compose({ onPost }) {
  const me = db.getMe();
  const [text, setText] = useState("");
  const MAX = 280;
  const submit = () => { if (!text.trim()) return; db.post(text); setText(""); onPost(); };
  if (!me) return null;
  return (
    <div className="compose">
      <div className="compose-top">
        <Av user={me} />
        <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
          placeholder={`what's on your mind? ${VIBES[Math.floor(Math.random()*VIBES.length)]}`}
          maxLength={MAX} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }} />
      </div>
      <div className="compose-footer">
        <span className={`char ${text.length > MAX * 0.85 ? "warn" : ""}`}>{MAX - text.length}</span>
        <button className="btn btn-primary" onClick={submit} disabled={!text.trim()}>
          <Icon.Plus /> Post
        </button>
      </div>
    </div>
  );
}

// ─── FEED VIEW ────────────────────────────────────────────────────────────────
function FeedView({ onNav, onRefresh, toast, tick }) {
  const posts = db.feed();
  return (
    <div>
      <Compose onPost={onRefresh} />
      {posts.length === 0
        ? <div className="empty"><div className="empty-icon">👀</div><div className="empty-title">nothing here yet</div><p>follow people to see their posts</p></div>
        : posts.map(p => <PostCard key={p.id + tick} post={p} onNav={onNav} onRefresh={onRefresh} toast={toast} />)
      }
    </div>
  );
}

// ─── EXPLORE VIEW ─────────────────────────────────────────────────────────────
function ExploreView({ onNav, onRefresh, toast, tick }) {
  const [q, setQ] = useState("");
  const me = db.getMe();
  const users = db.allUsers().filter(u => u.id !== me?.id).filter(u =>
    !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.handle.toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (uid) => {
    const m = db.getMe();
    if (m?.following.includes(uid)) { db.unfollow(uid); toast("Unfollowed"); }
    else { db.follow(uid); toast("Following! 🔥"); }
    onRefresh();
  };

  return (
    <div>
      <div className="search-wrap">
        <Icon.Explore />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="search people..." />
      </div>
      <div className="section-label">People</div>
      {users.length === 0
        ? <div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">no one found</div></div>
        : users.map(u => {
          const following = me?.following.includes(u.id);
          return (
            <div key={u.id + tick} className="card" style={{marginBottom:"0.6rem"}}>
              <div className="user-row" style={{padding:0, border:"none"}}>
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
    </div>
  );
}

// ─── EDIT PROFILE MODAL ───────────────────────────────────────────────────────
function EditProfileModal({ onClose, onSave }) {
  const me = db.getMe();
  const [name, setName] = useState(me?.name || "");
  const [bio, setBio]   = useState(me?.bio  || "");
  const [imgUrl, setImgUrl] = useState(me?.imgUrl || null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { setImgUrl(ev.target.result); setLoading(false); };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    db.updateProfile({ name, bio, imgUrl });
    onSave();
    onClose();
  };

  // Close on backdrop click
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  const previewUser = { ...(me || {}), name: name || me?.name || "", imgUrl, av: name ? name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : me?.av };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal">
        <div className="modal-title">edit profile</div>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Avatar picker */}
        <div className="av-upload-wrap">
          <div className="av-upload-ring" onClick={() => fileRef.current?.click()}>
            <Av user={previewUser} size="av-lg" />
            <div className="av-upload-overlay">{loading ? "⏳" : "📷"}</div>
            <div className="av-edit-badge">✏</div>
          </div>
          <div className="av-upload-label">
            tap to upload photo<br/>
            <span style={{color:"var(--muted)",fontSize:"0.7rem"}}>jpg, png, gif · max 5mb</span>
          </div>
          <input ref={fileRef} className="av-upload-input" type="file" accept="image/*" onChange={handleFile} />
          {imgUrl && (
            <button className="btn btn-ghost" style={{fontSize:"0.75rem",padding:"0.3rem 0.85rem"}}
              onClick={() => setImgUrl(null)}>
              remove photo
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="field">
          <label>name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="your name" />
        </div>
        <div className="field">
          <label>bio</label>
          <input value={bio} onChange={e => setBio(e.target.value)} placeholder="something short and real" maxLength={100} />
        </div>

        <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
          <button className="btn btn-ghost" style={{flex:1,padding:"0.65rem"}} onClick={onClose}>cancel</button>
          <button className="btn btn-primary" style={{flex:2,padding:"0.65rem",borderRadius:"var(--radius-sm)"}} onClick={handleSave} disabled={!name.trim()}>
            save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────
function ProfileView({ uid, onNav, onRefresh, toast, tick }) {
  const [tab, setTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const user = db.user(uid);
  const me = db.getMe();
  if (!user || !me) return null;
  const isMe = me.id === uid;
  const following = me.following.includes(uid);
  const posts = db.userPosts(uid);
  const followers = user.followers.map(id => db.user(id)).filter(Boolean);
  const followingList = user.following.map(id => db.user(id)).filter(Boolean);

  const toggle = () => {
    if (following) { db.unfollow(uid); toast("Unfollowed"); }
    else { db.follow(uid); toast("Following! 🔥"); }
    onRefresh();
  };

  const handleSaved = () => { toast("Profile updated ✓"); onRefresh(); };

  return (
    <div>
      {editing && <EditProfileModal onClose={() => setEditing(false)} onSave={handleSaved} />}
      <button className="back" onClick={() => onNav("feed")}><Icon.Back /> back</button>
      <div className="profile-banner" />
      <div className="profile-body">
        <div className="profile-av-wrap">
          {/* Clickable avatar — opens edit if own profile */}
          <div className="av-upload-ring" style={{cursor: isMe ? "pointer" : "default"}}
            onClick={() => isMe && setEditing(true)}>
            <Av user={user} size="av-lg" />
            {isMe && <div className="av-upload-overlay">✏</div>}
            {isMe && <div className="av-edit-badge">✏</div>}
          </div>
          {isMe
            ? <button className="btn btn-ghost" style={{fontSize:"0.8rem",padding:"0.4rem 1rem"}} onClick={() => setEditing(true)}>edit profile</button>
            : <button className={`btn ${following ? "btn-following" : "btn-follow"}`} onClick={toggle}>
                {following ? "following" : "+ follow"}
              </button>
          }
        </div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-handle">@{user.handle}</div>
        {user.bio && <div className="profile-bio">{user.bio}</div>}
        <div className="profile-stats">
          <div><div className="pstat-num">{posts.length}</div><div className="pstat-label">posts</div></div>
          <div><div className="pstat-num">{user.followers.length}</div><div className="pstat-label">followers</div></div>
          <div><div className="pstat-num">{user.following.length}</div><div className="pstat-label">following</div></div>
        </div>
      </div>

      <div className="tabs">
        {["posts","followers","following"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "posts" && (
        posts.length === 0
          ? <div className="empty"><div className="empty-icon">✨</div><div className="empty-title">no posts yet</div></div>
          : posts.map(p => <PostCard key={p.id + tick} post={p} onNav={onNav} onRefresh={onRefresh} toast={toast} />)
      )}

      {(tab === "followers" || tab === "following") && (() => {
        const list = tab === "followers" ? followers : followingList;
        return list.length === 0
          ? <div className="empty"><div className="empty-icon">👀</div><div className="empty-title">nobody here yet</div></div>
          : list.map(u => (
            <div key={u.id + tick} className="card" style={{marginBottom:"0.6rem"}}>
              <div className="user-row" style={{padding:0,border:"none"}}>
                <Av user={u} onClick={() => onNav("profile", u.id)} />
                <div className="user-info">
                  <div className="user-name" onClick={() => onNav("profile", u.id)}>{u.name}</div>
                  <div className="user-handle">@{u.handle}</div>
                </div>
                {me.id !== u.id && (
                  <button className={`btn ${me.following.includes(u.id) ? "btn-following" : "btn-follow"}`}
                    onClick={() => { me.following.includes(u.id) ? db.unfollow(u.id) : db.follow(u.id); toast(me.following.includes(u.id) ? "Unfollowed" : "Following! 🔥"); onRefresh(); }}>
                    {me.following.includes(u.id) ? "following" : "+ follow"}
                  </button>
                )}
              </div>
            </div>
          ));
      })()}
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", handle:"", bio:"" });
  const [err, setErr] = useState("");
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const submit = () => {
    setErr("");
    try {
      const user = mode === "login" ? db.login(form.handle) : db.register(form);
      onAuth(user);
    } catch(e) { setErr(e.message); }
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">GenzVibe</div>
        <div className="auth-sub">{mode === "login" ? "welcome back bestie 👋" : "join the vibe ✨"}</div>

        {mode === "register" && (
          <div className="field">
            <label>name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="your name" />
          </div>
        )}
        <div className="field">
          <label>handle</label>
          <input value={form.handle} onChange={e => set("handle", e.target.value)}
            placeholder={mode === "login" ? "try: zaramoon, kaidrip, miaflux" : "@yourhandle"}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        {mode === "register" && (
          <div className="field">
            <label>bio <span style={{color:"var(--muted)",textTransform:"none",letterSpacing:0}}>(optional)</span></label>
            <input value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="something short and real" />
          </div>
        )}

        {err && <div className="auth-err">⚠ {err}</div>}

        <button className="btn btn-primary" style={{width:"100%",padding:"0.75rem",borderRadius:"var(--radius-sm)",fontSize:"0.9rem",marginTop:"0.25rem"}} onClick={submit}>
          {mode === "login" ? "sign in" : "create account"}
        </button>

        <div className="auth-toggle">
          {mode === "login"
            ? <>new here? <button onClick={() => { setMode("register"); setErr(""); }}>create account</button></>
            : <>already on here? <button onClick={() => { setMode("login"); setErr(""); }}>sign in</button></>
          }
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("feed");
  const [profileId, setProfileId] = useState(null);
  const [tick, setTick] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const refresh = useCallback(() => setTick(t => t+1), []);
  const toast = useCallback(msg => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2000); }, []);

  const nav = useCallback((v, id=null) => {
    setView(v); if (id) setProfileId(id); refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [refresh]);

  const handleAuth = (u) => { setUser(u); setView("feed"); };
  const handleLogout = () => { db.logout(); setUser(null); };

  if (!user) return <><CSS /><Auth onAuth={handleAuth} /></>;

  const me = db.getMe();
  const NAV_ITEMS = [
    { id:"feed",    label:"home",    Icon: Icon.Home },
    { id:"explore", label:"explore", Icon: Icon.Explore },
    { id:"profile", label:"me",      Icon: Icon.Profile, action: () => nav("profile", me?.id) },
  ];

  return (
    <div className="app">
      <CSS />

      {/* Top bar */}
      <header className="topbar">
        <div className="logo" onClick={() => nav("feed")}>GenzVibe</div>
        <div className="topbar-right">
          {me && <Av user={me} onClick={() => nav("profile", me.id)} />}
          <button className="btn btn-ghost" style={{borderRadius:"100px",padding:"0.3rem 0.8rem",fontSize:"0.75rem"}} onClick={handleLogout}>
            out
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="shell">
        {/* Desktop sidebar */}
        <nav className="sidebar">
          {NAV_ITEMS.map(n => (
            <button key={n.id} className={`snav-btn ${view === n.id ? "active" : ""}`}
              onClick={n.action || (() => nav(n.id))}>
              <n.Icon /> <span>{n.label}</span>
            </button>
          ))}
          {me && (
            <div className="sidebar-card" style={{marginTop:"1rem",padding:"0.85rem",background:"var(--card)",border:"1px solid var(--border)",borderRadius:"var(--radius)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.6rem"}}>
                <Av user={me} size="av-sm" />
                <div style={{minWidth:0}}>
                  <div style={{fontSize:"0.82rem",fontWeight:700,fontFamily:"var(--font-head)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{me.name}</div>
                  <div style={{fontSize:"0.7rem",color:"var(--sub)"}}>@{me.handle}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"1rem",fontSize:"0.75rem",color:"var(--sub)"}}>
                <span><b style={{color:"var(--text)"}}>{me.following.length}</b> following</span>
                <span><b style={{color:"var(--text)"}}>{me.followers.length}</b> followers</span>
              </div>
            </div>
          )}
        </nav>

        {/* Main content */}
        <main className="main">
          {view === "feed"    && <FeedView    onNav={nav} onRefresh={refresh} toast={toast} tick={tick} />}
          {view === "explore" && <ExploreView onNav={nav} onRefresh={refresh} toast={toast} tick={tick} />}
          {view === "profile" && profileId && <ProfileView uid={profileId} onNav={nav} onRefresh={refresh} toast={toast} tick={tick} />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(n => (
          <button key={n.id} className={`bnav-btn ${view === n.id ? "active" : ""}`}
            onClick={n.action || (() => nav(n.id))}>
            <n.Icon /> {n.label}
          </button>
        ))}
      </nav>

      <Toast msg={toastMsg} />
    </div>
  );
}