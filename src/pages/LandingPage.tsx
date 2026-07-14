import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  /* ── Typography ── */
  .lp h1, .lp h2, .lp h3, .lp h4 { font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.15; letter-spacing: -0.02em; }

  /* ── Navbar ── */
  .lp-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.96);
    border-bottom: 1px solid #e2e8f0;
    backdrop-filter: blur(12px);
  }
  .lp-nav-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 24px;
    height: 64px; display: flex; align-items: center; gap: 40px;
  }
  .lp-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
  .lp-logo-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
  .lp-nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; }
  .lp-nav-link {
    font-size: 14px; font-weight: 500; color: #475569;
    padding: 6px 12px; border-radius: 8px; text-decoration: none;
    transition: background 0.15s, color 0.15s;
    display: flex; align-items: center; gap: 4px;
  }
  .lp-nav-link:hover { background: #f1f5f9; color: #0f172a; }
  .lp-nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px;
    background: #4f46e5; color: #fff;
    font-size: 14px; font-weight: 600; border: none; cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    white-space: nowrap; text-decoration: none;
  }
  .btn-primary:hover { background: #4338ca; box-shadow: 0 4px 16px rgba(79,70,229,0.3); }
  .btn-primary-lg { padding: 13px 28px; font-size: 15px; border-radius: 12px; }
  .btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px;
    background: #fff; color: #374151;
    font-size: 14px; font-weight: 600;
    border: 1.5px solid #e2e8f0; cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    white-space: nowrap; text-decoration: none;
  }
  .btn-secondary:hover { border-color: #c7d2fe; background: #f8f9ff; }
  .btn-secondary-lg { padding: 13px 28px; font-size: 15px; border-radius: 12px; }
  .btn-ghost {
    background: none; border: none; font-size: 14px; font-weight: 500; color: #475569;
    cursor: pointer; padding: 6px 12px; border-radius: 8px;
    transition: background 0.15s; text-decoration: none;
  }
  .btn-ghost:hover { background: #f1f5f9; color: #0f172a; }

  /* ── Sections ── */
  .lp-section { padding: 96px 24px; }
  .lp-section-sm { padding: 64px 24px; }
  .lp-container { max-width: 1200px; margin: 0 auto; }
  .lp-container-sm { max-width: 900px; margin: 0 auto; }

  /* ── Hero ── */
  .hero { background: #fafafa; border-bottom: 1px solid #e2e8f0; }
  .hero-inner {
    max-width: 1200px; margin: 0 auto; padding: 80px 24px 72px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 100px;
    background: #eff6ff; color: #3b82f6;
    font-size: 12px; font-weight: 600; border: 1px solid #bfdbfe;
    margin-bottom: 20px;
  }
  .hero-title { font-size: 52px; font-weight: 800; color: #0f172a; margin-bottom: 20px; line-height: 1.08; }
  .hero-title span { color: #4f46e5; }
  .hero-desc { font-size: 17px; color: #64748b; line-height: 1.7; margin-bottom: 36px; max-width: 440px; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 44px; }
  .hero-chips { display: flex; gap: 20px; flex-wrap: wrap; }
  .hero-chip { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }
  .hero-chip-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: #f1f5f9; border: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hero-chip-label { font-weight: 600; color: #374151; font-size: 13px; }
  .hero-chip-sub { color: #94a3b8; font-size: 11px; }

  /* ── Hero card ── */
  .hero-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    position: relative;
  }
  .hero-card-header {
    padding: 18px 22px 14px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
  }
  .hero-card-body { padding: 18px 22px; }
  .hero-stat-badge {
    position: absolute; top: -40px; left: -48px; z-index: 10;
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 12px; padding: 12px 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    min-width: 150px;
  }
  .ai-suggestion-badge {
    position: absolute; bottom: 40px; right: -56px; z-index: 10;
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 14px; padding: 14px 18px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    width: 180px;
  }

  /* ── Cards & Grid ── */
  .card {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 16px; padding: 28px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .card:hover { border-color: #c7d2fe; box-shadow: 0 4px 20px rgba(79,70,229,0.08); }
  .card-sm { padding: 20px; border-radius: 14px; }
  .glass {
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(12px);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
  }

  /* ── Feature grid ── */
  .feature-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .feature-icon-wrap {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; flex-shrink: 0;
  }
  .feature-num { font-size: 11px; font-weight: 700; color: #cbd5e1; letter-spacing: 0.06em; }

  /* ── Stats bar ── */
  .stats-bar {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 16px; padding: 24px 32px;
    display: grid; grid-template-columns: repeat(5,1fr);
    gap: 0;
  }
  .stat-item {
    display: flex; align-items: center; gap: 14px;
    padding: 8px 16px;
    border-right: 1px solid #f1f5f9;
  }
  .stat-item:last-child { border-right: none; }
  .stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: #f8fafc; border: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ── Section heading ── */
  .section-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; color: #4f46e5;
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .section-title { font-size: 40px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }
  .section-desc { font-size: 16px; color: #64748b; line-height: 1.7; }

  /* ── Finance dashboard preview ── */
  .finance-preview {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  .finance-header {
    padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
  }
  .stat-mini { text-align: left; }
  .stat-mini-label { font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
  .stat-mini-val { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
  .stat-mini-change { font-size: 11px; font-weight: 600; margin-top: 2px; }
  .up { color: #10b981; }
  .warn { color: #f59e0b; }

  /* ── Donut ── */
  .donut-seg { stroke-linecap: butt; transition: stroke-dashoffset 0.3s ease; }

  /* ── AI insight cards ── */
  .insight-card {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 14px; padding: 20px;
    transition: border-color 0.2s;
  }
  .insight-card:hover { border-color: #c7d2fe; }
  .insight-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
  }

  /* ── Tab row ── */
  .tab-row {
    display: flex; gap: 2px;
    background: #f8fafc; border-radius: 10px; padding: 3px;
    width: fit-content; margin-bottom: 24px;
  }
  .tab-btn {
    padding: 7px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 600; border: none; cursor: pointer;
    transition: all 0.15s; background: transparent; color: #64748b;
  }
  .tab-btn.active { background: #fff; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  /* ── Demo app ── */
  .demo-shell {
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    display: flex;
  }
  .demo-sidebar {
    width: 200px; flex-shrink: 0;
    background: #fafafa; border-right: 1px solid #e2e8f0;
    padding: 20px 0;
  }
  .demo-sidebar-logo { padding: 0 16px 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 8px; }
  .demo-nav-item {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 16px; font-size: 13px; font-weight: 500; color: #64748b;
    cursor: pointer; transition: background 0.15s;
    border-left: 2px solid transparent; width: 100%; text-align: left; background: none; border: none;
  }
  .demo-nav-item.active {
    color: #4f46e5; background: #eff6ff;
    border-left-color: #4f46e5; font-weight: 600;
  }
  .demo-nav-item:hover:not(.active) { background: #f8fafc; }
  .demo-main { flex: 1; padding: 24px; background: #f8fafc; overflow: hidden; }
  .demo-preview { width: 240px; flex-shrink: 0; background: #fff; border-left: 1px solid #e2e8f0; padding: 20px; overflow: hidden; }

  /* ── Kanban ── */
  .kanban-col { flex: 1; min-width: 0; }
  .kanban-col-header { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .kanban-count { width: 18px; height: 18px; border-radius: 50%; background: #f1f5f9; font-size: 10px; font-weight: 700; color: #64748b; display: flex; align-items: center; justify-content: center; }
  .kanban-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 8px; cursor: pointer; transition: transform 0.1s, border-color 0.15s; }
  .kanban-card:hover { border-color: #c7d2fe; transform: translateY(-1px); }
  .priority { display: inline-block; padding: 2px 7px; border-radius: 100px; font-size: 10px; font-weight: 700; }

  /* ── Ticket ── */
  .ticket-type { display: inline-block; padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
  .ticket-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; cursor: pointer; transition: border-color 0.15s; }
  .ticket-card:hover { border-color: #c7d2fe; }
  .ticket-status { display: inline-block; padding: 4px 10px; border-radius: 7px; font-size: 11px; font-weight: 700; margin-top: 12px; }

  /* ── CTA ── */
  .cta-box {
    background: linear-gradient(135deg, #f8f9ff 0%, #eff6ff 50%, #faf5ff 100%);
    border: 1px solid #e0e7ff; border-radius: 24px; padding: 60px 48px;
    display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
  }
  .cta-title { font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
  .cta-title span { color: #4f46e5; }
  .cta-desc { font-size: 15px; color: #64748b; line-height: 1.7; margin-bottom: 28px; max-width: 480px; }

  /* ── Trust row ── */
  .trust-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 16px; }
  .trust-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
  .trust-icon { width: 36px; height: 36px; border-radius: 9px; background: #f8fafc; border: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* ── Footer ── */
  .footer { border-top: 1px solid #e2e8f0; background: #fff; }
  .footer-inner { max-width: 1200px; margin: 0 auto; padding: 56px 24px 0; }
  .footer-grid { display: flex; justify-content: space-between; gap: 32px; padding-bottom: 40px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; }
  .footer-link { display: block; font-size: 13px; color: #64748b; text-decoration: none; margin-bottom: 10px; transition: color 0.15s; }
  .footer-link:hover { color: #4f46e5; }
  .footer-col-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; flex-wrap: wrap; gap: 12px; }
  .footer-bottom-text { font-size: 12px; color: #94a3b8; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block; margin-right: 6px; }

  /* ── Table ── */
  .q-table { width: 100%; border-collapse: collapse; }
  .q-table th { font-size: 11px; font-weight: 600; color: #94a3b8; text-align: left; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
  .q-table th:not(:first-child) { text-align: right; }
  .q-table td { font-size: 12px; color: #374151; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
  .q-table td:not(:first-child) { text-align: right; }
  .q-table tr:last-child td { border-bottom: none; }

  /* ── Progress bar ── */
  .progress-track { height: 5px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin: 8px 0; }
  .progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #4f46e5, #7c3aed); }

  /* ── Divider ── */
  .divider { height: 1px; background: #f1f5f9; margin: 0; }

  /* ── Input ── */
  .lp-input {
    background: #fff; border: 1.5px solid #e2e8f0;
    border-radius: 10px; padding: 10px 14px;
    font-size: 14px; color: #0f172a;
    outline: none; font-family: inherit; width: 100%;
    transition: border-color 0.15s;
  }
  .lp-input:focus { border-color: #4f46e5; }
  .lp-input::placeholder { color: #94a3b8; }

  /* ── Mobile hamburger ── */
  .mobile-menu-btn {
    display: none; background: none; border: none; cursor: pointer;
    padding: 6px; border-radius: 8px; color: #374151;
  }
  .mobile-menu-btn:hover { background: #f1f5f9; }
  .mobile-nav {
    position: fixed; inset: 0; top: 64px; z-index: 99;
    background: #fff; border-top: 1px solid #e2e8f0;
    padding: 16px; display: flex; flex-direction: column; gap: 4px;
  }
  .mobile-nav-link {
    display: block; padding: 12px 16px; border-radius: 10px;
    font-size: 15px; font-weight: 500; color: #374151; text-decoration: none;
    transition: background 0.15s;
  }
  .mobile-nav-link:hover { background: #f8fafc; }

  /* ── Toast Alert ── */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 1000;
    background: #0f172a; color: #fff;
    padding: 12px 20px; border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 500;
    animation: slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes slideInUp {
    from { transform: translateY(24px) scale(0.95); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .trust-row { grid-template-columns: repeat(3, 1fr); }
    .cta-box { grid-template-columns: 1fr; gap: 32px; }
    .hero-inner { gap: 40px; }
    .hero-title { font-size: 42px; }
    .feature-grid { grid-template-columns: repeat(2,1fr); }
  }

  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; gap: 40px; }
    .hero-title { font-size: 38px; }
    .hero-desc { max-width: 100%; }
    .hero-card-wrap { position: relative !important; }
    .hero-stat-badge { display: none; }
    .ai-suggestion-badge { display: none; }
    .finance-layout { flex-direction: column !important; }
    .ai-section-layout { flex-direction: column !important; }
    .payroll-layout { flex-direction: column !important; }
    .collab-layout { flex-direction: column !important; }
    .stats-bar { grid-template-columns: repeat(3,1fr); }
    .stat-item { border-right: none; border-bottom: 1px solid #f1f5f9; }
    .stat-item:nth-child(3n) { border-bottom: none; }
    .section-title { font-size: 32px; }
    .cta-title { font-size: 28px; }
    .cta-box { padding: 40px 28px; }
    .demo-shell { flex-direction: column; }
    .demo-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e2e8f0; padding: 12px 0; }
    .demo-preview { display: none; }
    .kanban-layout { overflow-x: auto; }
    .kanban-inner { min-width: 600px; }
    .ticket-grid { grid-template-columns: repeat(2,1fr) !important; }
    .trust-row { grid-template-columns: repeat(2, 1fr); }
    .section-label-row { flex-direction: column; gap: 20px; align-items: flex-start !important; }
    .feature-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    .lp-nav-links { display: none; }
    .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
    .lp-section { padding: 64px 16px; }
    .lp-section-sm { padding: 40px 16px; }
    .hero { padding: 0; }
    .hero-inner { padding: 48px 16px 40px; gap: 32px; }
    .hero-title { font-size: 32px; }
    .hero-actions { flex-direction: column; }
    .btn-primary-lg, .btn-secondary-lg { width: 100%; justify-content: center; padding: 13px 24px; }
    .hero-chips { gap: 12px; }
    .feature-grid { grid-template-columns: 1fr; }
    .stats-bar { grid-template-columns: 1fr 1fr; padding: 16px; }
    .trust-row { grid-template-columns: 1fr; }
    .section-title { font-size: 26px; }
    .cta-box { padding: 32px 20px; }
    .cta-title { font-size: 24px; }
    .ticket-grid { grid-template-columns: 1fr !important; }
    .hide-mobile { display: none !important; }
    .finance-stats-grid { grid-template-columns: 1fr 1fr !important; }
    .finance-charts-row { flex-direction: column !important; }
    .insight-grid { grid-template-columns: 1fr !important; }
    .payroll-data-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 400px) {
    .hero-title { font-size: 28px; }
    .stats-bar { grid-template-columns: 1fr; }
  }
`;

// ─── Small SVG helpers ────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="10" fill="#4f46e5" />
    <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2.2" fill="none" />
    <circle cx="16" cy="16" r="3.5" fill="white" />
    <line x1="22.5" y1="22.5" x2="27" y2="27" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 16, color = 'currentColor' }) => {
  const paths: Record<string, React.ReactNode> = {
    bolt:       <path d="M13 2L4.09 13H11L10 22l8.91-11H13L13 2z" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    play:       <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.6" fill="none"/><path d="M10 8.5l6 3.5-6 3.5V8.5z" fill={color}/></>,
    arrow:      <path d="M5 12h14M14 7l5 5-5 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    check:      <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.6" fill="none"/><path d="M8 12l3 3 5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
    sparkle:    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M15.6 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />,
    shield:     <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 10 4.5-.26 8-4.75 8-10V6L12 2z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    lock:       <><rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.6" fill="none"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></>,
    cloud:      <path d="M18 10a6 6 0 0 0-11.7 2.1A4 4 0 1 0 6 20h12a4 4 0 0 0 0-8" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    headphone:  <><path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/><rect x="3" y="16" width="3" height="5" rx="1.5" stroke={color} strokeWidth="1.6" fill="none"/><rect x="18" y="16" width="3" height="5" rx="1.5" stroke={color} strokeWidth="1.6" fill="none"/></>,
    heart:      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.6" fill="none"/>,
    chart:      <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    mail:       <><rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.6" fill="none"/><path d="M2 8l10 7 10-7" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/></>,
    send:       <><path d="M22 2L11 13" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/><path d="M22 2L15 22 11 13 2 9l20-7z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none"/></>,
    refresh:    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    brain:      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2z" stroke={color} strokeWidth="1.6" fill="none"/>,
    users:      <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.6" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/></>,
    file:       <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="1.6" fill="none"/><polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="1.6" fill="none"/></>,
    barChart:   <><line x1="12" y1="20" x2="12" y2="10" stroke={color} strokeWidth="1.6" strokeLinecap="round"/><line x1="18" y1="20" x2="18" y2="4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></>,
    ticket:     <><path d="M3 7v4a2 2 0 0 1 0 4v4h18v-4a2 2 0 0 1 0-4V7H3z" stroke={color} strokeWidth="1.6" fill="none"/><line x1="12" y1="7" x2="12" y2="17" stroke={color} strokeWidth="1.6" strokeDasharray="2 2"/></>,
    chat:       <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.6" fill="none"/></>,
    settings:   <><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="1.4" fill="none"/></>,
    chevron:    <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    menu:       <><line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    close:      <><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths[name]}
    </svg>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ size?: number }> = ({ size = 96 }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const segs = [
    { pct: 35, color: '#4f46e5' }, { pct: 28, color: '#7c3aed' },
    { pct: 18, color: '#06b6d4' }, { pct: 12, color: '#f59e0b' }, { pct: 7, color: '#e2e8f0' },
  ];
  let cum = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {segs.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const offset = circ - (cum / 100) * circ - dash;
        cum += s.pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={size * 0.14} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-((cum - s.pct) / 100) * circ} className="donut-seg" />;
      })}
    </svg>
  );
};

// ─── Liabilities Donut Chart ──────────────────────────────────────────────────
const LiabilitiesDonutChart: React.FC<{ size?: number; items: Array<{ amount: number; paid: boolean; color: string }> }> = ({ size = 80, items }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const activeItems = items.filter(i => !i.paid);
  const total = activeItems.reduce((acc, curr) => acc + curr.amount, 0);

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size * 0.14} />
      </svg>
    );
  }

  let cum = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {activeItems.map((s, i) => {
        const pct = (s.amount / total) * 100;
        const dash = (pct / 100) * circ;
        const offset = circ - (cum / 100) * circ - dash;
        cum += pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={size * 0.14} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-((cum - pct) / 100) * circ} className="donut-seg" />;
      })}
    </svg>
  );
};

// ─── Expenses Donut Chart ─────────────────────────────────────────────────────
const ExpensesDonutChart: React.FC<{ size?: number; expenses: Array<{ cat: string; amount: number }> }> = ({ size = 90, expenses }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const circ = 2 * Math.PI * r;

  const colors: Record<string, string> = {
    Team: '#4f46e5',
    Operations: '#7c3aed',
    Marketing: '#06b6d4',
    Software: '#f59e0b',
    Others: '#e2e8f0',
  };

  const categories = ['Team', 'Operations', 'Marketing', 'Software', 'Others'];
  const totals = categories.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.cat === cat).reduce((sum, item) => sum + item.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  totals.Team = (totals.Team || 0) + 23947;
  totals.Operations = (totals.Operations || 0) + 19157;
  totals.Marketing = (totals.Marketing || 0) + 12315;
  totals.Software = (totals.Software || 0) + 8210;
  totals.Others = (totals.Others || 0) + 4791;

  const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

  let cum = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {categories.map((cat, i) => {
        const amt = totals[cat] || 0;
        const pct = grandTotal > 0 ? (amt / grandTotal) * 100 : 0;
        const dash = (pct / 100) * circ;
        const offset = circ - (cum / 100) * circ - dash;
        cum += pct;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[cat]} strokeWidth={size * 0.14} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-((cum - pct) / 100) * circ} className="donut-seg" />;
      })}
    </svg>
  );
};

// ─── Finance SVG Line Chart ───────────────────────────────────────────────────
const LineChart: React.FC = () => (
  <svg width="100%" height="100" viewBox="0 0 280 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f46e5" stopOpacity=".15"/><stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/></linearGradient>
      <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e879f9" stopOpacity=".12"/><stop offset="100%" stopColor="#e879f9" stopOpacity="0"/></linearGradient>
    </defs>
    {[20,45,70,95].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#f1f5f9" strokeWidth="1"/>)}
    <polyline points="0,80 40,68 80,55 120,60 160,44 200,40 240,30 280,22" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="0,88 40,82 80,75 120,78 160,70 200,74 240,64 280,58" fill="none" stroke="#e879f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Hero Quotation Card ──────────────────────────────────────────────────────
const HeroCard: React.FC<{ onTriggerToast: (msg: string) => void }> = ({ onTriggerToast }) => {
  const [hasMaintenance, setHasMaintenance] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  const items = [
    { name: 'Website Development', qty: 1, price: 2500 },
    { name: 'UI/UX Design', qty: 1, price: 1200 },
    { name: 'API Integration', qty: 1, price: 800 },
  ];

  if (hasMaintenance) {
    items.push({ name: 'Maintenance (6 Mo.)', qty: 1, price: 600 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handleConvert = () => {
    if (buttonState !== 'idle') return;
    setButtonState('loading');
    setTimeout(() => {
      setButtonState('success');
      onTriggerToast('✓ Quotation successfully converted to invoice #INV-250513-01!');
    }, 1200);
  };

  return (
    <div className="hero-card" style={{ position: 'relative' }}>
      {/* Revenue badge */}
      <div className="hero-stat-badge">
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Revenue · This Month</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>$24,680</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', marginTop: 2 }}>↑ 32.4% vs last month</div>
      </div>

      {/* Card header */}
      <div className="hero-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="file" size={13} color="#64748b" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>New Quotation</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
          <Icon name="sparkle" size={11} color="#3b82f6" /> AI Assistant
        </div>
      </div>

      <div className="hero-card-body">
        {/* Client */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Client</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AC</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Acme Corporation</span>
            <Icon name="chevron" size={14} color="#94a3b8" />
          </div>
        </div>

        {/* Items table */}
        <table className="q-table" style={{ marginBottom: 12 }}>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.name}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td>{item.qty}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${(item.qty * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginBottom: 14 }}>
          {[
            ['Subtotal', `$${subtotal.toLocaleString()}`, false],
            ['Tax (18%)', `$${tax.toLocaleString()}`, false],
            ['Total', `$${total.toLocaleString()}`, true]
          ].map(([l, v, bold]) => (
            <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: bold ? '#0f172a' : '#64748b', fontWeight: bold ? 700 : 400 }}>{l}</span>
              <span style={{ fontSize: 12, color: bold ? '#4f46e5' : '#374151', fontWeight: bold ? 800 : 500 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="btn-primary"
          onClick={handleConvert}
          disabled={buttonState !== 'idle'}
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: 13,
            padding: '11px',
            background: buttonState === 'success' ? '#10b981' : buttonState === 'loading' ? '#818cf8' : '#4f46e5'
          }}
        >
          {buttonState === 'loading' ? 'Converting...' : buttonState === 'success' ? '✓ Invoiced' : 'Convert to Invoice'}
        </button>
      </div>

      {/* AI Suggestion */}
      {!hasMaintenance && (
        <div className="ai-suggestion-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon name="sparkle" size={13} color="#4f46e5" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>AI Suggestion</span>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, lineHeight: 1.5 }}>Add maintenance package?</p>
          <button
            style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => {
              setHasMaintenance(true);
              onTriggerToast('✓ Maintenance package added to quote.');
            }}
          >
            Add to Quote →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  // Mobile Nav State
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Toast Alert State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // 1. Finance / Payroll Section States
  const [activeTicket, setActiveTicket] = useState('All Tickets');
  const [activeTab, setActiveTab] = useState<'payroll' | 'expenses' | 'liabilities'>('payroll');
  const [payrollState, setPayrollState] = useState<'idle' | 'processing' | 'processed'>('idle');
  const [expenses, setExpenses] = useState([
    { label: 'Office Supplies', cat: 'Operations', date: 'May 12', amount: 320 },
    { label: 'Software Subscription', cat: 'Software', date: 'May 11', amount: 1250 },
    { label: 'Travel Expense', cat: 'Marketing', date: 'May 09', amount: 560 },
    { label: 'Client Meeting', cat: 'Marketing', date: 'May 08', amount: 245 },
  ]);
  const [expenseFilter, setExpenseFilter] = useState<'All' | 'Team' | 'Operations' | 'Marketing' | 'Software'>('All');
  const [newExpLabel, setNewExpLabel] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCat, setNewExpCat] = useState<'Team' | 'Operations' | 'Marketing' | 'Software'>('Operations');

  const [liabilities, setLiabilities] = useState([
    { id: '1', label: 'Loans Payable', amount: 18500, paid: false, color: '#4f46e5' },
    { id: '2', label: 'Vendor Payables', amount: 15200, paid: false, color: '#7c3aed' },
    { id: '3', label: 'Tax Payable', amount: 6100, paid: false, color: '#06b6d4' },
    { id: '4', label: 'Other Liabilities', amount: 3000, paid: false, color: '#f59e0b' },
  ]);

  const handleRunPayroll = () => {
    if (payrollState !== 'idle') return;
    setPayrollState('processing');
    setTimeout(() => {
      setPayrollState('processed');
      showToast('Payroll processed successfully for 24 employees!', 'success');
    }, 1500);
  };

  const handleResetPayroll = () => {
    setPayrollState('idle');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpLabel.trim() || !newExpAmount) return;
    const amt = parseFloat(newExpAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newExp = {
      label: newExpLabel,
      cat: newExpCat,
      date: 'May 14',
      amount: amt,
    };
    setExpenses([newExp, ...expenses]);
    setNewExpLabel('');
    setNewExpAmount('');
    showToast(`Logged expense: ${newExpLabel} ($${amt.toLocaleString()})`, 'success');
  };

  const handlePayLiability = (id: string, label: string, amt: number) => {
    setLiabilities(liabilities.map(l => l.id === id ? { ...l, paid: true } : l));
    showToast(`Paid liability: ${label} ($${amt.toLocaleString()})`, 'success');
  };

  // Calculate dynamic liabilities total
  const liabilitiesTotal = liabilities.filter(l => !l.paid).reduce((sum, item) => sum + item.amount, 0);

  // 2. See Quotiq in Action (Demo Shell Builder) States
  const [activeSidebarTab, setActiveSidebarTab] = useState<'dashboard' | 'quotes' | 'invoices' | 'clients' | 'reports' | 'settings'>('quotes');
  const [quoteStep, setQuoteStep] = useState<1 | 2 | 3>(1);
  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientEmail, setClientEmail] = useState('contact@acme.com');
  const [quoteCurrency, setQuoteCurrency] = useState('USD');
  const [quoteItems, setQuoteItems] = useState([
    { name: 'Website Development', desc: 'Full website with responsive design', qty: 1, price: 2500 },
    { name: 'UI/UX Design', desc: 'User interface and experience design', qty: 1, price: 1200 },
  ]);
  const [quotesHistory, setQuotesHistory] = useState<Array<{ id: string; client: string; email: string; itemsCount: number; total: number; date: string; status: string }>>([
    { id: 'QT-250510-02', client: 'Stark Industries', email: 'tony@stark.com', itemsCount: 3, total: 18400, date: 'May 10, 2025', status: 'Approved' },
    { id: 'QT-250508-01', client: 'Wayne Enterprises', email: 'bruce@wayne.com', itemsCount: 1, total: 5000, date: 'May 08, 2025', status: 'Sent' },
  ]);

  const handleAddBuilderItem = () => {
    setQuoteItems([...quoteItems, { name: 'API Custom Integration', desc: 'Custom backend service', qty: 1, price: 800 }]);
  };

  const handleRemoveBuilderItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const handleUpdateBuilderItem = (index: number, key: 'name' | 'qty' | 'price', val: any) => {
    setQuoteItems(quoteItems.map((item, i) => i === index ? { ...item, [key]: val } : item));
  };

  const calculateSubtotal = () => quoteItems.reduce((acc, curr) => acc + curr.qty * curr.price, 0);
  const calculateTax = () => Math.round(calculateSubtotal() * 0.18);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const handleSendQuote = () => {
    setIsSendingQuote(true);
    setTimeout(() => {
      setIsSendingQuote(false);
      const newQuoteId = `QT-250514-${Math.floor(10 + Math.random() * 90)}`;
      const newQuote = {
        id: newQuoteId,
        client: clientName,
        email: clientEmail,
        itemsCount: quoteItems.length,
        total: calculateTotal(),
        date: 'May 14, 2025',
        status: 'Sent'
      };
      setQuotesHistory([newQuote, ...quotesHistory]);
      showToast(`Quote ${newQuoteId} sent to client!`, 'success');
      setQuoteStep(1);
      setActiveSidebarTab('dashboard'); // Redirect to dashboard to show it!
    }, 1200);
  };

  // 3. Project Workspace Kanban & Collaboration States
  const [activeCollabTab, setActiveCollabTab] = useState<'Overview' | 'Tasks' | 'Chat' | 'Files' | 'Tickets' | 'Reports'>('Tasks');
  const [kanbanTasks, setKanbanTasks] = useState([
    { id: 't1', title: 'Create wireframes for landing page', prio: 'High', pc: '#ef4444', column: 'todo' },
    { id: 't2', title: 'Set up analytics events', prio: 'Medium', pc: '#f59e0b', column: 'todo' },
    { id: 't3', title: 'Prepare UI style guide', prio: 'Low', pc: '#10b981', column: 'todo' },
    { id: 't4', title: 'Design homepage UI', prio: 'High', pc: '#ef4444', column: 'progress', prog: 60 },
    { id: 't5', title: 'Develop API integration', prio: 'Medium', pc: '#f59e0b', column: 'progress', prog: 40 },
    { id: 't6', title: 'Review homepage design', prio: 'High', pc: '#ef4444', column: 'review' },
    { id: 't7', title: 'Code review & refactoring', prio: 'Medium', pc: '#f59e0b', column: 'review' },
    { id: 't8', title: 'Project kickoff meeting', column: 'done' },
    { id: 't9', title: 'Market & user research', column: 'done' },
    { id: 't10', title: 'Information architecture', column: 'done' }
  ]);
  const [showAddTaskInput, setShowAddTaskInput] = useState<string | null>(null);
  const [addTaskTitle, setAddTaskTitle] = useState('');

  const [chatMessages, setChatMessages] = useState([
    { sender: 'Alice', avatar: 'A', msg: "Hey everyone, did we finish the homepage wireframes?", time: "10:24 AM" },
    { sender: 'Bob', avatar: 'B', msg: "Yes, they are in the 'Review' column of the Kanban board now.", time: "10:26 AM" }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [sharedFiles, setSharedFiles] = useState([
    { name: 'website_wireframes_v2.pdf', size: '4.2 MB', date: 'May 12', by: 'Alice' },
    { name: 'project_brief.docx', size: '1.8 MB', date: 'May 08', by: 'Bob' }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMoveTask = (taskId: string) => {
    setKanbanTasks(kanbanTasks.map(task => {
      if (task.id !== taskId) return task;
      let nextCol = 'todo';
      if (task.column === 'todo') nextCol = 'progress';
      else if (task.column === 'progress') nextCol = 'review';
      else if (task.column === 'review') nextCol = 'done';
      else if (task.column === 'done') nextCol = 'todo';
      return { ...task, column: nextCol };
    }));
    showToast('Task moved to next stage!', 'info');
  };

  const handleAddTask = (column: string) => {
    if (!addTaskTitle.trim()) return;
    const colors = ['#ef4444', '#f59e0b', '#10b981'];
    const prios = ['High', 'Medium', 'Low'];
    const r = Math.floor(Math.random() * 3);
    const newTask = {
      id: `t${Date.now()}`,
      title: addTaskTitle,
      prio: prios[r]!,
      pc: colors[r]!,
      column: column
    };
    setKanbanTasks([...kanbanTasks, newTask]);
    setAddTaskTitle('');
    setShowAddTaskInput(null);
    showToast('Task added successfully!', 'success');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = {
      sender: 'You',
      avatar: 'Y',
      msg: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const responses = [
        "Sounds good! I'll take a look at it.",
        "Got it, thanks for updating the team.",
        "Perfect, let's keep pressing forward.",
        "I'll verify this changes right now.",
        "Awesome! Let me review the invoice builder first."
      ];
      const botMsg = {
        sender: 'Bob',
        avatar: 'B',
        msg: responses[Math.floor(Math.random() * responses.length)]!,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleFileUploadSimulation = () => {
    if (isUploading) return;
    setIsUploading(true);
    setTimeout(() => {
      const newFile = {
        name: `quotation_spec_v${Math.floor(Math.random() * 10)}.pdf`,
        size: `${(2 + Math.random() * 5).toFixed(1)} MB`,
        date: 'Today',
        by: 'You'
      };
      setSharedFiles([newFile, ...sharedFiles]);
      setIsUploading(false);
      showToast('File uploaded successfully!', 'success');
    }, 1500);
  };

  // 4. Ticket Section States & Actions
  const [tickets, setTickets] = useState([
    { type: 'BUG', id: '#TK-1249', title: 'Mobile menu not working on Safari', prio: 'High', pc: '#ef4444', status: 'In Progress', sc: '#f59e0b' },
    { type: 'FEATURE', id: '#TK-1247', title: 'Add dark mode support', prio: 'Medium', pc: '#f59e0b', status: 'To Do', sc: '#94a3b8' },
    { type: 'BUG', id: '#TK-1248', title: 'Form validation error messages', prio: 'Medium', pc: '#f59e0b', status: 'In Progress', sc: '#f59e0b' },
    { type: 'SUPPORT', id: '#TK-1245', title: 'Server error on file upload', prio: 'High', pc: '#ef4444', status: 'Open', sc: '#3b82f6' },
    { type: 'IMPROVEMENT', id: '#TK-1244', title: 'Improve page loading speed', prio: 'Low', pc: '#10b981', status: 'Review', sc: '#8b5cf6' },
  ]);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketType, setNewTicketType] = useState('BUG');
  const [newTicketPrio, setNewTicketPrio] = useState('Medium');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) return;
    const colors = { BUG: '#ef4444', FEATURE: '#10b981', IMPROVEMENT: '#8b5cf6', SUPPORT: '#3b82f6' };
    const newTk = {
      type: newTicketType,
      id: `#TK-${Math.floor(1200 + Math.random() * 50)}`,
      title: newTicketTitle,
      prio: newTicketPrio,
      pc: newTicketPrio === 'High' ? '#ef4444' : newTicketPrio === 'Medium' ? '#f59e0b' : '#10b981',
      status: 'Open',
      sc: '#3b82f6'
    };
    setTickets([newTk, ...tickets]);
    setNewTicketTitle('');
    setShowCreateTicketModal(false);
    showToast(`Ticket ${newTk.id} raised successfully!`, 'success');
  };

  // Filtered Tickets List
  const filteredTickets = tickets.filter(tk => {
    if (activeTicket === 'All Tickets') return true;
    return tk.type.toLowerCase() === activeTicket.toLowerCase();
  });

  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="lp">

        {/* ══════ NAVBAR ══════ */}
        <nav className="lp-nav">
          <div className="lp-nav-inner">
            <a href="#" className="lp-logo">
              <Logo size={30} />
              <span className="lp-logo-text">Quotiq</span>
            </a>

            <div className="lp-nav-links">
              {['Product', 'Features', 'Templates', 'Integrations', 'Pricing', 'Resources'].map(item => (
                <a key={item} href="#" className="lp-nav-link">
                  {item}
                  {(item === 'Product' || item === 'Resources') && <Icon name="chevron" size={13} color="#94a3b8" />}
                </a>
              ))}
            </div>

            <div className="lp-nav-actions">
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Start Free Trial <Icon name="arrow" size={15} color="white" /></Link>
              <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
                <Icon name={mobileOpen ? 'close' : 'menu'} size={22} color="#374151" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="mobile-nav">
            {['Product', 'Features', 'Templates', 'Integrations', 'Pricing', 'Resources'].map(item => (
              <a key={item} href="#" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>{item}</a>
            ))}
            <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />
            <Link to="/login" className="mobile-nav-link">Log in</Link>
            <Link to="/register" className="btn-primary" style={{ margin: '4px 0', justifyContent: 'center' }}>Start Free Trial</Link>
          </div>
        )}

        {/* ══════ HERO ══════ */}
        <section className="hero">
          <div className="hero-inner">
            {/* Left */}
            <div>
              <div className="hero-badge">
                <Icon name="sparkle" size={12} color="#3b82f6" />
                AI-Powered Quotation Generator
              </div>

              <h1 className="hero-title">
                Create Quotes.<br />
                Win Deals.<br />
                <span>Get Paid.</span>
              </h1>

              <p className="hero-desc">
                Quotiq helps modern businesses generate professional quotations in seconds, manage clients, track approvals, and convert quotes to invoices — effortlessly.
              </p>

              <div className="hero-actions">
                <a href="#demo-section" className="btn-primary btn-primary-lg">
                  <Icon name="bolt" size={16} color="white" /> Generate Quote Now
                </a>
                <button className="btn-secondary btn-secondary-lg">
                  <Icon name="play" size={16} color="#374151" /> Watch Demo
                </button>
              </div>

              <div className="hero-chips">
                {[
                  { icon: 'bolt', label: 'AI-Powered', sub: 'Auto Fill' },
                  { icon: 'refresh', label: 'Convert to', sub: 'Invoice in 1 Click' },
                  { icon: 'file', label: 'Beautiful', sub: 'PDF Export' },
                ].map((c, i) => (
                  <div key={i} className="hero-chip">
                    <div className="hero-chip-icon"><Icon name={c.icon} size={15} color="#64748b" /></div>
                    <div>
                      <div className="hero-chip-label">{c.label}</div>
                      <div className="hero-chip-sub">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — product preview */}
            <div className="hero-card-wrap" style={{ position: 'relative', paddingTop: 40, paddingRight: 56 }}>
              <HeroCard onTriggerToast={(msg) => showToast(msg, 'success')} />
            </div>
          </div>
        </section>

        {/* ══════ FINANCE MANAGEMENT ══════ */}
        <section className="lp-section" style={{ background: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
          <div className="lp-container">
            <div className="finance-layout" style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>

              {/* Left copy */}
              <div style={{ flex: '0 0 320px' }}>
                <div className="section-label">
                  <Icon name="barChart" size={14} color="#4f46e5" /> Finance Management
                </div>
                <h2 className="section-title">Take Control of<br /><span style={{ color: '#4f46e5' }}>Your Finances</span></h2>
                <p className="section-desc" style={{ marginBottom: 28 }}>
                  Get a real-time overview of your cash flow, income, expenses, and profitability — all in one place.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: 'chart', label: 'Real-time Overview' },
                    { icon: 'barChart', label: 'Cash Flow Tracking' },
                    { icon: 'sparkle', label: 'Profitability Insights' },
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={f.icon} size={15} color="#4f46e5" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — finance overview */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="finance-preview">
                  <div className="finance-header">
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Finance Overview</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                      <Icon name="file" size={12} color="#94a3b8" /> This Month <Icon name="chevron" size={12} color="#94a3b8" />
                    </div>
                  </div>
                  <div style={{ padding: '20px 22px' }}>
                    {/* Stats */}
                    <div className="finance-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                      {[
                        { label: 'Total Revenue', val: `$${(124850 + (expenses.length - 4) * 500).toLocaleString()}`, change: '+15.6%', up: true },
                        { label: 'Total Expenses', val: `$${(68420 + expenses.slice(4).reduce((a,b)=>a+b.amount, 0)).toLocaleString()}`, change: '+8.3%', up: false },
                        { label: 'Net Profit', val: `$${(56430 - expenses.slice(4).reduce((a,b)=>a+b.amount,0)).toLocaleString()}`, change: '+23.7%', up: true },
                        { label: 'Cash Balance', val: `$${(42380 - expenses.slice(4).reduce((a,b)=>a+b.amount,0)).toLocaleString()}`, change: '+11.2%', up: true },
                      ].map((s, i) => (
                        <div key={i} style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 2 }}>{s.val}</div>
                          <div className={`stat-mini-change ${s.up ? 'up' : 'warn'}`}>{s.change} <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs last month</span></div>
                        </div>
                      ))}
                    </div>

                    {/* Charts */}
                    <div className="finance-charts-row" style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Cash Flow Trend</div>
                        <LineChart />
                        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                          {[['#4f46e5','Income'],['#e879f9','Expenses']].map(([c,l]) => (
                            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 20, height: 2, background: c, borderRadius: 1 }} />
                              <span style={{ fontSize: 11, color: '#64748b' }}>{l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }} className="hide-mobile">
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Expense Breakdown</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
                            <ExpensesDonutChart size={90} expenses={expenses} />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>
                                ${(68.4 + expenses.slice(4).reduce((a,b)=>a+b.amount,0)/1000).toFixed(1)}K
                              </div>
                              <div style={{ fontSize: 8, color: '#94a3b8' }}>Total</div>
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            {[['Team','35%','#4f46e5'],['Operations','28%','#7c3aed'],['Marketing','18%','#06b6d4'],['Software','12%','#f59e0b'],['Others','7%','#e2e8f0']].map(([l,p,c]) => (
                              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 11, marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                                  <span style={{ color: '#64748b' }}>{l}</span>
                                </div>
                                <span style={{ fontWeight: 600, color: '#374151' }}>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI Insights ── */}
            <div className="ai-section-layout" style={{ display: 'flex', gap: 40, marginTop: 48, alignItems: 'stretch' }}>
              <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>AI Insights</span>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => showToast('AI insights refreshed with real-time logs.', 'info')}>
                    <Icon name="refresh" size={13} color="#4f46e5" /> Refresh
                  </button>
                </div>
                <div className="insight-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {[
                    { color: '#10b981', bg: '#f0fdf4', icon: 'barChart', title: 'Revenue Opportunity', desc: 'Your revenue could increase by 24% if you close 5 pending proposals.', action: 'View Details' },
                    { color: '#f59e0b', bg: '#fffbeb', icon: 'chart', title: 'Expense Alert', desc: 'Marketing spend is 18% higher than usual. Consider optimizing your campaigns.', action: 'View Suggestions' },
                    { color: '#4f46e5', bg: '#eff6ff', icon: 'sparkle', title: 'Cash Flow Forecast', desc: "You're projected to have a cash surplus of $12,400 in the next 30 days.", action: 'See Forecast' },
                  ].map((ins, i) => (
                    <div key={i} className="insight-card">
                      <div className="insight-icon" style={{ background: ins.bg }}>
                        <Icon name={ins.icon} size={18} color={ins.color} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{ins.title}</div>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>{ins.desc}</p>
                      <button style={{ fontSize: 12, fontWeight: 600, color: ins.color, background: 'none', border: `1px solid ${ins.color}30`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }} onClick={() => showToast(`Opening insight: ${ins.title}`, 'info')}>{ins.action}</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right copy */}
              <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="section-label"><Icon name="sparkle" size={14} color="#4f46e5" /> AI Insights</div>
                <h3 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.2 }}>
                  AI-Powered Insights that Drive Decisions
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                  Let AI analyze your data and surface opportunities, risks, and recommendations to grow your business.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Smart Analysis', 'Opportunity Detection', 'Risk Alerts', 'Actionable Recommendations'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="check" size={16} color="#4f46e5" />
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payroll & Expenses ── */}
            <div className="payroll-layout" style={{ display: 'flex', gap: 40, marginTop: 48, alignItems: 'flex-start' }}>
              {/* Left copy */}
              <div style={{ flex: '0 0 280px' }}>
                <div className="section-label"><Icon name="users" size={14} color="#4f46e5" /> Payroll & Expenses</div>
                <h3 style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Manage Payroll,<br /><span style={{ color: '#4f46e5' }}>Expenses & Liabilities</span>
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                  Simplify payouts, track expenses, and manage liabilities with accuracy and ease.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['Payroll Automation','bolt'],['Expense Tracking','file'],['Liability Management','shield']].map(([l,ic]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name={ic!} size={16} color="#4f46e5" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payroll card */}
              <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
                <div className="tab-row">
                  {(['payroll','expenses','liabilities'] as const).map(t => (
                    <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* DYNAMIC CARD CONTENT */}
                {activeTab === 'payroll' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Upcoming Payroll</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>May 31, 2025</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        {payrollState === 'processed' ? '$0' : '$28,450'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <div style={{ display: 'flex' }}>
                          {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: `hsl(${230 + i*30},65%,58%)`, border: '2px solid #fff', marginLeft: i > 0 ? -7 : 0 }} />)}
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>24 Employees</span>
                      </div>
                      {payrollState === 'processed' ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>✓ May Payroll Paid</div>
                          <button className="btn-secondary" onClick={handleResetPayroll} style={{ fontSize: 12, padding: '6px 14px' }}>Reset</button>
                        </div>
                      ) : (
                        <button
                          className="btn-primary"
                          onClick={handleRunPayroll}
                          disabled={payrollState === 'processing'}
                          style={{ fontSize: 13, padding: '8px 18px', background: payrollState === 'processing' ? '#818cf8' : '#4f46e5' }}
                        >
                          {payrollState === 'processing' ? 'Running...' : 'Run Payroll'}
                        </button>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Employee Status</div>
                      <table className="q-table">
                        <thead>
                          <tr><th>Name</th><th>Role</th><th>Salary</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Alice Johnson', role: 'UX Designer', sal: '$7,500' },
                            { name: 'Bob Smith', role: 'Software Engineer', sal: '$9,200' },
                            { name: 'Charlie Brown', role: 'Product Manager', sal: '$8,400' },
                            { name: 'David Miller', role: 'Support Specialist', sal: '$3,350' },
                          ].map((emp) => (
                            <tr key={emp.name}>
                              <td style={{ fontWeight: 600 }}>{emp.name}</td>
                              <td>{emp.role}</td>
                              <td>{emp.sal}</td>
                              <td style={{ fontWeight: 700, color: payrollState === 'processed' ? '#10b981' : '#f59e0b' }}>
                                {payrollState === 'processed' ? 'Paid' : 'Pending'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'expenses' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Filter &amp; Log</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
                        {['All','Team','Operations','Marketing','Software'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setExpenseFilter(cat as any)}
                            style={{
                              padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: expenseFilter === cat ? '#4f46e5' : '#f1f5f9',
                              color: expenseFilter === cat ? '#fff' : '#64748b'
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleAddExpense} style={{ background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Quick Log Expense</div>
                        <input className="lp-input" placeholder="Title (e.g. Figma)" value={newExpLabel} onChange={(e) => setNewExpLabel(e.target.value)} style={{ fontSize: 12, padding: 8, marginBottom: 8 }} />
                        <input className="lp-input" type="number" placeholder="Amount ($)" value={newExpAmount} onChange={(e) => setNewExpAmount(e.target.value)} style={{ fontSize: 12, padding: 8, marginBottom: 8 }} />
                        <select className="lp-input" value={newExpCat} onChange={(e) => setNewExpCat(e.target.value as any)} style={{ fontSize: 12, padding: 8, marginBottom: 8 }}>
                          <option value="Operations">Operations</option>
                          <option value="Software">Software</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Team">Team</option>
                        </select>
                        <button className="btn-primary" type="submit" style={{ width: '100%', fontSize: 12, padding: '7px', justifyContent: 'center' }}>Add Expense</button>
                      </form>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Expense Log</div>
                      <table className="q-table">
                        <thead>
                          <tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th></tr>
                        </thead>
                        <tbody>
                          {expenses.filter(e => expenseFilter === 'All' || e.cat === expenseFilter).map((exp, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{exp.label}</td>
                              <td><span style={{ fontSize: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569', fontWeight: 600 }}>{exp.cat}</span></td>
                              <td>{exp.date}</td>
                              <td style={{ fontWeight: 700 }}>${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'liabilities' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Liabilities Breakdown</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                          <LiabilitiesDonutChart size={80} items={liabilities} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: '#0f172a' }}>
                              ${(liabilitiesTotal / 1000).toFixed(1)}K
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {liabilities.map((l) => (
                            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 10, marginBottom: 4, textDecoration: l.paid ? 'line-through' : 'none', opacity: l.paid ? 0.5 : 1 }}>
                              <span style={{ color: '#94a3b8' }}>{l.label}</span>
                              <span style={{ fontWeight: 600, color: '#374151' }}>${l.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Pending Liabilities</div>
                      <table className="q-table">
                        <thead>
                          <tr><th>Name</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {liabilities.map((l) => (
                            <tr key={l.id}>
                              <td style={{ fontWeight: 600 }}>{l.label}</td>
                              <td style={{ fontWeight: 700 }}>${l.amount.toLocaleString()}</td>
                              <td style={{ fontWeight: 700, color: l.paid ? '#10b981' : '#dc2626' }}>
                                {l.paid ? 'Paid' : 'Unpaid'}
                              </td>
                              <td>
                                {!l.paid && (
                                  <button
                                    className="btn-secondary"
                                    onClick={() => handlePayLiability(l.id, l.label, l.amount)}
                                    style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4 }}
                                  >
                                    Pay
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>

        {/* ══════ FEATURES ══════ */}
        <section className="lp-section">
          <div className="lp-container">
            <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>
              {/* Left */}
              <div style={{ flex: '0 0 340px' }}>
                <div className="section-label"><Icon name="sparkle" size={14} color="#4f46e5" /> Smart. Fast. Accurate.</div>
                <h2 className="section-title">Everything you need to <span style={{ color: '#4f46e5' }}>create, manage &amp; close.</span></h2>
                <p className="section-desc">Quotiq brings all the tools you need to generate quotes, manage clients, track approvals, and convert them into invoices — in one place.</p>
              </div>

              {/* Features grid */}
              <div style={{ flex: 1 }}>
                <div className="feature-grid">
                  {[
                    { num: '01', icon: 'brain', color: '#4f46e5', bg: '#eff6ff', title: 'AI Auto-Fill', desc: 'AI scans your inputs and auto-generates line items, pricing & terms instantly.' },
                    { num: '02', icon: 'file', color: '#06b6d4', bg: '#ecfeff', title: 'Custom Templates', desc: 'Create branded templates that match your business and reuse with ease.' },
                    { num: '03', icon: 'refresh', color: '#10b981', bg: '#f0fdf4', title: 'One-Click Convert', desc: 'Turn quotes into professional invoices in one click and get paid faster.' },
                    { num: '04', icon: 'check', color: '#f59e0b', bg: '#fffbeb', title: 'Track & Approve', desc: 'Real-time tracking for views, approvals, comments and client actions.' },
                    { num: '05', icon: 'users', color: '#8b5cf6', bg: '#f5f3ff', title: 'Client Management', desc: 'Keep all your clients, contacts & history organized in one beautiful dashboard.' },
                    { num: '06', icon: 'barChart', color: '#3b82f6', bg: '#eff6ff', title: 'Insights & Reports', desc: 'Powerful analytics to track quotes, revenue, conversions and team performance.' },
                  ].map((f, i) => (
                    <div key={i} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div className="feature-icon-wrap" style={{ background: f.bg, marginBottom: 0 }}>
                          <Icon name={f.icon} size={20} color={f.color} />
                        </div>
                        <span className="feature-num">{f.num}</span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{f.title}</h4>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── See Quotiq in Action (Demo Section) ── */}
            <div style={{ marginTop: 64 }} id="demo-section">
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.02em' }}>See Quotiq in Action</h2>
                <p style={{ fontSize: 15, color: '#64748b' }}>Create a quote, customize, and send — all in under 60 seconds.</p>
              </div>

              <div className="demo-shell" style={{ height: 460 }}>
                {/* Sidebar */}
                <div className="demo-sidebar">
                  <div className="demo-sidebar-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Logo size={24} />
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Quotiq</span>
                    </div>
                  </div>
                  {[
                    { key: 'dashboard', icon: 'barChart', label: 'Dashboard' },
                    { key: 'quotes', icon: 'file', label: 'Quotes' },
                    { key: 'invoices', icon: 'refresh', label: 'Invoices' },
                    { key: 'clients', icon: 'users', label: 'Clients' },
                    { key: 'reports', icon: 'barChart', label: 'Reports' },
                    { key: 'settings', icon: 'settings', label: 'Settings' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveSidebarTab(item.key as any)}
                      className={`demo-nav-item ${activeSidebarTab === item.key ? 'active' : ''}`}
                    >
                      <Icon name={item.icon} size={15} color={activeSidebarTab === item.key ? '#4f46e5' : '#94a3b8'} />
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Main Pane */}
                <div className="demo-main" style={{ overflowY: 'auto' }}>
                  {activeSidebarTab === 'dashboard' && (
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Dashboard Overview</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Sent Quotes Count</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{quotesHistory.length}</div>
                        </div>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Value Pipeline</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5' }}>
                            ${quotesHistory.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Sent Quotation Logs</div>
                        <table className="q-table">
                          <thead>
                            <tr><th>Quote ID</th><th>Client</th><th>Date</th><th>Total</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {quotesHistory.map((q) => (
                              <tr key={q.id}>
                                <td style={{ fontWeight: 600 }}>{q.id}</td>
                                <td>{q.client}</td>
                                <td>{q.date}</td>
                                <td style={{ fontWeight: 700 }}>${q.total.toLocaleString()}</td>
                                <td>
                                  <span style={{
                                    fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                                    background: q.status === 'Approved' ? '#d1fae5' : '#eff6ff',
                                    color: q.status === 'Approved' ? '#059669' : '#2563eb'
                                  }}>
                                    {q.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeSidebarTab === 'quotes' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Create New Quotation</h3>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
                          <Icon name="sparkle" size={11} color="#3b82f6" /> AI Assistant
                        </div>
                      </div>

                      {/* Wizard Steps Navigation Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
                        {[[1, 'Client Details'], [2, 'Add Items'], [3, 'Review & Send']].map(([stepNum, stepLabel]) => {
                          const num = stepNum as number;
                          const active = quoteStep === num;
                          return (
                            <React.Fragment key={num}>
                              <button
                                onClick={() => setQuoteStep(num as any)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                <div style={{
                                  width: 22, height: 22, borderRadius: '50%',
                                  background: active ? '#4f46e5' : '#e2e8f0',
                                  color: active ? '#fff' : '#94a3b8',
                                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  {num}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#0f172a' : '#94a3b8' }}>
                                  {String(stepLabel)}
                                </span>
                              </button>
                              {num < 3 && <div style={{ flex: 1, height: 1, background: '#e2e8f0', margin: '0 12px' }} />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* STEP 1: CLIENT DETAILS */}
                      {quoteStep === 1 && (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Client Details</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Client Name</div>
                              <input className="lp-input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corporation" />
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Email Address</div>
                              <input className="lp-input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="contact@acme.com" />
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Currency</div>
                              <select className="lp-input" value={quoteCurrency} onChange={(e) => setQuoteCurrency(e.target.value)}>
                                <option value="USD">USD – US Dollar ($)</option>
                                <option value="EUR">EUR – Euro (€)</option>
                                <option value="GBP">GBP – British Pound (£)</option>
                              </select>
                            </div>
                            <button className="btn-primary" onClick={() => setQuoteStep(2)} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                              Next Step: Add Items <Icon name="arrow" size={14} color="white" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: ADD ITEMS */}
                      {quoteStep === 2 && (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Line Items</span>
                            <button className="btn-secondary" onClick={handleAddBuilderItem} style={{ fontSize: 11, padding: '4px 10px' }}>
                              + Add Item
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                            {quoteItems.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <div style={{ flex: 2 }}>
                                  <input className="lp-input" value={item.name} onChange={(e) => handleUpdateBuilderItem(idx, 'name', e.target.value)} style={{ fontSize: 12, padding: 6 }} placeholder="Item name" />
                                </div>
                                <div style={{ width: 60 }}>
                                  <input className="lp-input" type="number" value={item.qty} onChange={(e) => handleUpdateBuilderItem(idx, 'qty', parseInt(e.target.value) || 0)} style={{ fontSize: 12, padding: 6, textAlign: 'center' }} placeholder="Qty" />
                                </div>
                                <div style={{ width: 90 }}>
                                  <input className="lp-input" type="number" value={item.price} onChange={(e) => handleUpdateBuilderItem(idx, 'price', parseFloat(e.target.value) || 0)} style={{ fontSize: 12, padding: 6, textAlign: 'right' }} placeholder="Price" />
                                </div>
                                <button
                                  onClick={() => handleRemoveBuilderItem(idx)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                                >
                                  <Icon name="close" size={16} color="#ef4444" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn-secondary" onClick={() => setQuoteStep(1)}>Back</button>
                            <button className="btn-primary" onClick={() => setQuoteStep(3)}>
                              Next: Review &amp; Send <Icon name="arrow" size={14} color="white" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: REVIEW & SEND */}
                      {quoteStep === 3 && (
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Review &amp; Send</div>
                          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{clientName}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{clientEmail}</div>
                            <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                              Total Items: {quoteItems.length} | Net Amount: ${calculateTotal().toLocaleString()} {quoteCurrency}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn-secondary" onClick={() => setQuoteStep(2)}>Back</button>
                            <button className="btn-primary" onClick={handleSendQuote} disabled={isSendingQuote}>
                              {isSendingQuote ? 'Sending...' : 'Send Quote to Client'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSidebarTab === 'invoices' && (
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Invoices List</h3>
                      <table className="q-table">
                        <thead>
                          <tr><th>Invoice</th><th>Client</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {[
                            { id: 'INV-250512-01', client: 'Acme Corporation', amount: 6018, date: 'May 12, 2025', status: 'Sent' },
                            { id: 'INV-250505-03', client: 'Stark Industries', amount: 15300, date: 'May 05, 2025', status: 'Paid' },
                            { id: 'INV-250501-01', client: 'Wayne Enterprises', amount: 8900, date: 'May 01, 2025', status: 'Overdue' },
                          ].map((inv) => (
                            <tr key={inv.id}>
                              <td style={{ fontWeight: 600 }}>{inv.id}</td>
                              <td>{inv.client}</td>
                              <td>{inv.date}</td>
                              <td style={{ fontWeight: 700 }}>${inv.amount.toLocaleString()}</td>
                              <td>
                                <span style={{
                                  fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                                  background: inv.status === 'Paid' ? '#d1fae5' : inv.status === 'Overdue' ? '#fee2e2' : '#eff6ff',
                                  color: inv.status === 'Paid' ? '#059669' : inv.status === 'Overdue' ? '#dc2626' : '#2563eb'
                                }}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSidebarTab === 'clients' && (
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Active Client Directories</h3>
                      <table className="q-table">
                        <thead>
                          <tr><th>Client</th><th>Contact Email</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Acme Corporation', email: 'contact@acme.com', status: 'Active' },
                            { name: 'Stark Industries', email: 'tony@stark.com', status: 'Active' },
                            { name: 'Wayne Enterprises', email: 'bruce@wayne.com', status: 'Active' },
                            { name: 'LexCorp', email: 'lex@lexcorp.com', status: 'Suspended' },
                          ].map((c) => (
                            <tr key={c.name}>
                              <td style={{ fontWeight: 600 }}>{c.name}</td>
                              <td>{c.email}</td>
                              <td style={{ fontWeight: 700, color: c.status === 'Active' ? '#10b981' : '#dc2626' }}>{c.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSidebarTab === 'reports' && (
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Activity Analytics</h3>
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Conversion Rate Trend</div>
                        <svg width="100%" height="80" viewBox="0 0 280 80" preserveAspectRatio="none">
                          <polyline points="0,70 50,55 100,60 150,30 200,45 250,15 280,10" fill="none" stroke="#4f46e5" strokeWidth="2.5"/>
                        </svg>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 6 }}>
                          <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSidebarTab === 'settings' && (
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Account Preferences</h3>
                      <form onSubmit={(e) => { e.preventDefault(); showToast('Preferences updated successfully!', 'success'); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Default Sender Name</div>
                          <input className="lp-input" defaultValue="Quotiq Solutions" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Notification Email</div>
                          <input className="lp-input" defaultValue="admin@quotiq.com" />
                        </div>
                        <button className="btn-primary" type="submit" style={{ width: 'fit-content', alignSelf: 'flex-start' }}>Save Changes</button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Right Live Preview Panel */}
                <div className="demo-preview">
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 14 }}>Preview Quote</div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <Logo size={22} />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>QUOTATION</div>
                        <div style={{ fontSize: 9, color: '#94a3b8' }}>#QT-250513-01</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{clientName || 'Client Name'}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{clientEmail || 'client@email.com'}</div>
                    </div>
                    <table className="q-table">
                      <thead><tr><th>Item</th><th>Amt</th></tr></thead>
                      <tbody>
                        {quoteItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name || 'Untitled Line'}</td>
                            <td>${(item.qty * item.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 6 }}>
                      {[
                        ['Subtotal', `$${calculateSubtotal().toLocaleString()}`],
                        ['Tax (18%)', `$${calculateTax().toLocaleString()}`],
                        ['Total', `$${calculateTotal().toLocaleString()}`]
                      ].map(([l, v], i) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, fontWeight: i === 2 ? 700 : 400, color: i === 2 ? '#4f46e5' : '#374151' }}>
                          <span style={{ color: '#64748b' }}>{l}</span><span>{v} {quoteCurrency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Revenue This Month</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>$24,680</div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginBottom: 8 }}>↑ 32.4%</div>
                    <svg width="100%" height="36" viewBox="0 0 160 36">
                      <polyline points="0,32 26,27 53,22 80,16 106,19 133,9 160,4" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ TEAM COLLABORATION ══════ */}
        <section className="lp-section" style={{ background: '#fafafa', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div className="lp-container">
            <div className="collab-layout" style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>
              {/* Left copy */}
              <div style={{ flex: '0 0 280px' }}>
                <div className="section-label"><Icon name="users" size={14} color="#4f46e5" /> Team Collaboration</div>
                <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 12, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.02em' }}>
                  Collaborate Better.<br /><span style={{ color: '#4f46e5' }}>Deliver Faster.</span>
                </h2>
                <p className="section-desc" style={{ marginBottom: 28 }}>
                  Bring your team, projects, tasks, and conversations together in one unified workspace.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  {[
                    { icon: 'check', title: 'Task Assignment', desc: 'Assign tasks, set deadlines, and track progress.' },
                    { icon: 'chat', title: 'Team Chat', desc: 'Chat in real-time with your team or clients.' },
                    { icon: 'ticket', title: 'Raise Tickets', desc: 'Report issues and get faster resolutions.' },
                    { icon: 'file', title: 'Project Workspace', desc: 'Dedicated space for every project.' },
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Icon name={f.icon} size={15} color="#4f46e5" />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{f.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kanban + tickets */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Kanban */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Project Workspace</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Website Redesign</div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
                      In Progress
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                    {['Overview', 'Tasks', 'Chat', 'Files', 'Tickets', 'Reports'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveCollabTab(t as any)}
                        style={{
                          padding: '7px 14px', fontSize: 12, fontWeight: activeCollabTab === t ? 700 : 500,
                          color: activeCollabTab === t ? '#4f46e5' : '#94a3b8',
                          background: 'none', border: 'none',
                          borderBottom: activeCollabTab === t ? '2px solid #4f46e5' : '2px solid transparent',
                          cursor: 'pointer', marginBottom: -1
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  {activeCollabTab === 'Overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Project Overview</h4>
                        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>
                          This project focuses on redesigning the main e-commerce portal to improve conversion rates and integrate with Quotiq.
                        </p>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>Overall Milestone Progress</div>
                        <div className="progress-track" style={{ height: 8 }}>
                          <div className="progress-fill" style={{ width: '65%' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>65% Complete</span>
                      </div>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Team Directory</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            { name: 'Alice Johnson', role: 'Design Lead' },
                            { name: 'Bob Smith', role: 'Core Engineer' },
                            { name: 'Charlie Brown', role: 'Product Manager' }
                          ].map((u) => (
                            <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#4f46e5' }}>
                                {u.name.split(' ')[0]![0]}
                              </div>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{u.name}</div>
                                <div style={{ fontSize: 9, color: '#94a3b8' }}>{u.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCollabTab === 'Tasks' && (
                    <div className="kanban-layout">
                      <div className="kanban-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                        {['todo', 'progress', 'review', 'done'].map((columnKey) => {
                          const columnTitle = columnKey === 'todo' ? 'To Do' : columnKey === 'progress' ? 'In Progress' : columnKey === 'review' ? 'Review' : 'Done';
                          const columnTasks = kanbanTasks.filter(t => t.column === columnKey);
                          return (
                            <div key={columnKey} className="kanban-col">
                              <div className="kanban-col-header">
                                {columnTitle}
                                <span className="kanban-count">{columnTasks.length}</span>
                              </div>

                              {columnTasks.map((card) => (
                                <div key={card.id} className="kanban-card" onClick={() => handleMoveTask(card.id)} title="Click to move to next column">
                                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, lineHeight: 1.4 }}>{card.title}</div>
                                  {columnKey === 'done' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981' }}>
                                      <Icon name="check" size={13} color="#10b981" /> <span style={{ fontSize: 10, color: '#94a3b8' }}>Completed</span>
                                    </div>
                                  ) : (
                                    <div>
                                      {card.prog !== undefined && (
                                        <div className="progress-track" style={{ marginBottom: 8 }}>
                                          <div className="progress-fill" style={{ width: `${card.prog}%` }} />
                                        </div>
                                      )}
                                      {card.prio && (
                                        <span className="priority" style={{ background: `${card.pc}12`, color: card.pc }}>
                                          {card.prio}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}

                              {showAddTaskInput === columnKey ? (
                                <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 8 }}>
                                  <input
                                    className="lp-input"
                                    placeholder="Task title..."
                                    value={addTaskTitle}
                                    onChange={(e) => setAddTaskTitle(e.target.value)}
                                    style={{ fontSize: 11, padding: '4px 8px', marginBottom: 6 }}
                                  />
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    <button className="btn-primary" onClick={() => handleAddTask(columnKey)} style={{ fontSize: 10, padding: '4px 8px' }}>Add</button>
                                    <button className="btn-secondary" onClick={() => { setShowAddTaskInput(null); setAddTaskTitle(''); }} style={{ fontSize: 10, padding: '4px 8px' }}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowAddTaskInput(columnKey)}
                                  style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', width: '100%', textAlign: 'left' }}
                                >
                                  + Add Task
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeCollabTab === 'Chat' && (
                    <div>
                      <div style={{ height: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#f8fafc' }}>
                        {chatMessages.map((msg, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12, alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%',
                              background: msg.sender === 'You' ? '#4f46e5' : '#7c3aed',
                              color: '#fff', fontSize: 10, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {msg.avatar}
                            </div>
                            <div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{msg.sender}</span>
                                <span style={{ fontSize: 8, color: '#94a3b8' }}>{msg.time}</span>
                              </div>
                              <p style={{ fontSize: 12, color: '#374151', marginTop: 2, background: '#fff', padding: '6px 10px', borderRadius: '0 8px 8px 8px', border: '1px solid #e2e8f0' }}>{msg.msg}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: 8 }}>
                        <input className="lp-input" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ fontSize: 12 }} />
                        <button className="btn-primary" type="submit">Send</button>
                      </form>
                    </div>
                  )}

                  {activeCollabTab === 'Files' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Uploaded Project Files</span>
                        <button className="btn-primary" onClick={handleFileUploadSimulation} disabled={isUploading} style={{ fontSize: 11, padding: '5px 12px' }}>
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                      </div>
                      <table className="q-table">
                        <thead>
                          <tr><th>File Name</th><th>Size</th><th>Date</th><th>Uploaded By</th></tr>
                        </thead>
                        <tbody>
                          {sharedFiles.map((file, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600, color: '#4f46e5', cursor: 'pointer' }}>📁 {file.name}</td>
                              <td>{file.size}</td>
                              <td>{file.date}</td>
                              <td>{file.by}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeCollabTab === 'Tickets' && (
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Active Tickets for this Workspace</h4>
                      <table className="q-table">
                        <thead>
                          <tr><th>Ticket ID</th><th>Type</th><th>Title</th><th>Priority</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {tickets.slice(0, 3).map((tk) => (
                            <tr key={tk.id}>
                              <td style={{ fontWeight: 600 }}>{tk.id}</td>
                              <td><span style={{ fontSize: 9, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{tk.type}</span></td>
                              <td>{tk.title}</td>
                              <td>{tk.prio}</td>
                              <td style={{ fontWeight: 700, color: '#f59e0b' }}>{tk.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeCollabTab === 'Reports' && (
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Workspace Productivity Metrics</h4>
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Milestone Completion Rate</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>88%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Average Tasks Done / Wk</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>14.2</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tickets Tracker Section */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Raise &amp; Track Tickets</span>
                    <button className="btn-primary" onClick={() => setShowCreateTicketModal(true)} style={{ padding: '7px 14px', fontSize: 13 }}>
                      + New Ticket
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
                    {['All Tickets','Bug','Feature','Improvement','Support'].map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTicket(t)}
                        style={{
                          padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 7, border: 'none', cursor: 'pointer',
                          background: activeTicket === t ? '#4f46e5' : '#f1f5f9',
                          color: activeTicket === t ? '#fff' : '#64748b',
                          transition: 'all 0.15s'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="ticket-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
                    {filteredTickets.map((ticket, i) => (
                      <div key={i} className="ticket-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <span className="ticket-type" style={{
                            background: ticket.type === 'BUG' ? '#fee2e2' : ticket.type === 'FEATURE' ? '#d1fae5' : ticket.type === 'SUPPORT' ? '#dbeafe' : '#ede9fe',
                            color: ticket.type === 'BUG' ? '#dc2626' : ticket.type === 'FEATURE' ? '#059669' : ticket.type === 'SUPPORT' ? '#2563eb' : '#7c3aed',
                          }}>{ticket.type}</span>
                        </div>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 6 }}>{ticket.id}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', lineHeight: 1.4, marginBottom: 8 }}>{ticket.title}</div>
                        <span className="priority" style={{ background: `${ticket.pc}12`, color: ticket.pc }}>● {ticket.prio}</span>
                        <div className="ticket-status" style={{ background: `${ticket.sc}12`, color: ticket.sc }}>{ticket.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ CTA ══════ */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="cta-box">
              <div>
                <div className="section-label"><Icon name="bolt" size={14} color="#4f46e5" /> Ready to Grow Your Business?</div>
                <h2 className="cta-title">Ready to simplify your quoting and <span>win more deals?</span></h2>
                <p className="cta-desc">
                  Join thousands of businesses using Quotiq to create quotes, manage projects, and get paid faster — all in one powerful workspace.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/register" className="btn-primary btn-primary-lg">Start Free Trial <Icon name="arrow" size={17} color="white" /></Link>
                  <button className="btn-secondary btn-secondary-lg"><Icon name="play" size={17} color="#374151" /> Watch Demo</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' }}>
                    <Icon name="check" size={14} color="#10b981" /> No credit card required
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>·</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>14-day free trial</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { val: '10K+', label: 'Teams worldwide' },
                  { val: '2M+', label: 'Quotes generated' },
                  { val: '99.9%', label: 'Uptime SLA' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '20px 32px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#4f46e5', fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.03em' }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust row */}
            <div className="trust-row" style={{ marginTop: 24 }}>
              {[
                { icon: 'shield', label: '14-Day Free Trial', sub: 'No credit card required' },
                { icon: 'lock', label: 'Bank-Level Security', sub: 'Your data is always safe' },
                { icon: 'cloud', label: '99.9% Uptime', sub: 'Reliable, always available' },
                { icon: 'headphone', label: '24/7 Support', sub: "We're here to help" },
                { icon: 'heart', label: 'Loved by 10,000+ Teams', sub: 'Across the globe' },
              ].map((b, i) => (
                <div key={i} className="trust-item">
                  <div className="trust-icon"><Icon name={b.icon} size={18} color="#4f46e5" /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FOOTER ══════ */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-grid">
              {/* Brand */}
              <div style={{ maxWidth: 360, flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Logo size={28} />
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Quotiq</span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, marginBottom: 18 }}>AI-powered quotation generator for modern businesses. Create, manage, and close deals faster.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['in','𝕏','▶'].map((icon, i) => (
                    <div key={i} style={{ width: 30, height: 30, borderRadius: 7, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748b', cursor: 'pointer', transition: 'border-color 0.15s' }}>{icon}</div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div style={{ maxWidth: 320, flex: 1, minWidth: 260 }}>
                <div className="footer-col-title">Stay Updated</div>
                <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>Get product updates, tips, and exclusive offers straight to your inbox.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="lp-input" placeholder="Enter your email" style={{ fontSize: 13 }} />
                  <button className="btn-primary" style={{ padding: '10px 12px', flexShrink: 0 }}>
                    <Icon name="send" size={16} color="white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
              <span className="footer-bottom-text">© 2024 Quotiq. All rights reserved.</span>
              <span className="footer-bottom-text">
                <span className="status-dot" />
                All systems operational
              </span>
              <div style={{ display: 'flex', gap: 20 }}>
                <span className="footer-bottom-text" style={{ cursor: 'pointer' }}>🌍 English (US)</span>
                <span className="footer-bottom-text" style={{ cursor: 'pointer' }}>🌙 Dark Mode</span>
              </div>
            </div>
          </div>
        </footer>

        {/* ── CREATE TICKET MODAL ── */}
        {showCreateTicketModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Raise New Ticket</h3>
                <button onClick={() => setShowCreateTicketModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="close" size={20} color="#64748b" /></button>
              </div>
              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Ticket Title</div>
                  <input className="lp-input" value={newTicketTitle} onChange={(e) => setNewTicketTitle(e.target.value)} placeholder="Describe the issue..." required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Type</div>
                    <select className="lp-input" value={newTicketType} onChange={(e) => setNewTicketType(e.target.value)}>
                      <option value="BUG">Bug</option>
                      <option value="FEATURE">Feature</option>
                      <option value="IMPROVEMENT">Improvement</option>
                      <option value="SUPPORT">Support</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Priority</div>
                    <select className="lp-input" value={newTicketPrio} onChange={(e) => setNewTicketPrio(e.target.value)}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary" type="submit" style={{ marginTop: 10, justifyContent: 'center' }}>Submit Ticket</button>
              </form>
            </div>
          </div>
        )}

        {/* ── TOAST SYSTEM ── */}
        {toast && (
          <div className="toast">
            <Icon name="check" size={16} color="white" />
            <span>{toast.message}</span>
          </div>
        )}

      </div>
    </>
  );
}
