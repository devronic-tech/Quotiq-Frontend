import React, { useEffect, useRef, useState } from 'react';

// ─── Keyframe injection ────────────────────────────────────────────────────────
const LANDING_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

  .lp-root { font-family:'Inter',sans-serif; background:#f0f2ff; color:#1a1d2e; overflow-x:hidden; }

  /* ── Floating 3D Blobs ── */
  @keyframes float3d {
    0%,100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
    25%      { transform: translateY(-18px) rotateX(8deg) rotateY(5deg); }
    50%      { transform: translateY(-10px) rotateX(-4deg) rotateY(-8deg); }
    75%      { transform: translateY(-22px) rotateX(5deg) rotateY(10deg); }
  }
  @keyframes float3dAlt {
    0%,100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg) scale(1); }
    33%      { transform: translateY(-14px) rotateX(-6deg) rotateY(8deg) scale(1.04); }
    66%      { transform: translateY(-20px) rotateX(6deg) rotateY(-5deg) scale(0.97); }
  }
  @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes spinSlowRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes pulse3d {
    0%,100% { transform: scale(1) rotateY(0deg); box-shadow: 0 20px 60px rgba(99,102,241,0.25); }
    50%      { transform: scale(1.06) rotateY(10deg); box-shadow: 0 30px 80px rgba(99,102,241,0.4); }
  }
  @keyframes slideInCard {
    from { opacity:0; transform: translateY(40px) rotateX(15deg); }
    to   { opacity:1; transform: translateY(0)   rotateX(0deg); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmerLine {
    0%  { transform:translateX(-100%); }
    100%{ transform:translateX(100%); }
  }
  @keyframes rotateCoin {
    0%   { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  @keyframes dashDraw {
    from { stroke-dashoffset: 600; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes chartGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes orbitDot {
    from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
  }
  @keyframes rocketLaunch {
    0%,100% { transform: translateY(0px) rotate(-10deg); }
    50%      { transform: translateY(-20px) rotate(-10deg); }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow:0 0 30px rgba(99,102,241,0.3); }
    50%      { box-shadow:0 0 60px rgba(99,102,241,0.6); }
  }
  @keyframes typewriter {
    from { width:0; }
    to   { width:100%; }
  }
  @keyframes blinkCaret {
    0%,100% { border-color:transparent; }
    50%      { border-color:#6366f1; }
  }
  @keyframes starSpin {
    0%   { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes progressFill {
    from { width:0%; }
    to   { width:var(--target-width); }
  }
  @keyframes countUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes checkmarkDraw {
    0%  { stroke-dashoffset:30; }
    100%{ stroke-dashoffset:0; }
  }
  @keyframes dropIn {
    from { opacity:0; transform:translateY(-20px) scale(0.9); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes scanLine {
    0%   { top:0%; }
    100% { top:100%; }
  }
  @keyframes morphBlob {
    0%,100% { border-radius:60% 40% 30% 70% / 60% 30% 70% 40%; }
    25%      { border-radius:30% 60% 70% 40% / 50% 60% 30% 60%; }
    50%      { border-radius:50% 60% 30% 60% / 40% 50% 60% 50%; }
    75%      { border-radius:40% 70% 60% 30% / 60% 40% 50% 70%; }
  }

  .float-3d      { animation: float3d 6s ease-in-out infinite; }
  .float-3d-alt  { animation: float3dAlt 7s ease-in-out infinite; }
  .float-3d-slow { animation: float3d 9s ease-in-out infinite; }
  .pulse-3d      { animation: pulse3d 4s ease-in-out infinite; }
  .spin-slow     { animation: spinSlow 12s linear infinite; }
  .spin-slow-rev { animation: spinSlowRev 10s linear infinite; }
  .rocket-fly    { animation: rocketLaunch 3s ease-in-out infinite; }
  .glow-pulse    { animation: glowPulse 3s ease-in-out infinite; }
  .morph-blob    { animation: morphBlob 8s ease-in-out infinite; }

  .card-3d { 
    transform-style: preserve-3d;
    transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s;
    animation: slideInCard 0.8s ease-out both;
  }
  .card-3d:hover {
    transform: translateY(-6px) rotateX(4deg) rotateY(-4deg);
    box-shadow: 0 40px 80px rgba(99,102,241,0.2), 0 20px 40px rgba(0,0,0,0.08);
  }

  .btn-primary {
    background: linear-gradient(135deg,#4f46e5,#7c3aed);
    color:#fff;
    padding:13px 28px;
    border-radius:12px;
    font-weight:600;
    font-size:15px;
    border:none;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    gap:8px;
    transition:all 0.25s;
    position:relative;
    overflow:hidden;
    white-space:nowrap;
  }
  .btn-primary::after {
    content:'';
    position:absolute;
    top:-50%;left:-50%;
    width:200%;height:200%;
    background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%);
    animation:shimmerLine 2.5s ease-in-out infinite;
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(79,70,229,0.4); }

  .btn-secondary {
    background:#fff;
    color:#4f46e5;
    padding:13px 28px;
    border-radius:12px;
    font-weight:600;
    font-size:15px;
    border:2px solid #e8e9ff;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    gap:8px;
    transition:all 0.25s;
    white-space:nowrap;
  }
  .btn-secondary:hover { background:#f5f5ff; border-color:#c7c9ff; transform:translateY(-2px); box-shadow:0 8px 24px rgba(79,70,229,0.12); }

  .nav-link {
    color:#64748b;
    font-size:14px;
    font-weight:500;
    cursor:pointer;
    padding:6px 4px;
    transition:color 0.2s;
    display:flex;align-items:center;gap:4px;
    text-decoration:none;
  }
  .nav-link:hover { color:#4f46e5; }

  .feature-card {
    background:#fff;
    border-radius:20px;
    padding:28px;
    border:1px solid #e8eaff;
    transition:all 0.3s;
    position:relative;
    overflow:hidden;
  }
  .feature-card::before {
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.04));
    opacity:0;
    transition:opacity 0.3s;
  }
  .feature-card:hover { transform:translateY(-6px); box-shadow:0 24px 48px rgba(99,102,241,0.12); border-color:#c7c9ff; }
  .feature-card:hover::before { opacity:1; }

  .badge-pill {
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:6px 14px;
    border-radius:100px;
    font-size:12px;
    font-weight:600;
    background:rgba(99,102,241,0.08);
    color:#4f46e5;
    border:1px solid rgba(99,102,241,0.2);
    letter-spacing:0.04em;
  }

  .stat-card {
    background:#fff;
    border-radius:16px;
    padding:20px;
    border:1px solid #eaecff;
    box-shadow:0 4px 16px rgba(0,0,0,0.04);
    transition:all 0.3s;
  }
  .stat-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(99,102,241,0.1); }

  .glass-card {
    background:rgba(255,255,255,0.85);
    backdrop-filter:blur(24px);
    border:1px solid rgba(255,255,255,0.9);
    border-radius:24px;
    box-shadow:0 24px 64px rgba(99,102,241,0.12), 0 8px 24px rgba(0,0,0,0.04);
  }

  .section-bg-alt {
    background:linear-gradient(180deg,#f5f7ff 0%,#eef0ff 100%);
  }

  .tag-chip {
    background:rgba(255,255,255,0.9);
    border:1px solid #e2e4ff;
    border-radius:12px;
    padding:10px 16px;
    font-size:13px;
    font-weight:500;
    display:flex;align-items:center;gap:8px;
    transition:all 0.25s;
    cursor:default;
  }
  .tag-chip:hover { background:#fff; transform:translateY(-2px); box-shadow:0 8px 20px rgba(99,102,241,0.1); }

  .progress-bar-inner {
    height:100%;
    border-radius:4px;
    background:linear-gradient(90deg,#4f46e5,#7c3aed);
    animation:progressFill 1.5s cubic-bezier(0.4,0,0.2,1) forwards;
    animation-delay:0.3s;
    width:0;
  }

  .ticket-tag { border-radius:6px; padding:2px 8px; font-size:10px; font-weight:700; letter-spacing:0.06em; }

  .footer-link { color:#94a3b8; font-size:13px; cursor:pointer; transition:color 0.2s; text-decoration:none; display:block; margin-bottom:10px; }
  .footer-link:hover { color:#4f46e5; }

  .input-field {
    background:rgba(255,255,255,0.9);
    border:1px solid #e2e4ff;
    border-radius:10px;
    padding:11px 16px;
    font-size:14px;
    color:#1a1d2e;
    outline:none;
    width:100%;
    transition:border-color 0.2s;
    font-family:inherit;
  }
  .input-field:focus { border-color:#4f46e5; box-shadow:0 0 0 3px rgba(79,70,229,0.1); }

  .hero-section { 
    background:linear-gradient(160deg,#f8f9ff 0%,#edf0ff 50%,#f4f0ff 100%);
    min-height:90vh;
    position:relative;
    overflow:hidden;
  }

  /* ── 3D Illustrated Decoration Icons ── */
  .deco-card-3d {
    background:linear-gradient(145deg,#ffffff,#f0f2ff);
    border-radius:24px;
    box-shadow:
      0 24px 60px rgba(99,102,241,0.18),
      0 8px 20px rgba(0,0,0,0.06),
      inset 0 2px 0 rgba(255,255,255,1),
      inset 0 -1px 0 rgba(99,102,241,0.08);
    position:relative;
    overflow:hidden;
    display:flex;align-items:center;justify-content:center;
  }
  .deco-card-3d::before {
    content:'';
    position:absolute;top:0;left:0;right:0;height:45%;
    background:linear-gradient(180deg,rgba(255,255,255,0.7),transparent);
    border-radius:24px 24px 0 0;
    pointer-events:none;
  }
  .deco-card-3d::after {
    content:'';
    position:absolute;inset:0;
    border-radius:24px;
    border:1px solid rgba(255,255,255,0.8);
    pointer-events:none;
  }
  .deco-cube-3d {
    background:linear-gradient(145deg,rgba(140,158,255,0.35),rgba(99,102,241,0.25));
    backdrop-filter:blur(20px);
    border-radius:28px;
    border:1px solid rgba(255,255,255,0.5);
    box-shadow:
      0 24px 60px rgba(99,102,241,0.25),
      0 8px 20px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,0.8);
    position:relative;
    overflow:hidden;
    display:flex;align-items:center;justify-content:center;
  }
  .deco-cube-3d::before {
    content:'';
    position:absolute;top:0;left:0;right:0;height:50%;
    background:linear-gradient(180deg,rgba(255,255,255,0.35),transparent);
    border-radius:28px 28px 0 0;
    pointer-events:none;
  }
  @keyframes coinSpin {
    0%   { transform: rotateY(0deg) translateY(0px); }
    50%  { transform: rotateY(180deg) translateY(-8px); }
    100% { transform: rotateY(360deg) translateY(0px); }
  }
  .coin-spin { animation: coinSpin 4s ease-in-out infinite; }

  /* 3D Icon containers */
  .icon-3d {
    background:linear-gradient(135deg,#fff 0%,#f0f2ff 100%);
    border-radius:20px;
    box-shadow:
      0 20px 50px rgba(99,102,241,0.15),
      0 8px 20px rgba(0,0,0,0.06),
      inset 0 1px 0 rgba(255,255,255,1);
    display:flex;align-items:center;justify-content:center;
    position:relative;
    overflow:hidden;
  }
  .icon-3d::before {
    content:'';position:absolute;
    top:0;left:0;right:0;height:40%;
    background:linear-gradient(180deg,rgba(255,255,255,0.6),transparent);
    border-radius:20px 20px 0 0;
  }

  .section-label {
    font-size:11px;
    font-weight:700;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:#4f46e5;
  }

  .ai-badge {
    display:inline-flex;align-items:center;gap:6px;
    padding:4px 10px;
    border-radius:100px;
    font-size:11px;font-weight:600;
    background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12));
    color:#6366f1;
    border:1px solid rgba(99,102,241,0.25);
  }

  /* Dashed orbit ring */
  .orbit-ring {
    border:2px dashed rgba(99,102,241,0.25);
    border-radius:50%;
    position:absolute;
    animation:spinSlow 20s linear infinite;
  }

  /* Recharts-style line for finance */
  .chart-line {
    stroke-dasharray:600;
    stroke-dashoffset:600;
    animation:dashDraw 2s ease-out 0.5s forwards;
  }

  /* Tooltip popups */
  .tooltip-popup {
    animation:dropIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* Scan effect for AI section */
  .ai-scan::after {
    content:'';
    position:absolute;
    left:0;right:0;height:2px;
    background:linear-gradient(90deg,transparent,rgba(99,102,241,0.8),transparent);
    animation:scanLine 3s ease-in-out infinite;
    animation-delay:1s;
  }

  /* Donut chart segments */
  .donut-seg {
    stroke-linecap:round;
    transition:stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1);
  }

  /* Kanban card hover */
  .kanban-card {
    background:#fff;
    border:1px solid #eef0ff;
    border-radius:14px;
    padding:14px;
    margin-bottom:10px;
    box-shadow:0 2px 8px rgba(0,0,0,0.04);
    transition:all 0.25s;
    cursor:pointer;
  }
  .kanban-card:hover { transform:translateX(3px); border-color:#c7caff; box-shadow:0 4px 16px rgba(99,102,241,0.1); }

  /* Nav scrolled effect */
  .nav-scrolled {
    box-shadow:0 4px 24px rgba(99,102,241,0.08);
    background:rgba(255,255,255,0.97) !important;
  }

  @media (max-width:768px) {
    .hero-grid { flex-direction:column !important; }
    .hide-mobile { display:none !important; }
    .features-grid { grid-template-columns:1fr !important; }
  }
`;

// ─── SVG 3D Icons ─────────────────────────────────────────────────────────────
const QuotiqLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <defs>
      <linearGradient id="logo-g" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4f46e5" />
        <stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <circle cx="18" cy="18" r="18" fill="url(#logo-g)" />
    <circle cx="18" cy="18" r="11" stroke="white" strokeWidth="2.5" fill="none" />
    <circle cx="18" cy="18" r="4" fill="white" />
    <line x1="26" y1="26" x2="31" y2="31" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StarIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#4f46e5' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
    <path d="M8 0l1.8 5.4h5.7l-4.6 3.3 1.8 5.4L8 11l-4.7 3.1 1.8-5.4L.6 5.4h5.6L8 0z" />
  </svg>
);

const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#4f46e5' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1v4M8 11v4M1 8h4M11 8h4M3.05 3.05l2.83 2.83M10.12 10.12l2.83 2.83M12.95 3.05l-2.83 2.83M5.88 10.12l-2.83 2.83" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="8" cy="8" r="2" fill={color} />
  </svg>
);

const BoltIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M9.5 1.5L4 9h5.5L6.5 14.5L12 7H6.5L9.5 1.5z" fill="white" />
  </svg>
);

const PlayIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8.5" stroke="#4f46e5" strokeWidth="1.5" />
    <path d="M7 6l5 3-5 3V6z" fill="#4f46e5" />
  </svg>
);

const ArrowRightIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="7" fill={color} fillOpacity="0.12" />
    <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── 3D Hero Quotation Card ────────────────────────────────────────────────────
const HeroQuotationCard: React.FC = () => (
  <div className="glass-card card-3d" style={{ width: 380, padding: '28px', position: 'relative', zIndex: 2 }}>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#6366f1" strokeWidth="1.5" />
            <path d="M7 4v3l2 1" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>New Quotation</span>
      </div>
      <div className="ai-badge">
        <SparkleIcon size={12} color="#6366f1" />
        AI Assistant
      </div>
    </div>

    {/* Client */}
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Client</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#818cf8,#4f46e5)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AC</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1d2e' }}>Acme Corporation</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 5.5l3 3 3-3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
      </div>
    </div>

    {/* Table */}
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #f1f3ff' }}>
          {['Item', 'Qty', 'Price', 'Total'].map((h) => (
            <th key={h} style={{ textAlign: h === 'Item' ? 'left' : 'right', fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '6px 0', paddingRight: h !== 'Total' ? 8 : 0 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          { item: 'Website Development', qty: 1, price: '$2,500', total: '$2,500' },
          { item: 'UI/UX Design',         qty: 1, price: '$1,200', total: '$1,200' },
          { item: 'API Integration',      qty: 1, price: '$800',   total: '$800'   },
          { item: 'Maintenance (6 Mo.)',  qty: 1, price: '$600',   total: '$600'   },
        ].map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f8f9ff' }}>
            <td style={{ fontSize: 12, color: '#374151', padding: '7px 0' }}>{row.item}</td>
            <td style={{ fontSize: 12, color: '#374151', textAlign: 'right', paddingRight: 8 }}>{row.qty}</td>
            <td style={{ fontSize: 12, color: '#374151', textAlign: 'right', paddingRight: 8 }}>{row.price}</td>
            <td style={{ fontSize: 12, color: '#374151', textAlign: 'right' }}>{row.total}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Totals */}
    <div style={{ borderTop: '1px solid #eef0ff', paddingTop: 12, marginBottom: 18 }}>
      {[
        { label: 'Subtotal', value: '$5,100', bold: false },
        { label: 'Tax (18%)', value: '$918', bold: false },
        { label: 'Total', value: '$6,018', bold: true },
      ].map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: row.bold ? '#1a1d2e' : '#64748b', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
          <span style={{ fontSize: 12, color: row.bold ? '#4f46e5' : '#374151', fontWeight: row.bold ? 800 : 500 }}>{row.value}</span>
        </div>
      ))}
    </div>

    {/* Convert button */}
    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>
      Convert to Invoice
    </button>

    {/* PDF badge */}
    <div style={{ position: 'absolute', bottom: 28, right: -18, background: '#fff', borderRadius: 12, padding: '10px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #eef0ff', display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 30, height: 36, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>PDF</span>
      </div>
    </div>
  </div>
);

// ─── AI Suggestion Popup ───────────────────────────────────────────────────────
const AISuggestionCard: React.FC = () => (
  <div className="glass-card tooltip-popup" style={{ padding: '16px 20px', width: 200, position: 'absolute', bottom: 60, right: -40, zIndex: 3, animationDelay: '1.2s' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <SparkleIcon size={14} color="#6366f1" />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>AI Suggestion</span>
    </div>
    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>Add maintenance package?</p>
    <button style={{ fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Add to Quote →</button>
  </div>
);

// ─── Finance Chart (SVG) ──────────────────────────────────────────────────────
const FinanceChart: React.FC = () => {
  const incomePts = "20,120 50,100 80,85 110,90 140,70 170,65 200,55 230,50 260,45";
  const expensePts = "20,130 50,125 80,115 110,120 140,108 170,115 200,105 230,100 260,95";
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef0ff', flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', marginBottom: 4 }}>Cash Flow Trend</div>
      <svg width="100%" height="160" viewBox="0 0 280 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e879f9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {[30,60,90,120].map(y => <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#f1f3ff" strokeWidth="1" />)}
        {/* Income area */}
        <polyline points={incomePts} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
        {/* Expense area */}
        <polyline points={expensePts} fill="none" stroke="#e879f9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" style={{ animationDelay: '0.3s' }} />
        {/* Dots */}
        {[[260, 45], [260, 95]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={i === 0 ? '#4f46e5' : '#e879f9'} />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 24, height: 3, background: '#4f46e5', borderRadius: 2 }} /><span style={{ fontSize: 11, color: '#64748b' }}>Income</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 24, height: 3, background: '#e879f9', borderRadius: 2 }} /><span style={{ fontSize: 11, color: '#64748b' }}>Expenses</span></div>
      </div>
    </div>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ size?: number }> = ({ size = 120 }) => {
  const cx = size / 2, cy = size / 2, r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const segs = [
    { pct: 35, color: '#4f46e5', label: 'Team' },
    { pct: 28, color: '#7c3aed', label: 'Operations' },
    { pct: 18, color: '#06b6d4', label: 'Marketing' },
    { pct: 12, color: '#f59e0b', label: 'Software' },
    { pct: 7,  color: '#e2e8f0', label: 'Others' },
  ];
  let cumulative = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {segs.map((seg, i) => {
        const dashLen = (seg.pct / 100) * circ;
        const offset = circ - dashLen;
        const rotOffset = (cumulative / 100) * 360;
        cumulative += seg.pct;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={size * 0.15}
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={circ - dashLen - (circ * (cumulative - seg.pct) / 100) + circ}
            style={{ transform: `rotate(${rotOffset}deg)`, transformOrigin: `${cx}px ${cy}px` }}
            className="donut-seg"
          />
        );
      })}
    </svg>
  );
};

// ─── Main LandingPage Component ───────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'payroll' | 'expenses' | 'liabilities'>('payroll');
  const [activeTicketTab, setActiveTicketTab] = useState('All Tickets');

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{LANDING_CSS}</style>
      <div className="lp-root">

        {/* ══════════════════════════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════════════════════════ */}
        <nav
          style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: navScrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.1)',
            transition: 'all 0.3s',
            boxShadow: navScrolled ? '0 4px 24px rgba(99,102,241,0.08)' : 'none',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', height: 68, gap: 32 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <QuotiqLogo size={34} />
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1d2e', fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.02em' }}>Quotiq</span>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: 28, flex: 1, justifyContent: 'center' }} className="hide-mobile">
              {['Product', 'Features', 'Templates', 'Integrations', 'Pricing', 'Resources'].map((item) => (
                <a key={item} href="#" className="nav-link">
                  {item}
                  {(item === 'Product' || item === 'Resources') && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  )}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <a href="#" className="nav-link" style={{ color: '#374151', fontWeight: 600 }}>Log in</a>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                Start Free Trial <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section className="hero-section">
          {/* 3D Illustrated decorations */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {/* Paper plane 3D card — top right */}
            <div className="float-3d-alt" style={{ position: 'absolute', top: '8%', right: '4%', animationDelay: '0.5s' }}>
              <div className="deco-card-3d" style={{ width: 72, height: 72 }}>
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                  <defs><linearGradient id="plane-g" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#818cf8" /><stop offset="1" stopColor="#4f46e5" /></linearGradient></defs>
                  <path d="M3 19L35 5 21 34 17 21 3 19z" fill="url(#plane-g)" />
                  <path d="M17 21l4-16" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
                </svg>
              </div>
            </div>
            {/* Sparkle 3D card — bottom right area */}
            <div className="float-3d" style={{ position: 'absolute', top: '22%', right: '1%', animationDelay: '1.5s' }}>
              <div className="deco-card-3d" style={{ width: 54, height: 54 }}>
                <SparkleIcon size={26} color="#4f46e5" />
              </div>
            </div>
            {/* Mini bar chart 3D cube — bottom left */}
            <div className="float-3d-slow" style={{ position: 'absolute', bottom: '12%', left: '3%', animationDelay: '2s' }}>
              <div className="deco-cube-3d" style={{ width: 68, height: 68 }}>
                <svg width="36" height="32" viewBox="0 0 36 32" fill="none">
                  <rect x="2" y="18" width="7" height="12" rx="2" fill="#818cf8" opacity="0.9"/>
                  <rect x="13" y="10" width="7" height="20" rx="2" fill="#6366f1"/>
                  <rect x="24" y="4" width="7" height="26" rx="2" fill="#4f46e5"/>
                  <rect x="0" y="30" width="36" height="1.5" rx="0.75" fill="rgba(255,255,255,0.4)"/>
                </svg>
              </div>
            </div>
            {/* Small sparkle — bottom left corner */}
            <div className="float-3d" style={{ position: 'absolute', top: '62%', left: '1%', animationDelay: '0.8s' }}>
              <div className="deco-card-3d" style={{ width: 42, height: 42 }}>
                <SparkleIcon size={20} color="#7c3aed" />
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 100px', display: 'flex', alignItems: 'center', gap: 64, position: 'relative' }} className="hero-grid">

            {/* Left content */}
            <div style={{ flex: 1, maxWidth: 520 }}>
              <div className="badge-pill" style={{ marginBottom: 24, animation: 'fadeSlideUp 0.6s ease-out both' }}>
                <SparkleIcon size={13} color="#4f46e5" />
                AI-Powered Quotation Generator
              </div>

              <h1 style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', animation: 'fadeSlideUp 0.6s ease-out 0.1s both' }}>
                Create Quotes.<br />
                Win Deals.<br />
                <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Get Paid.
                </span>
              </h1>

              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 440, marginTop: 20, marginBottom: 36, animation: 'fadeSlideUp 0.6s ease-out 0.2s both' }}>
                Quotiq helps modern businesses generate professional quotations in seconds, manage clients, track approvals, and convert quotes to invoices — effortlessly.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeSlideUp 0.6s ease-out 0.3s both' }}>
                <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
                  <BoltIcon size={16} /> Generate Quote Now
                </button>
                <button className="btn-secondary" style={{ fontSize: 15, padding: '14px 28px' }}>
                  <PlayIcon size={18} /> Watch Demo
                </button>
              </div>

              {/* Feature chips */}
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap', animation: 'fadeSlideUp 0.6s ease-out 0.4s both' }}>
                {[
                  { icon: '⚡', title: 'AI-Powered', sub: 'Auto Fill' },
                  { icon: '🔄', title: 'Convert to', sub: 'Invoice in 1 Click' },
                  { icon: '✨', title: 'Beautiful', sub: 'PDF Export' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, background: '#f0f2ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '1px solid #e0e4ff', flexShrink: 0 }}>{f.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>{f.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quotation card + decorations */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
              {/* Orbit ring */}
              <div className="orbit-ring" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.4 }} />

              <HeroQuotationCard />
              <AISuggestionCard />

              {/* Floating stat badges */}
              <div className="tooltip-popup" style={{ position: 'absolute', top: '8%', left: '-5%', background: '#fff', borderRadius: 14, padding: '12px 16px', boxShadow: '0 12px 36px rgba(99,102,241,0.15)', border: '1px solid #eef0ff', animationDelay: '0.8s' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>This Month</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>$24,680</div>
                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>↑ 32.4% vs last month</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FINANCE MANAGEMENT SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 32px', background: 'linear-gradient(160deg,#f8f9ff,#eef0ff,#f5f0ff)', position: 'relative', overflow: 'hidden' }}>
          {/* 3D Wallet decoration — top right */}
          <div className="float-3d-alt" style={{ position: 'absolute', top: '3%', right: '1%', pointerEvents: 'none', animationDelay: '0.4s' }}>
            <div style={{ position: 'relative', width: 120, height: 110 }}>
              {/* Wallet body */}
              <div style={{ width: 100, height: 80, background: 'linear-gradient(135deg,#818cf8 0%,#4f46e5 60%,#7c3aed 100%)', borderRadius: 18, position: 'absolute', bottom: 0, left: 10, boxShadow: '0 16px 40px rgba(79,70,229,0.4), inset 0 2px 0 rgba(255,255,255,0.2)' }}>
                {/* Wallet clasp */}
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', borderRadius: '50%', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.15)' }} />
                {/* Card slots */}
                <div style={{ position: 'absolute', top: 12, left: 12, width: 40, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3 }} />
                <div style={{ position: 'absolute', top: 22, left: 12, width: 28, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
              </div>
              {/* Cards sticking out */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 75, height: 46, background: 'linear-gradient(135deg,#c084fc,#9333ea)', borderRadius: 12, transform: 'rotate(-12deg)', boxShadow: '0 8px 24px rgba(147,51,234,0.3)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <div style={{ position: 'absolute', top: 5, left: 18, width: 75, height: 46, background: 'linear-gradient(135deg,#67e8f9,#06b6d4)', borderRadius: 12, transform: 'rotate(-4deg)', boxShadow: '0 8px 24px rgba(6,182,212,0.3)', border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
          </div>
          {/* Gold coin — bottom right */}
          <div className="float-3d" style={{ position: 'absolute', bottom: '12%', right: '6%', pointerEvents: 'none', animationDelay: '1s' }}>
            <div className="coin-spin" style={{ width: 52, height: 52, background: 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 50%, #b45309 100%)', borderRadius: '50%', boxShadow: 'inset -5px -5px 14px rgba(0,0,0,0.2), inset 3px 3px 8px rgba(255,255,255,0.4), 0 12px 32px rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#92400e' }}>$</div>
          </div>

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Section header */}
            <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start', marginBottom: 56 }}>
              <div style={{ flex: '0 0 340px' }}>
                <div className="badge-pill" style={{ marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="#4f46e5" /><rect x="7" y="1" width="5" height="5" rx="1.2" fill="#7c3aed" opacity="0.5" /><rect x="1" y="7" width="5" height="5" rx="1.2" fill="#7c3aed" opacity="0.5" /><rect x="7" y="7" width="5" height="5" rx="1.2" fill="#4f46e5" /></svg>
                  Finance Management
                </div>
                <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 16 }}>
                  Take Control of<br />
                  <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your Finances</span>
                </h2>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
                  Get a real-time overview of your cash flow, income, expenses, and profitability — all in one place.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['Real-time Overview', 'Cash Flow Tracking', 'Profitability Insights'].map((t, i) => (
                    <div key={i} className="tag-chip">
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                        {['📊', '💰', '📈'][i]}
                      </div>
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finance Overview Card */}
              <div style={{ flex: 1 }}>
                <div className="glass-card card-3d" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>Finance Overview</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8f9ff', border: '1px solid #eef0ff', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="#94a3b8" strokeWidth="1.2" /><path d="M1 5h10" stroke="#94a3b8" strokeWidth="1.2" /></svg>
                      This Month <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    </div>
                  </div>
                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                    {[
                      { label: 'Total Revenue', val: '$124,850', change: '+15.6%' },
                      { label: 'Total Expenses', val: '$68,420', change: '+8.3%', warn: true },
                      { label: 'Net Profit', val: '$56,430', change: '+23.7%' },
                      { label: 'Cash Balance', val: '$42,380', change: '+11.2%' },
                    ].map((s, i) => (
                      <div key={i} className="stat-card">
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1d2e', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.val}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: s.warn ? '#f59e0b' : '#10b981' }}>
                          {s.change} <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs last month</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <FinanceChart />
                    {/* Expense Breakdown donut */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef0ff', flex: '0 0 220px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', marginBottom: 12 }}>Expense Breakdown</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                          <DonutChart size={100} />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#1a1d2e' }}>$68,420</div>
                            <div style={{ fontSize: 9, color: '#94a3b8' }}>Total</div>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {[
                            { label: 'Team', pct: '35%', color: '#4f46e5' },
                            { label: 'Operations', pct: '28%', color: '#7c3aed' },
                            { label: 'Marketing', pct: '18%', color: '#06b6d4' },
                            { label: 'Software', pct: '12%', color: '#f59e0b' },
                            { label: 'Others', pct: '7%', color: '#e2e8f0' },
                          ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#374151', marginBottom: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                                {item.label}
                              </div>
                              <span style={{ fontWeight: 600 }}>{item.pct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI Insights row ── */}
            <div style={{ display: 'flex', gap: 32, alignItems: 'stretch', marginBottom: 48 }}>
              {/* 3D AI Robot illustration */}
              <div style={{ flex: '0 0 200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse-3d" style={{ position: 'relative', width: 180, height: 180 }}>
                  {/* Platform base */}
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 22, background: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', borderRadius: '50%', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 18, background: 'linear-gradient(135deg,#ddd6fe,#c4b5fd)', borderRadius: '50%' }} />
                  {/* Robot sphere body */}
                  <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120, background: 'radial-gradient(circle at 38% 32%, #f1f5f9 0%, #e2e8f0 40%, #cbd5e1 100%)', borderRadius: '50%', boxShadow: 'inset -10px -10px 24px rgba(0,0,0,0.12), inset 5px 5px 16px rgba(255,255,255,0.9), 0 20px 50px rgba(99,102,241,0.25)' }}>
                    {/* Screen face */}
                    <div style={{ position: 'absolute', top: '28%', left: '18%', right: '18%', height: '36%', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 12, boxShadow: '0 0 20px rgba(99,102,241,0.6), inset 0 0 10px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {/* Waveform */}
                      <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                        <path d="M0 10 Q5 2 10 10 Q15 18 20 10 Q25 2 30 10 Q35 18 40 10 Q45 2 50 10 Q55 18 60 10" stroke="#818cf8" strokeWidth="2" fill="none" strokeLinecap="round">
                          <animate attributeName="d" dur="1.2s" repeatCount="indefinite"
                            values="M0 10 Q5 2 10 10 Q15 18 20 10 Q25 2 30 10 Q35 18 40 10 Q45 2 50 10 Q55 18 60 10;M0 10 Q5 16 10 10 Q15 4 20 10 Q25 16 30 10 Q35 4 40 10 Q45 16 50 10 Q55 4 60 10;M0 10 Q5 2 10 10 Q15 18 20 10 Q25 2 30 10 Q35 18 40 10 Q45 2 50 10 Q55 18 60 10" />
                        </path>
                      </svg>
                    </div>
                    {/* Ear dots */}
                    <div style={{ position: 'absolute', left: 4, top: '45%', width: 10, height: 18, background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', borderRadius: 5, boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)' }} />
                    <div style={{ position: 'absolute', right: 4, top: '45%', width: 10, height: 18, background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', borderRadius: 5, boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)' }} />
                    {/* Pink accent dot */}
                    <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)', width: 14, height: 14, background: 'radial-gradient(circle at 35% 35%,#f9a8d4,#ec4899)', borderRadius: '50%', boxShadow: '0 0 10px rgba(236,72,153,0.5)' }} />
                  </div>
                  {/* Floating sparkle/chart cards around robot */}
                  <div className="float-3d" style={{ position: 'absolute', top: 10, left: -10, animationDelay: '0s' }}>
                    <div className="deco-card-3d" style={{ width: 40, height: 40 }}><SparkleIcon size={18} color="#6366f1" /></div>
                  </div>
                  <div className="float-3d" style={{ position: 'absolute', top: 10, right: -8, animationDelay: '0.6s' }}>
                    <div className="deco-card-3d" style={{ width: 40, height: 40 }}>
                      <svg width="20" height="18" viewBox="0 0 20 18" fill="none"><rect x="1" y="9" width="4" height="8" rx="1.5" fill="#818cf8"/><rect x="7" y="5" width="4" height="12" rx="1.5" fill="#6366f1"/><rect x="13" y="1" width="4" height="16" rx="1.5" fill="#4f46e5"/></svg>
                    </div>
                  </div>
                  <div className="float-3d-alt" style={{ position: 'absolute', bottom: 30, left: -14, animationDelay: '1.2s' }}>
                    <SparkleIcon size={14} color="#a78bfa" />
                  </div>
                  <div className="float-3d" style={{ position: 'absolute', bottom: 40, right: -12, animationDelay: '0.9s' }}>
                    <SparkleIcon size={12} color="#818cf8" />
                  </div>
                </div>
              </div>

              {/* AI Insights Card */}
              <div className="glass-card" style={{ flex: 1, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>AI Insights</span>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 0 10 0A5 5 0 0 0 2 7z" stroke="#4f46e5" strokeWidth="1.3" /><path d="M7 4v3l2 1" stroke="#4f46e5" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    Refresh Insights
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                  {[
                    { icon: '↑', color: '#10b981', title: 'Revenue Opportunity', desc: 'Your revenue could increase by 24% if you close 5 pending proposals.', action: 'View Details' },
                    { icon: '⚠', color: '#f59e0b', title: 'Expense Alert', desc: 'Marketing spend is 18% higher than usual. Consider optimizing your campaigns.', action: 'View Suggestions' },
                    { icon: '📈', color: '#4f46e5', title: 'Cash Flow Forecast', desc: "You're projected to have a cash surplus of $12,400 in the next 30 days.", action: 'See Forecast' },
                  ].map((insight, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #eef0ff', transition: 'all 0.25s' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${insight.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 18 }}>
                        {insight.icon === '↑' ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 14V4M4 9l5-5 5 5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" /></svg> :
                         insight.icon === '⚠' ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 16h14L9 2z" stroke="#f59e0b" strokeWidth="1.5" /><path d="M9 8v4M9 13.5v.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" /></svg> :
                         <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 14l4-4 3 2 4-6 3 2" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 6 }}>{insight.title}</div>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{insight.desc}</p>
                      <button style={{ fontSize: 12, fontWeight: 600, color: insight.color, background: 'none', border: `1px solid ${insight.color}30`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {insight.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right copy */}
              <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="badge-pill" style={{ marginBottom: 16, width: 'fit-content' }}>
                  <SparkleIcon size={12} color="#4f46e5" />
                  AI Insights
                </div>
                <h3 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 14 }}>
                  AI-Powered Insights that Drive Decisions
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                  Let AI analyze your data and surface opportunities, risks, and recommendations to grow your business.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {['Smart Analysis', 'Opportunity Detection', 'Risk Alerts', 'Actionable Recommendations'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckIcon size={16} color="#4f46e5" />
                      <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payroll & Expenses row ── */}
            <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
              {/* Left copy */}
              <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="badge-pill" style={{ marginBottom: 16, width: 'fit-content' }}>
                  <SparkleIcon size={12} color="#4f46e5" />
                  Payroll & Expenses
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 12 }}>
                  Manage Payroll,<br />
                  <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Expenses & Liabilities</span>
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                  Simplify payouts, track expenses, and manage liabilities with accuracy and ease.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { icon: '🤖', label: 'Payroll Automation' },
                    { icon: '📋', label: 'Expense Tracking' },
                    { icon: '📌', label: 'Liability Management' },
                  ].map((t, i) => (
                    <div key={i} className="tag-chip" style={{ flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', minWidth: 80, textAlign: 'center' }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <span style={{ fontSize: 10, color: '#374151', fontWeight: 600 }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payroll Card */}
              <div className="glass-card" style={{ flex: 1, padding: 28 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, background: '#f8f9ff', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
                  {(['payroll', 'expenses', 'liabilities'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '7px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: activeTab === tab ? '#fff' : 'transparent',
                        color: activeTab === tab ? '#1a1d2e' : '#94a3b8',
                        boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.2s',
                        textTransform: 'capitalize',
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                  {/* Upcoming Payroll */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Upcoming Payroll</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>May 31, 2025</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1d2e', marginBottom: 4, letterSpacing: '-0.02em' }}>$28,450</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <div style={{ display: 'flex' }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: `hsl(${230 + i * 30},70%,60%)`, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0 }} />)}
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b' }}>24 Employees</span>
                    </div>
                    <button className="btn-secondary" style={{ fontSize: 12, padding: '8px 20px' }}>Run Payroll</button>
                  </div>

                  {/* Recent Expenses */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Recent Expenses</span>
                      <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>View All</span>
                    </div>
                    {[
                      { icon: '🖥', label: 'Office Supplies', date: 'May 12, 2025', amount: '$320.00' },
                      { icon: '💻', label: 'Software Subscription', date: 'May 11, 2025', amount: '$1,250.00' },
                      { icon: '✈', label: 'Travel Expense', date: 'May 09, 2025', amount: '$560.00' },
                      { icon: '👥', label: 'Client Meeting', date: 'May 08, 2025', amount: '$245.00' },
                    ].map((exp, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{exp.icon}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1d2e' }}>{exp.label}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>{exp.date}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>{exp.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* Liabilities Overview */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Liabilities Overview</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                        <DonutChart size={80} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: 9, fontWeight: 800, color: '#1a1d2e' }}>$42,800</div>
                          <div style={{ fontSize: 7, color: '#94a3b8' }}>Total</div>
                        </div>
                      </div>
                      <div>
                        {[
                          { label: 'Loans Payable', val: '$18,500' },
                          { label: 'Vendor Payables', val: '$15,200' },
                          { label: 'Tax Payable', val: '$6,100' },
                          { label: 'Other Liabilities', val: '$3,000' },
                        ].map((l, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 10, color: '#374151', marginBottom: 4 }}>
                            <span style={{ color: '#94a3b8' }}>{l.label}</span>
                            <span style={{ fontWeight: 600 }}>{l.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Calculator/clipboard decoration */}
              <div style={{ flex: '0 0 160px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {/* Clipboard icon */}
                <div className="float-3d-alt" style={{ animationDelay: '0.3s' }}>
                  <div className="deco-cube-3d" style={{ width: 90, height: 90 }}>
                    <svg width="48" height="52" viewBox="0 0 48 52" fill="none">
                      <rect x="4" y="8" width="40" height="44" rx="6" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                      <rect x="16" y="2" width="16" height="12" rx="4" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.8)" strokeWidth="1"/>
                      <line x1="12" y1="22" x2="36" y2="22" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="12" y1="29" x2="36" y2="29" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="12" y1="36" x2="28" y2="36" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="38" cy="44" r="7" fill="#10b981" opacity="0.9"/>
                      <path d="M35 44l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {/* Mini gold coin */}
                <div className="coin-spin" style={{ width: 38, height: 38, background: 'radial-gradient(circle at 35% 30%,#fde68a,#f59e0b,#b45309)', borderRadius: '50%', boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.2), inset 2px 2px 6px rgba(255,255,255,0.4), 0 8px 20px rgba(245,158,11,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#92400e', animationDelay: '0.5s' }}>$</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FEATURES SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 32px', background: '#f8f9ff', position: 'relative', overflow: 'hidden' }}>
          {/* 3D Bar chart cube — top left */}
          <div className="float-3d" style={{ position: 'absolute', top: '3%', left: '1%', pointerEvents: 'none' }}>
            <div className="deco-cube-3d" style={{ width: 76, height: 76 }}>
              <svg width="44" height="40" viewBox="0 0 44 40" fill="none">
                <rect x="2" y="22" width="9" height="16" rx="3" fill="rgba(255,255,255,0.55)"/>
                <rect x="15" y="12" width="9" height="26" rx="3" fill="rgba(255,255,255,0.75)"/>
                <rect x="28" y="4" width="9" height="34" rx="3" fill="rgba(255,255,255,0.9)"/>
                <line x1="0" y1="38.5" x2="44" y2="38.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          {/* 3D Sparkle card — bottom left */}
          <div className="float-3d-alt" style={{ position: 'absolute', bottom: '8%', left: '4%', pointerEvents: 'none', animationDelay: '1.5s' }}>
            <div className="deco-card-3d" style={{ width: 52, height: 52 }}>
              <SparkleIcon size={24} color="#7c3aed" />
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start', marginBottom: 64 }}>
              {/* Left: headline + 3D blobs */}
              <div style={{ flex: '0 0 380px', position: 'relative' }}>
                <div className="badge-pill" style={{ marginBottom: 16 }}>
                  <SparkleIcon size={12} color="#4f46e5" />
                  Smart. Fast. Accurate.
                </div>
                <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 16 }}>
                  Everything you need to<br />
                  <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>create, manage & close.</span>
                </h2>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
                  Quotiq brings all the tools you need to generate quotes, manage clients, track approvals, and convert them into invoices — in one place.
                </p>
                {/* 3D donut blob */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div className="float-3d-alt" style={{ position: 'relative', width: 100, height: 100 }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'conic-gradient(#4f46e5 0deg 126deg, #7c3aed 126deg 226deg, #ec4899 226deg 291deg, #e2e8f0 291deg 360deg)', boxShadow: '0 20px 50px rgba(79,70,229,0.3)' }} />
                    <div style={{ position: 'absolute', inset: '22px', borderRadius: '50%', background: '#f8f9ff' }} />
                  </div>
                  <div className="float-3d" style={{ animationDelay: '1s' }}>
                    <div className="icon-3d" style={{ width: 60, height: 60 }}>
                      <SparkleIcon size={28} color="#4f46e5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature cards grid */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="features-grid">
                  {[
                    { num: '01', emoji: '🤖', color: '#818cf8', bg: '#eef0ff', title: 'AI Auto-Fill', desc: 'AI scans your inputs and auto-generates line items, pricing & terms instantly.' },
                    { num: '02', emoji: '📄', color: '#06b6d4', bg: '#e0f9ff', title: 'Custom Templates', desc: 'Create branded templates that match your business and reuse with ease.' },
                    { num: '03', emoji: '🔄', color: '#10b981', bg: '#e0fdf4', title: 'One-Click Convert', desc: 'Turn quotes into professional invoices in one click and get paid faster.' },
                    { num: '04', emoji: '✅', color: '#f59e0b', bg: '#fffbeb', title: 'Track & Approve', desc: 'Real-time tracking for views, approvals, comments and client actions.' },
                    { num: '05', emoji: '👥', color: '#8b5cf6', bg: '#f5f0ff', title: 'Client Management', desc: 'Keep all your clients, contacts & history organized in one beautiful dashboard.' },
                    { num: '06', emoji: '📊', color: '#3b82f6', bg: '#eff6ff', title: 'Insights & Reports', desc: 'Powerful analytics to track quotes, revenue, conversions and team performance.' },
                  ].map((f, i) => (
                    <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 8px 20px ${f.color}20` }}>
                          {f.emoji}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#d4d6ff', letterSpacing: '0.04em' }}>{f.num}</span>
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{f.title}</h4>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── See Quotiq in Action ── */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 8 }}>See Quotiq in Action</h2>
              <p style={{ fontSize: 16, color: '#64748b' }}>Create a quote, customize, and send — all in under 60 seconds.</p>
            </div>

            {/* Demo card */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', height: 480 }}>
                {/* Sidebar */}
                <div style={{ width: 200, background: '#fff', borderRight: '1px solid #eef0ff', padding: '20px 0', flexShrink: 0 }}>
                  <div style={{ padding: '0 16px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f3ff', marginBottom: 8 }}>
                    <QuotiqLogo size={28} />
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1d2e', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Quotiq</span>
                  </div>
                  {[
                    { icon: '⊟', label: 'Dashboard' },
                    { icon: '📜', label: 'Quotes', active: true },
                    { icon: '🧾', label: 'Invoices' },
                    { icon: '👤', label: 'Clients' },
                    { icon: '📦', label: 'Products' },
                    { icon: '📋', label: 'Templates' },
                    { icon: '📊', label: 'Reports' },
                    { icon: '⚙', label: 'Settings' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', fontSize: 13, fontWeight: item.active ? 600 : 500,
                        color: item.active ? '#4f46e5' : '#64748b',
                        background: item.active ? '#f0f2ff' : 'transparent',
                        borderLeft: item.active ? '3px solid #4f46e5' : '3px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: 28, background: '#f8f9ff', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1d2e', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Create New Quotation</h3>
                    <div className="ai-badge"><SparkleIcon size={11} color="#6366f1" /> AI Assistant</div>
                  </div>

                  {/* Steps */}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
                    {[{ n: 1, label: 'Client Details', active: true }, { n: 2, label: 'Add Items', active: false }, { n: 3, label: 'Review & Send', active: false }].map((step, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: step.active ? '#4f46e5' : '#e2e8ff', fontSize: 12, fontWeight: 700, color: step.active ? '#fff' : '#94a3b8',
                          }}>{step.n}</div>
                          <span style={{ fontSize: 13, fontWeight: step.active ? 700 : 400, color: step.active ? '#1a1d2e' : '#94a3b8' }}>{step.label}</span>
                        </div>
                        {i < 2 && <div style={{ flex: 1, height: 2, background: '#e2e8ff', margin: '0 12px', alignSelf: 'center' }} />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Client Details */}
                  <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, border: '1px solid #eef0ff' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Client Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: 'Client Name', val: 'Acme Corporation' },
                        { label: 'Email', val: 'contact@acme.com' },
                        { label: 'Currency', val: 'USD – US Dollar ▾' },
                      ].map((f, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{f.label}</div>
                          <div style={{ background: '#f8f9ff', border: '1px solid #eef0ff', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1a1d2e' }}>{f.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Items table */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>Items</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto', gap: 8, fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8, padding: '0 4px' }}>
                      {['Item', 'Description', 'Qty', 'Price', 'Total', ''].map(h => <div key={h}>{h}</div>)}
                    </div>
                    {[
                      { item: 'Website Development', desc: 'Full website with responsive design', qty: 1, price: '$2,500', total: '$2,500' },
                      { item: 'UI/UX Design', desc: 'User interface and experience design', qty: 1, price: '$1,200', total: '$1,200' },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto', gap: 8, background: '#f8f9ff', borderRadius: 8, padding: '10px 4px', marginBottom: 4, fontSize: 12, color: '#374151', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{row.item}</span>
                        <span style={{ color: '#94a3b8' }}>{row.desc}</span>
                        <span>{row.qty}</span>
                        <span>{row.price}</span>
                        <span style={{ fontWeight: 600 }}>{row.total}</span>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        </div>
                      </div>
                    ))}
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4f46e5', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', marginTop: 4 }}>
                      + Add Item
                    </button>

                    {/* Totals */}
                    <div style={{ borderTop: '1px solid #eef0ff', paddingTop: 12, marginTop: 8 }}>
                      {[
                        { label: 'Subtotal', val: '$3,700' },
                        { label: 'Tax (18%)', val: '$666' },
                        { label: 'Total', val: '$4,366', bold: true },
                      ].map((r) => (
                        <div key={r.label} style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{r.label}</span>
                          <span style={{ fontSize: 12, fontWeight: r.bold ? 800 : 500, color: r.bold ? '#4f46e5' : '#374151', minWidth: 60, textAlign: 'right' }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview panel */}
                <div style={{ width: 260, background: '#fff', borderLeft: '1px solid #eef0ff', padding: 20, overflowY: 'auto', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>Preview Quote</div>
                  <div style={{ background: '#f8f9ff', borderRadius: 12, padding: 16, border: '1px solid #eef0ff', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <QuotiqLogo size={28} />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#1a1d2e' }}>QUOTATION</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>#QT-250513-01</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>Acme Corporation</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>contact@acme.com</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>May 13, 2025</div>
                    </div>
                    <div style={{ borderTop: '1px solid #eef0ff', paddingTop: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                        <span>Item</span><span>Amount</span>
                      </div>
                      {[
                        { item: 'Website Development', amt: '$2,500' },
                        { item: 'UI/UX Design', amt: '$1,200' },
                      ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#374151', marginBottom: 4 }}>
                          <span>{r.item}</span>
                          <span style={{ fontWeight: 600 }}>{r.amt}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #eef0ff', paddingTop: 8, marginTop: 6 }}>
                        {[['Subtotal', '$3,700'], ['Tax (18%)', '$666'], ['Total', '$4,366']].map(([l, v], i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: i === 2 ? 800 : 400, color: i === 2 ? '#4f46e5' : '#374151', marginBottom: 3 }}>
                            <span style={{ color: '#64748b' }}>{l}</span>
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Signature */}
                    <div style={{ borderTop: '1px solid #eef0ff', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 16, fontFamily: 'Georgia, serif', color: '#374151', fontStyle: 'italic' }}>Jean Aginn</span>
                    </div>
                  </div>

                  {/* Mini revenue badge */}
                  <div className="stat-card">
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Revenue This Month</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1d2e' }}>$24,680</div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>↑ 32.4%</div>
                    <div style={{ height: 40, marginTop: 8 }}>
                      <svg width="100%" height="40" viewBox="0 0 160 40">
                        <defs>
                          <linearGradient id="mini-g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <polyline points="0,35 26,30 53,25 80,18 106,22 133,10 160,5" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            TEAM COLLABORATION SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 32px', background: 'linear-gradient(160deg,#eef0ff,#f5f0ff,#f8f9ff)', position: 'relative', overflow: 'hidden' }}>
          {/* 3D notification bell — bottom left */}
          <div className="float-3d-alt" style={{ position: 'absolute', bottom: '3%', left: '1%', pointerEvents: 'none', animationDelay: '0.6s' }}>
            <div className="deco-cube-3d" style={{ width: 80, height: 80 }}>
              <svg width="40" height="42" viewBox="0 0 40 42" fill="none">
                <path d="M20 4C12 4 8 10 8 18v8l-3 4h30l-3-4v-8C32 10 28 4 20 4z" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.9)" strokeWidth="1"/>
                <rect x="15" y="34" width="10" height="4" rx="2" fill="rgba(255,255,255,0.7)"/>
                <circle cx="30" cy="8" r="5" fill="#10b981"/>
                <text x="30" y="11" textAnchor="middle" fontSize="6" fontWeight="800" fill="white">3</text>
              </svg>
            </div>
          </div>

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', marginBottom: 48 }}>
              {/* Left copy */}
              <div style={{ flex: '0 0 300px' }}>
                <div className="badge-pill" style={{ marginBottom: 16 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="#4f46e5" /><path d="M1 12c0-3 2.5-4.5 5.5-4.5S12 9 12 12" stroke="#4f46e5" strokeWidth="1.3" strokeLinecap="round" /></svg>
                  Team Collaboration
                </div>
                <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 14 }}>
                  Collaborate Better.<br />
                  <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Deliver Faster.</span>
                </h2>
                <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
                  Bring your team, projects, tasks, and conversations together in one unified workspace. Align, communicate, and get things done.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { icon: '✅', title: 'Task Assignment', desc: 'Assign tasks, set deadlines, and track progress.' },
                    { icon: '💬', title: 'Team Chat', desc: 'Chat in real-time with your team or clients inside each project.' },
                    { icon: '🎫', title: 'Raise Tickets', desc: 'Report issues, bugs, or requests and get faster resolutions.' },
                    { icon: '🗂', title: 'Project Workspace', desc: 'Dedicated space for every project and all its activities.' },
                  ].map((f, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #eef0ff', transition: 'all 0.25s' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 8 }}>{f.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', marginBottom: 4 }}>{f.title}</div>
                      <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</p>
                    </div>
                  ))}
                </div>

                {/* 3D Team collaboration illustration */}
                <div className="float-3d" style={{ marginTop: 32, position: 'relative', height: 120, display: 'flex', alignItems: 'flex-end' }}>
                  {/* Platform */}
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 160, height: 20, background: 'linear-gradient(135deg,#c7d2fe,#a5b4fc)', borderRadius: '50%', boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }} />
                  {/* Three people silhouettes */}
                  {[
                    { x: 18, scale: 0.85, color: '#818cf8', delay: '0.2s' },
                    { x: 58, scale: 1,    color: '#4f46e5', delay: '0s'   },
                    { x: 98, scale: 0.85, color: '#7c3aed', delay: '0.4s' },
                  ].map((p, i) => (
                    <div key={i} style={{ position: 'absolute', bottom: 14, left: p.x, transform: `scale(${p.scale})`, transformOrigin: 'bottom center' }}>
                      {/* Body */}
                      <div style={{ width: 32, height: 44, background: `linear-gradient(180deg,${p.color},${p.color}cc)`, borderRadius: '14px 14px 10px 10px', margin: '0 auto', boxShadow: `0 8px 20px ${p.color}40` }} />
                      {/* Head */}
                      <div style={{ width: 26, height: 26, background: `radial-gradient(circle at 38% 35%,${p.color}dd,${p.color})`, borderRadius: '50%', margin: '-8px auto 0', boxShadow: `inset -3px -3px 8px rgba(0,0,0,0.15), inset 2px 2px 6px rgba(255,255,255,0.25)` }} />
                    </div>
                  ))}
                  {/* Floating chat bubble */}
                  <div className="float-3d-alt" style={{ position: 'absolute', top: -5, right: -10, animationDelay: '0.8s' }}>
                    <div className="deco-card-3d" style={{ width: 44, height: 44 }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <rect x="1" y="1" width="20" height="16" rx="5" fill="#4f46e5" opacity="0.9"/>
                        <path d="M5 18l3-3h13" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                        <circle cx="7" cy="9" r="1.5" fill="white"/>
                        <circle cx="11" cy="9" r="1.5" fill="white"/>
                        <circle cx="15" cy="9" r="1.5" fill="white"/>
                      </svg>
                    </div>
                  </div>
                  {/* Sparkle */}
                  <div className="float-3d" style={{ position: 'absolute', top: 10, left: -8, animationDelay: '1.2s' }}>
                    <SparkleIcon size={16} color="#818cf8" />
                  </div>
                </div>
              </div>

              {/* Kanban board */}
              <div style={{ flex: 1 }}>
                <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                  {/* Board header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#818cf8,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="12" rx="2" fill="white" opacity="0.7" /><rect x="9" y="2" width="5" height="8" rx="2" fill="white" /></svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>Project Workspace</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Website Redesign
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5.5l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', background: '#e8fdf5', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#10b981', border: '1px solid #d1fae5' }}>In Progress</div>
                      <div style={{ display: 'flex' }}>
                        {['#4f46e5','#7c3aed','#ec4899'].map((c, i) => (
                          <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0 }} />
                        ))}
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f3ff', border: '2px solid #fff', marginLeft: -8, fontSize: 10, fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+3</div>
                      </div>
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #eef0ff', marginBottom: 20 }}>
                    {['Overview', 'Tasks', 'Chat', 'Files', 'Tickets', 'Reports'].map((t, i) => (
                      <button key={t} style={{
                        padding: '8px 16px', fontSize: 13, fontWeight: i === 1 ? 700 : 500,
                        color: i === 1 ? '#4f46e5' : '#94a3b8', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: i === 1 ? '2px solid #4f46e5' : '2px solid transparent',
                        transition: 'all 0.2s',
                      }}>{t}</button>
                    ))}
                  </div>

                  {/* Kanban columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {[
                      {
                        title: 'To Do', count: 5, color: '#94a3b8',
                        cards: [
                          { title: 'Create wireframes for landing page', date: 'May 20', prio: 'High', prios: '#ef4444' },
                          { title: 'Set up analytics events', date: 'May 21', prio: 'Medium', prios: '#f59e0b' },
                          { title: 'Prepare UI style guide', date: 'May 22', prio: 'Low', prios: '#10b981' },
                          { title: 'Competitor research', date: 'May 23', prio: 'Low', prios: '#10b981' },
                        ],
                      },
                      {
                        title: 'In Progress', count: 3, color: '#f59e0b',
                        cards: [
                          { title: 'Design homepage UI', date: 'May 18', prio: 'High', prios: '#ef4444', progress: 60 },
                          { title: 'Develop API integration', date: 'May 19', prio: 'Medium', prios: '#f59e0b', progress: 40 },
                          { title: 'Build responsive components', date: 'May 21', prio: 'Medium', prios: '#f59e0b', progress: 70 },
                        ],
                      },
                      {
                        title: 'Review', count: 2, color: '#8b5cf6',
                        cards: [
                          { title: 'Review homepage design', date: 'May 17', prio: 'High', prios: '#ef4444' },
                          { title: 'Code review & refactoring', date: 'May 20', prio: 'Medium', prios: '#f59e0b' },
                        ],
                      },
                      {
                        title: 'Done', count: 4, color: '#10b981',
                        cards: [
                          { title: 'Project kickoff meeting', date: 'May 10', done: true },
                          { title: 'Market & user research', date: 'May 11', done: true },
                          { title: 'Information architecture', date: 'May 12', done: true },
                          { title: 'Brand guidelines review', date: 'May 13', done: true },
                        ],
                      },
                    ].map((col, ci) => (
                      <div key={ci}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>{col.title}</span>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f1f3ff', fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{col.count}</div>
                          </div>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.5" fill="#94a3b8" /><circle cx="8" cy="8" r="1.5" fill="#94a3b8" /><circle cx="8" cy="13" r="1.5" fill="#94a3b8" /></svg>
                        </div>
                        {col.cards.slice(0, 3).map((card, ki) => (
                          <div key={ki} className="kanban-card">
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1d2e', marginBottom: 8, lineHeight: 1.4 }}>{card.title}</div>
                            {'done' in card && card.done ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981' }}>
                                <CheckIcon size={12} color="#10b981" /> <span style={{ color: '#94a3b8' }}>{card.date}</span>
                              </div>
                            ) : (
                              <div>
                                {(card as any).progress !== undefined && (
                                  <div style={{ height: 4, background: '#f1f3ff', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(card as any).progress}%`, background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', borderRadius: 2 }} />
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#818cf8,#4f46e5)' }} />
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{card.date}</span>
                                  </div>
                                  {(card as any).prio && (
                                    <div style={{ padding: '2px 7px', borderRadius: 100, fontSize: 9, fontWeight: 700, background: `${(card as any).prios}15`, color: (card as any).prios }}>{(card as any).prio}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        <button style={{ width: '100%', padding: '8px', fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>+ Add Task</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Tickets section ── */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>Raise & Track Tickets</h4>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>+ New Ticket</button>
                  </div>

                  {/* Ticket tabs */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {['All Tickets', 'Bug', 'Feature', 'Improvement', 'Support'].map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTicketTab(t)}
                        style={{
                          padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: activeTicketTab === t ? '#4f46e5' : '#f1f3ff',
                          color: activeTicketTab === t ? '#fff' : '#64748b',
                          transition: 'all 0.2s',
                        }}
                      >{t}</button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#f1f3ff', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 4h10M2 8h8M4 11h4" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      Filters
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#f1f3ff', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#64748b' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6l5-5 5 5" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      Sort
                    </button>
                  </div>

                  {/* Ticket cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
                    {[
                      { type: 'BUG', id: '#TK-1249', title: 'Mobile menu not working on Safari', proj: 'Website Redesign', person: 'John D.', prio: 'High', prios: '#ef4444', status: 'In Progress', statc: '#f59e0b' },
                      { type: 'FEATURE', id: '#TK-1247', title: 'Add dark mode support', proj: 'Website Redesign', person: 'Emily R.', prio: 'Medium', prios: '#f59e0b', status: 'To Do', statc: '#94a3b8' },
                      { type: 'BUG', id: '#TK-1248', title: 'Form validation error messages', proj: 'Website Redesign', person: 'Mike L.', prio: 'Medium', prios: '#f59e0b', status: 'In Progress', statc: '#f59e0b' },
                      { type: 'SUPPORT', id: '#TK-1245', title: 'Server error on file upload', proj: 'Website Redesign', person: 'Sarah K.', prio: 'High', prios: '#ef4444', status: 'Open', statc: '#3b82f6' },
                      { type: 'IMPROVEMENT', id: '#TK-1244', title: 'Improve page loading speed', proj: 'Website Redesign', person: 'Alex P.', prio: 'Low', prios: '#10b981', status: 'Review', statc: '#8b5cf6' },
                    ].map((ticket, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #eef0ff', transition: 'all 0.25s', cursor: 'pointer' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 30px rgba(99,102,241,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div className="ticket-tag" style={{
                            background: ticket.type === 'BUG' ? '#fee2e2' : ticket.type === 'FEATURE' ? '#e0fdf4' : ticket.type === 'SUPPORT' ? '#eff6ff' : '#f5f0ff',
                            color: ticket.type === 'BUG' ? '#dc2626' : ticket.type === 'FEATURE' ? '#10b981' : ticket.type === 'SUPPORT' ? '#3b82f6' : '#8b5cf6',
                          }}>
                            {ticket.type}
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="3" r="1.2" fill="#94a3b8" /><circle cx="7" cy="7" r="1.2" fill="#94a3b8" /><circle cx="7" cy="11" r="1.2" fill="#94a3b8" /></svg>
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>{ticket.id}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', lineHeight: 1.4, marginBottom: 8 }}>{ticket.title}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{ticket.proj}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#818cf8,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                              {ticket.person.split(' ')[0]![0]}
                            </div>
                            <span style={{ fontSize: 10, color: '#64748b' }}>{ticket.person}</span>
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: ticket.prios, background: `${ticket.prios}15`, padding: '2px 6px', borderRadius: 100 }}>● {ticket.prio}</div>
                        </div>
                        <div style={{ marginTop: 10, padding: '5px 10px', borderRadius: 8, background: `${ticket.statc}15`, fontSize: 11, fontWeight: 700, color: ticket.statc, textAlign: 'center' }}>
                          {ticket.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project chat panel */}
              <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column' }}>
                <div className="glass-card" style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>Project Chat</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="1.5" fill="#94a3b8" /><circle cx="8" cy="8" r="1.5" fill="#94a3b8" /><circle cx="13" cy="8" r="1.5" fill="#94a3b8" /></svg>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 8 }}>CHANNELS</div>
                  {['# Client Chat', '# Team Updates', '# Design Team', '# Dev Team', '# General'].map((ch, i) => (
                    <div key={ch} style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#4f46e5' : '#64748b', background: i === 0 ? '#f0f2ff' : 'transparent', marginBottom: 2, cursor: 'pointer' }}>
                      {ch}
                    </div>
                  ))}

                  <div style={{ flex: 1, overflowY: 'auto', marginTop: 12, paddingTop: 12, borderTop: '1px solid #eef0ff' }}>
                    {[
                      { name: 'Sarah (Client)', time: '10:30 AM', msg: 'Hey team! The new homepage looks amazing. Can we add one more section for testimonials?', color: '#ec4899', mine: false },
                      { name: 'Alex (You)', time: '10:32 AM', msg: "Sure! We'll add that section and share the update by EOD.", color: '#4f46e5', mine: true },
                      { name: 'Mike (Designer)', time: '10:33 AM', msg: "On it! Sharing the wireframe shortly.", color: '#10b981', mine: false },
                    ].map((msg, i) => (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: msg.color }}>{msg.name}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{msg.time}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, background: msg.mine ? '#f0f2ff' : '#f8f9ff', padding: '8px 10px', borderRadius: 10, border: `1px solid ${msg.mine ? '#e0e4ff' : '#eef0ff'}` }}>
                          {msg.msg}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #eef0ff', marginTop: 8 }}>
                    <input className="input-field" placeholder="Type a message..." style={{ flex: 1, padding: '8px 12px', fontSize: 12 }} />
                    <button style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 7L1 1l4 6-4 6 12-6z" fill="white" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CTA SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section style={{ padding: '60px 32px', background: '#f8f9ff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg,#f0f2ff,#ede9ff,#f5f0ff)', borderRadius: 32, padding: '64px 48px', position: 'relative', overflow: 'hidden', border: '1px solid #e0e4ff' }}>
              {/* Background decorations */}
              <div className="blob-sphere blob-purple float-3d-alt" style={{ position: 'absolute', top: '10%', left: '2%', width: 80, height: 80, opacity: 0.2 }} />
              <div className="blob-sphere blob-blue float-3d" style={{ position: 'absolute', bottom: '10%', right: '25%', width: 50, height: 50, opacity: 0.2, animationDelay: '1s' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
                {/* Rocket 3D */}
                <div className="rocket-fly" style={{ flexShrink: 0 }}>
                  <div style={{ width: 160, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ fontSize: 90, filter: 'drop-shadow(0 20px 40px rgba(79,70,229,0.3))', transform: 'rotate(-10deg)' }}>🚀</div>
                    {/* Cloud puffs */}
                    <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                      {[40, 55, 45].map((w, i) => (
                        <div key={i} className="float-3d" style={{ width: w, height: w * 0.6, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', backdropFilter: 'blur(4px)', animationDelay: `${i * 0.3}s` }} />
                      ))}
                    </div>
                    {/* Stars */}
                    {[[-30, 30], [35, 20], [-20, -20]].map(([x, y], i) => (
                      <div key={i} className="float-3d" style={{ position: 'absolute', top: `calc(30% + ${y}px)`, left: `calc(50% + ${x}px)`, animationDelay: `${i * 0.4}s` }}>
                        <StarIcon size={12} color="#c7d2fe" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div className="badge-pill" style={{ marginBottom: 16 }}>
                    <BoltIcon size={11} />
                    <span style={{ color: '#4f46e5' }}>Ready to Grow Your Business?</span>
                  </div>
                  <h2 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0f172a', marginBottom: 14 }}>
                    Ready to simplify your quoting<br />
                    and <span style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>win more deals?</span>
                  </h2>
                  <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 460 }}>
                    Join thousands of businesses using Quotiq to create quotes, manage projects, and get paid faster — all in one powerful workspace.
                  </p>
                </div>

                {/* Buttons */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px 28px', fontSize: 15 }}>
                    Start Free Trial <ArrowRightIcon size={18} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CheckIcon size={12} color="#10b981" /> No credit card required
                    </div>
                    <span>•</span>
                    <span>14-day free trial</span>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px 28px', fontSize: 15 }}>
                    <PlayIcon size={18} /> Watch Demo
                  </button>
                </div>

                {/* Target 3D */}
                <div className="float-3d-alt" style={{ flexShrink: 0, fontSize: 80, filter: 'drop-shadow(0 20px 40px rgba(79,70,229,0.25))' }}>🎯</div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 20, marginTop: 24 }}>
              {[
                { icon: '🛡', title: '14-Day Free Trial', sub: 'No credit card required' },
                { icon: '🔒', title: 'Bank-Level Security', sub: 'Your data is always safe' },
                { icon: '☁', title: '99.9% Uptime', sub: 'Reliable, always available' },
                { icon: '🎧', title: '24/7 Customer Support', sub: "We're here to help" },
                { icon: '❤', title: 'Loved by 10,000+ Teams', sub: 'Across the globe' },
              ].map((b, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', border: '1px solid #eef0ff', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'all 0.25s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════════ */}
        <footer style={{ background: '#fff', borderTop: '1px solid #eef0ff', padding: '60px 32px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr 1fr 1fr 280px', gap: 32, paddingBottom: 48, borderBottom: '1px solid #eef0ff' }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <QuotiqLogo size={30} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1d2e', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Quotiq</span>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>AI-powered quotation generator for modern businesses. Create, manage, and close deals faster than ever.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['in', '𝕏', '▶', '◉'].map((icon, i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#4f46e5', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer columns */}
              {[
                {
                  title: 'Product',
                  links: ['Features', 'Templates', 'Integrations', 'Pricing', 'Updates', 'Roadmap'],
                },
                {
                  title: 'Use Cases',
                  links: ['Freelancers', 'Agencies', 'Software Companies', 'Consultants', 'Startups', 'Enterprises'],
                },
                {
                  title: 'Resources',
                  links: ['Documentation', 'Help Center', 'Guides & Tutorials', 'Blog', 'API Reference', 'Community'],
                },
                {
                  title: 'Company',
                  links: ['About Us', 'Careers  🔴Hiring', 'Contact Us', 'Partners', 'Affiliates', 'Press Kit'],
                },
                {
                  title: 'Legal',
                  links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy', 'Security', 'GDPR'],
                },
              ].map((col, ci) => (
                <div key={ci}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', marginBottom: 16 }}>{col.title}</div>
                  {col.links.map((link, li) => {
                    const isHiring = link.includes('🔴Hiring');
                    const [text, badge] = isHiring ? link.split('  ') : [link, null];
                    return (
                      <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <a href="#" className="footer-link" style={{ marginBottom: 0 }}>{text}</a>
                        {badge && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#ef4444', padding: '2px 6px', borderRadius: 100 }}>Hiring</span>}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Newsletter */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', marginBottom: 8 }}>Stay Updated</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div className="float-3d" style={{ fontSize: 24 }}>✉️</div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>Get product updates, tips, and exclusive offers straight to your inbox.</p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="input-field" placeholder="Enter your email" style={{ fontSize: 13, padding: '10px 14px' }} />
                  <button style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M15 8L1 1l4 7-4 7 14-7z" fill="white" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer bottom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>© 2024 Quotiq. All rights reserved.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>All systems operational</span>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
                  🌍 English (US) ▾
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
                  🌙 Dark Mode
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
