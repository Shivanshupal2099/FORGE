import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';

/* ─── PALETTE ─────────────────────────────── */
const Y   = "#F5C400";
const YL  = "#FFFBE8";   // light yellow surface
const YM  = "#FFF3B0";   // mid yellow surface
const O   = "#E8600A";
const BK  = "#0B0B00";
const BK2 = "#1A1800";
const CR  = "#FFFDF0";   // page background
const W   = "#FFFFFF";
const BD  = "#DDD5A0";   // warm border
const BD2 = "#C8BF80";   // stronger border
const MU  = "#6B6040";   // muted body text
const MU2 = "#A89E70";   // lighter muted
const TL  = "#009E82";   // teal online dot

/* ─── GLOBAL CSS ───────────────────────────── */
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=Inter:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:${CR};color:${BK};font-family:'Inter',sans-serif;overflow-x:hidden;}
.dm{font-family:'DM Sans',sans-serif;}
.rev{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.rev.in{opacity:1;transform:none;}
button,a{font-family:inherit;text-decoration:none;}
input,textarea{font-family:'Inter',sans-serif;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:${CR};}
::-webkit-scrollbar-thumb{background:${Y};border-radius:3px;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes slideIn{from{transform:translateX(16px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* Responsive Design */
@media (max-width: 768px) {
  nav {
    padding: 12px 20px !important;
  }
  nav > div:last-child {
    display: none !important;
  }
  section {
    padding: 60px 20px !important;
  }
  .home-popup {
    width: 95% !important;
    max-width: 400px !important;
  }
}

@media (max-width: 480px) {
  nav {
    padding: 10px 16px !important;
  }
  section {
    padding: 48px 16px !important;
  }
  h1 {
    font-size: 2.5rem !important;
  }
  h2 {
    font-size: 1.8rem !important;
  }
}
`;

function useGlobalCSS() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GCSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".rev").forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

/* ─── ATOMS ────────────────────────────────── */
const Tag = ({ children, col = BK }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
    color: col === BK ? W : BK,
    background: col === BK ? BK : Y,
    border: `2px solid ${BK}`,
    padding: "4px 14px", borderRadius: 4,
    fontFamily: "'DM Sans',sans-serif",
    boxShadow: `2px 2px 0 ${col === BK ? Y : BK}`,
  }}>{children}</span>
);

const Btn = ({ children, href = "#join", yellow, style = {} }) => (
  <a href={href} style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14,
    padding: "13px 28px", borderRadius: 6, cursor: "pointer",
    background: yellow ? Y : W,
    color: BK,
    border: `2px solid ${BK}`,
    boxShadow: `3px 3px 0 ${yellow ? BK : BD2}`,
    transition: "all .15s",
    ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = `4px 4px 0 ${yellow ? BK : BD2}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `3px 3px 0 ${yellow ? BK : BD2}`; }}>
    {children}
  </a>
);

const Sec = ({ id, bg = CR, children, style = {} }) => (
  <section id={id} style={{ background: bg, padding: "96px 0", borderTop: `2px solid ${BD}`, ...style }}>
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px" }}>{children}</div>
  </section>
);

/* ─── PHONE (neobrutalist — the signature risk) ─ */
function Phone({ children, accent = Y }) {
  return (
    <div style={{
      width: 240, background: W, borderRadius: 24,
      border: `2.5px solid ${BK}`,
      overflow: "hidden",
      boxShadow: `5px 5px 0 ${BK}`,
      position: "relative",
    }}>
      <div style={{
        padding: "10px 16px 0", display: "flex", justifyContent: "space-between",
        alignItems: "center", background: accent, borderBottom: `1.5px solid ${BK}`,
      }}>
        <span style={{ fontSize: 10, color: BK, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>9:41</span>
        <div style={{ width: 36, height: 10, background: BK, borderRadius: 10 }} />
        <span style={{ fontSize: 10, color: BK, fontWeight: 700 }}>●●●</span>
      </div>
      {children}
    </div>
  );
}

/* ─── FEATURE DEMOS ──────────────────────────── */
function DemoChat() {
  const msgs = [
    { from: "AR", text: "Hey! Saw your EdTech profile — building in the same space.", side: "left" },
    { from: "Me", text: "Oh nice! I need a Flutter dev. What have you shipped?", side: "right" },
    { from: "AR", text: "3 apps — check my GitHub link in profile 🔗", side: "left" },
    { from: "Me", text: "Let's connect! Sending a brief now.", side: "right" },
  ];
  return (
    <Phone accent={Y}>
      <div style={{ padding: "8px 12px 4px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1.5px solid ${BD}`, background: YL }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: BK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: Y }}>AR</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif" }}>Arjun R.</div>
          <div style={{ fontSize: 9, color: TL, display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: TL, display: "inline-block" }} />online now
          </div>
        </div>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7, minHeight: 200, background: CR }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.side === "right" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", background: m.side === "right" ? Y : W,
              color: BK, fontSize: 10.5, padding: "7px 10px",
              border: `1.5px solid ${BK}`,
              borderRadius: m.side === "right" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
              lineHeight: 1.4, boxShadow: m.side === "right" ? `2px 2px 0 ${BK}` : `2px 2px 0 ${BD}`,
              animation: `slideIn .3s ease ${i * .1}s both`,
            }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ margin: "8px 12px 12px", background: W, borderRadius: 7, padding: "7px 10px", display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${BD}` }}>
        <span style={{ flex: 1, fontSize: 10, color: MU2 }}>Reply to Arjun…</span>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: BK, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${BK}` }}>
          <span style={{ fontSize: 10, color: Y }}>↑</span>
        </div>
      </div>
    </Phone>
  );
}

function DemoSurvey() {
  const [ans, setAns] = useState(null);
  const opts = ["Under 18", "18–22", "23–28", "29–35", "35+"];
  return (
    <Phone accent={O}>
      <div style={{ padding: "12px 14px", background: CR }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: O, animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: 10, color: O, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>LIVE · 127 responses</span>
        </div>
        <div style={{ background: W, border: `1.5px solid ${BD}`, borderRadius: 10, padding: 12, marginBottom: 10, boxShadow: `2px 2px 0 ${BD}` }}>
          <div style={{ fontSize: 9, color: MU2, marginBottom: 4 }}>Question 1 of 4</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4, marginBottom: 10 }}>What is your age range?</div>
          {opts.map(o => (
            <div key={o} onClick={() => setAns(o)} style={{
              padding: "7px 10px", borderRadius: 6, marginBottom: 5, cursor: "pointer",
              border: `1.5px solid ${ans === o ? BK : BD}`,
              background: ans === o ? Y : W,
              fontSize: 10.5, color: BK, transition: "all .15s",
              boxShadow: ans === o ? `2px 2px 0 ${BK}` : "none",
              fontWeight: ans === o ? 700 : 400,
            }}>{o}</div>
          ))}
        </div>
        <div style={{ background: BK, color: Y, borderRadius: 7, padding: 8, textAlign: "center", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", border: `1.5px solid ${BK}`, boxShadow: `2px 2px 0 ${Y}` }}>
          Next question →
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n === 1 ? Y : BD, border: n === 1 ? `1px solid ${BK}` : "none" }} />
          ))}
        </div>
        <div style={{ fontSize: 9, color: MU, textAlign: "right", marginTop: 3 }}>Earn ₹50 on completion</div>
      </div>
    </Phone>
  );
}

function DemoDiscover() {
  const [scope, setScope] = useState("nearby");
  const scopes = ["nearby", "city", "india", "global"];
  return (
    <Phone accent={Y}>
      <div style={{ height: 190, background: "#E8F0DC", position: "relative", overflow: "hidden", borderBottom: `1.5px solid ${BD}` }}>
        {[25, 50, 75].map(p => <div key={p} style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: BD }} />)}
        {[30, 60].map(p => <div key={p} style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: BD }} />)}
        <div style={{ position: "absolute", top: "10%", left: "10%", right: "10%", bottom: "10%", border: `2px solid ${BD2}`, borderRadius: 8, background: "rgba(255,253,240,0.4)" }} />
        {[
          { x: 35, y: 38, i: "AR", c: BK, cg: Y, l: true },
          { x: 58, y: 26, i: "PR", c: O, cg: W, l: false },
          { x: 22, y: 62, i: "SK", c: "#1A6B54", cg: W, l: true },
        ].map(p => (
          <div key={p.i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: p.c, color: p.cg,
              border: `2px solid ${BK}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 9, fontWeight: 700,
              position: "relative", boxShadow: `2px 2px 0 ${BK}`,
            }}>
              {p.i}
              {p.l && <div style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: TL, border: `1.5px solid ${W}` }} />}
            </div>
            <div style={{ width: 2, height: 6, background: BK }} />
            <div style={{ width: 4, height: 4, background: BK, borderRadius: "50%" }} />
          </div>
        ))}
        <div style={{ position: "absolute", right: "14%", bottom: "22%", width: 32, height: 32, borderRadius: "50%", background: BK, color: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, border: `2px solid ${BK}`, boxShadow: `2px 2px 0 ${Y}` }}>+9</div>
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 4, background: BK, borderRadius: 4, padding: "3px 10px", border: `1.5px solid ${BK}` }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: Y, animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: 9, color: Y, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>Live · 47 builders</span>
        </div>
      </div>
      <div style={{ padding: "8px 12px", background: CR }}>
        <div style={{ display: "flex", gap: 3, background: YL, borderRadius: 6, padding: 3, border: `1.5px solid ${BD}` }}>
          {scopes.map(s => (
            <button key={s} onClick={() => setScope(s)} style={{
              flex: 1, padding: "4px 0", borderRadius: 4, border: s === scope ? `1.5px solid ${BK}` : "1.5px solid transparent", cursor: "pointer",
              background: scope === s ? Y : "transparent",
              color: BK, fontSize: 9, fontWeight: scope === s ? 700 : 400,
              fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
              boxShadow: scope === s ? `1px 1px 0 ${BK}` : "none",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, background: W, borderRadius: 8, padding: "8px 10px", border: `1.5px solid ${BD}`, boxShadow: `2px 2px 0 ${BD}` }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: BK, color: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, border: `1.5px solid ${BK}` }}>AR</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif" }}>Arjun Rawat</div>
            <div style={{ fontSize: 9, color: MU }}>Flutter dev · 1.2km · 94% match</div>
          </div>
          <div style={{ background: Y, border: `1.5px solid ${BK}`, borderRadius: 5, padding: "4px 8px", fontSize: 9, fontWeight: 700, color: BK, boxShadow: `1.5px 1.5px 0 ${BK}`, cursor: "pointer" }}>Connect</div>
        </div>
      </div>
    </Phone>
  );
}

function DemoEvent() {
  const [joined, setJoined] = useState(false);
  return (
    <Phone accent={O}>
      <div style={{ padding: "10px 14px", background: CR }}>
        <div style={{ background: YL, borderRadius: 10, padding: 12, marginBottom: 10, border: `2px solid ${BK}`, boxShadow: `3px 3px 0 ${BK}` }}>
          <div style={{ fontSize: 9, color: O, fontWeight: 700, marginBottom: 4, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: ".06em" }}>🗓 Upcoming</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.3, marginBottom: 5 }}>Kanpur Builder Meetup #4</div>
          <div style={{ fontSize: 10, color: MU, marginBottom: 8 }}>Sat, 15 Feb · 5PM · IIT Kanpur</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {["Networking", "Pitching", "Workshop"].map(t => (
              <span key={t} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: W, color: BK, border: `1px solid ${BD2}`, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ display: "flex" }}>
              {[BK, O, "#1A6B54", "#6B3A20"].map((c, i) => (
                <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, marginLeft: i === 0 ? 0 : -5, border: `1.5px solid ${W}` }} />
              ))}
            </div>
            <span style={{ fontSize: 9, color: MU }}>+43 going · 12 slots left</span>
          </div>
          <button onClick={() => setJoined(!joined)} style={{
            width: "100%", padding: 8, borderRadius: 6, cursor: "pointer",
            background: joined ? W : BK, color: joined ? BK : Y,
            fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
            border: `1.5px solid ${BK}`, boxShadow: `2px 2px 0 ${Y}`,
            transition: "all .15s",
          }}>{joined ? "✓ You're going!" : "Join event"}</button>
        </div>
        {[
          { name: "Jaipur Design Sprint", date: "Feb 20", count: 28, col: O },
          { name: "Delhi AI Founders Night", date: "Feb 23", count: 61, col: "#534AB7" },
        ].map(e => (
          <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${BD}` }}>
            <div style={{ width: 8, height: 28, borderRadius: 2, background: e.col, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: BK, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: 9, color: MU }}>{e.date} · {e.count} going</div>
            </div>
            <span style={{ fontSize: 9, color: e.col, fontWeight: 700, border: `1px solid ${e.col}`, padding: "2px 6px", borderRadius: 4 }}>View</span>
          </div>
        ))}
      </div>
    </Phone>
  );
}

function DemoOffers() {
  return (
    <Phone accent={Y}>
      <div style={{ padding: "10px 14px", background: CR }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🏷</span> Offers from builders
        </div>
        {[
          { name: "Priya R.", role: "UI Designer", offer: "Free 1-hr design review for EdTech founders", tag: "Free", col: O },
          { name: "Rahul V.", role: "Backend Dev", offer: "₹2K MVP audit — I find your biggest tech debt", tag: "₹2,000", col: BK },
          { name: "Neha M.", role: "Growth Hacker", offer: "First 100-user GTM plan, pay after results", tag: "Perf", col: "#1A6B54" },
        ].map((o, i) => (
          <div key={i} style={{
            background: W, borderRadius: 9, padding: 10, marginBottom: 8,
            border: `1.5px solid ${BD}`, boxShadow: `2px 2px 0 ${BD}`,
            transition: "box-shadow .15s, border-color .15s", cursor: "default",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BK; e.currentTarget.style.boxShadow = `3px 3px 0 ${BK}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = `2px 2px 0 ${BD}`; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: o.col, color: W, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, border: `1.5px solid ${BK}` }}>
                {o.name.split(" ").map(w => w[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif" }}>{o.name}</div>
                <div style={{ fontSize: 9, color: MU }}>{o.role}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: o.col === BK ? Y : W, background: o.col, padding: "2px 7px", borderRadius: 4, border: `1px solid ${BK}` }}>{o.tag}</span>
            </div>
            <div style={{ fontSize: 10.5, color: BK, lineHeight: 1.4 }}>{o.offer}</div>
          </div>
        ))}
        <div style={{ background: Y, border: `1.5px solid ${BK}`, borderRadius: 7, padding: "7px 10px", fontSize: 10, color: BK, textAlign: "center", cursor: "pointer", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", boxShadow: `2px 2px 0 ${BK}` }}>
          + Post your own offer
        </div>
      </div>
    </Phone>
  );
}

/* ─── FEATURE DATA ──────────────────────────── */
const FEATURES = [
  {
    id: "chat", icon: "💬", label: "Chat",
    headline: "Talk to the right person.\nNo cold messages.",
    body: "Once a connection is accepted, a private chat unlocks. Every conversation starts with context — who you are, what you're building, what you need. No noise, no spam, no strangers sliding into DMs.",
    bullets: [],
    accent: Y, Demo: DemoChat,
  },
  {
    id: "survey", icon: "📋", label: "Survey",
    headline: "Find 100 real testers.\nIn 24 hours.",
    body: "Post a survey to your exact target demographic — filtered by college, city, age, and domain. Respondents earn rewards. You get clean, geo-tagged, demographic-rich data fast.",
    bullets: [],
    accent: O, Demo: DemoSurvey,
  },
  {
    id: "discover", icon: "🗺", label: "Discover",
    headline: "See who's building\nnear you. Right now.",
    body: "A live map showing builders, co-founders, and service providers — filtered by role, domain, skill, and intent. Scope from 1km to worldwide. Every pin is a real person, open to connect.",
    bullets: ["Live map with real-time pins", "Scope: nearby → global", "Filter by 10+ signals", "Ghost mode for privacy"],
    accent: Y, Demo: DemoDiscover,
  },
  {
    id: "events", icon: "🗓", label: "Events",
    headline: "Create a meetup.\nFill it with builders.",
    body: "Host in-person or online events — hackathons, demo nights, build sprints, networking dinners. ForgeConnect promotes your event to relevant builders nearby. Attendees connect before they arrive.",
    bullets: ["In-person + online events", "Auto-promote to nearby builders", "Pre-event networking", "RSVP + waitlist management"],
    accent: O, Demo: DemoEvent,
  },
  {
    id: "offers", icon: "🏷", label: "Offers",
    headline: "Builders helping builders.\nAt builder rates.",
    body: "Post what you're offering — a free MVP audit, a discounted design sprint, a co-build deal. No per-lead fee. Just the ecosystem helping itself.",
    bullets: ["Free, paid, or equity offers", "Claimed by verified builders", "₹299/yr flat to list"],
    accent: Y, Demo: DemoOffers,
  },
];

/* ─── NAV ───────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isAfterAug4 = new Date() >= new Date('2026-08-04');
  const buttonText = isAfterAug4 ? "Sign up" : "Join waitlist";
  const buttonAction = isAfterAug4 ? () => navigate('/signup') : "#join";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 48px",
      background: scrolled ? CR : "rgba(255,253,240,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: `2px solid ${scrolled ? BD : "transparent"}`,
      transition: "all .3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/forge.png" alt="ForgeConnect" style={{ width: 48, height: 48, borderRadius: 7, objectFit: "contain" }} />
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 900, color: BK, letterSpacing: "-.5px" }}>
          ForgeConnect<span style={{ color: O }}>.</span>
        </span>
      </div>
      
      {/* Desktop Navigation */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {FEATURES.map(f => (
          <a key={f.id} href={`#${f.id}`} style={{ fontSize: 13, color: MU, transition: "color .2s", fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}
            onMouseEnter={e => e.target.style.color = BK}
            onMouseLeave={e => e.target.style.color = MU}>
            {f.label}
          </a>
        ))}
        <Btn href={buttonAction} yellow onClick={isAfterAug4 ? buttonAction : undefined}>{buttonText} →</Btn>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: "none",
          flexDirection: "column",
          gap: "4px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          zIndex: 300,
        }}
        className="mobile-menu-button"
      >
        <span style={{
          width: "24px",
          height: "2px",
          background: BK,
          transition: "all 0.3s",
          transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
        }}></span>
        <span style={{
          width: "24px",
          height: "2px",
          background: BK,
          transition: "all 0.3s",
          opacity: mobileMenuOpen ? 0 : 1
        }}></span>
        <span style={{
          width: "24px",
          height: "2px",
          background: BK,
          transition: "all 0.3s",
          transform: mobileMenuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none"
        }}></span>
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: CR,
          zIndex: 250,
          padding: "80px 24px 24px",
          display: "none",
          flexDirection: "column",
          gap: "24px",
          animation: "slideIn 0.3s ease-out",
        }} className="mobile-menu">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "20px" }}>
            <img src="/forge.png" alt="ForgeConnect" style={{ width: 40, height: 40, borderRadius: 7, objectFit: "contain" }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 900, color: BK, letterSpacing: "-.5px" }}>
              ForgeConnect<span style={{ color: O }}>.</span>
            </span>
          </div>
          {FEATURES.map(f => (
            <a 
              key={f.id} 
              href={`#${f.id}`} 
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontSize: 18, 
                color: BK, 
                fontFamily: "'DM Sans',sans-serif", 
                fontWeight: 700,
                padding: "16px 0",
                textDecoration: "none",
                borderBottom: `1px solid ${BD}`,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = O}
              onMouseLeave={e => e.target.style.color = BK}
            >
              {f.icon} {f.label}
            </a>
          ))}
          <Btn 
            href={buttonAction} 
            yellow 
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (isAfterAug4) buttonAction(e);
            }}
            style={{ 
              width: "100%", 
              textAlign: "center",
              padding: "16px 24px",
              fontSize: 16,
              marginTop: "20px"
            }}
          >
            {buttonText} →
          </Btn>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          nav > div:nth-child(2) {
            display: none !important;
          }
          .mobile-menu-button {
            display: flex !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}

/* ─── HERO ──────────────────────────────────── */
function Hero() {
  const [active, setActive] = useState(0);
  const f = FEATURES[active];
  const Demo = f.Demo;
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % FEATURES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const isAfterAug4 = new Date() >= new Date('2026-08-04');
  const buttonText = isAfterAug4 ? "Sign up" : "Join the waitlist";
  const buttonAction = isAfterAug4 ? () => navigate('/signup') : "#join";

  return (
    <section style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center",
      padding: "120px 48px 80px",
      background: CR,
    }}>
      {/* Yellow bolt accent — top-right decorative block */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 380, height: "100%",
        background: `repeating-linear-gradient(
          -45deg,
          ${YL} 0px,
          ${YL} 12px,
          transparent 12px,
          transparent 24px
        )`,
        opacity: 0.6, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 320, height: "100%",
        background: `linear-gradient(to left, ${YM}, transparent)`,
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1160, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: 64, alignItems: "center", position: "relative", zIndex: 2 }}>
        <div>
          <h1 style={{
            fontFamily: "'DM Sans',sans-serif", fontWeight: 900,
            fontSize: "clamp(44px,6vw,80px)", color: BK,
            lineHeight: 1.0, marginTop: 22, marginBottom: 12,
            letterSpacing: "-3px",
          }}>
            Build with the<br />
            <em style={{ color: O, fontStyle: "normal", position: "relative" }}>right people.<span style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 6, background: Y, zIndex: -1, borderRadius: 2 }} /></em><br />
            <em style={{ color: BK, fontStyle: "normal" }}>Right now.</em>
          </h1>
          <p style={{ fontSize: 17, color: MU, maxWidth: 480, lineHeight: 1.75, marginBottom: 36 }}>
            Discover co-founders, join builder events, survey real users, chat with your future team, and find offers built for you — all on one map. Not LinkedIn. Not WhatsApp. ForgeConnect.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <Btn yellow href={isAfterAug4 ? undefined : "#join"} onClick={isAfterAug4 ? buttonAction : undefined}>{buttonText} →</Btn>
            <Btn href="#discover">Explore the map</Btn>
          </div>

          {/* feature pills */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 36 }}>
            {FEATURES.map((ft, i) => (
              <button key={ft.id} onClick={() => setActive(i)} style={{
                padding: "7px 14px", borderRadius: 5,
                border: `2px solid ${active === i ? BK : BD}`,
                background: active === i ? (ft.accent === Y ? Y : O) : W,
                color: BK, fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: active === i ? `2px 2px 0 ${BK}` : "none",
                transition: "all .15s",
              }}>{ft.icon} {ft.label}</button>
            ))}
          </div>

          {/* trust row */}
          <div className="trust-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: YL, border: `1.5px solid ${BD}`, borderRadius: 8, maxWidth: 460 }}>
            <div style={{ display: "flex" }}>
              {[BK, O, "#1A6B54", "#6B1A38", "#1A3B6B"].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: c, marginLeft: i === 0 ? 0 : -8, border: `2px solid ${CR}` }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: MU }}>
              <strong style={{ color: BK }}>1,200+ builders</strong> on the waitlist
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: MU, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: TL, display: "inline-block", animation: "blink 1.5s infinite" }} />Live in Kanpur
            </span>
          </div>
        </div>

        <div style={{ animation: "floatY 4s ease-in-out infinite", display: "none" }} className="desktop-demo">
          <Demo />
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .desktop-demo {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          section {
            padding: 100px 20px 60px !important;
          }
          .trust-row {
            flex-direction: column;
            text-align: center;
            gap: 12px;
            padding: 16px !important;
          }
          .trust-row > div:first-child {
            justify-content: center;
          }
          .trust-row > span:nth-child(2) {
            font-size: 11px !important;
          }
          .trust-row > span:last-child {
            margin-left: 0 !important;
            margin-top: 8px;
          }
        }
        @media (max-width: 480px) {
          section {
            padding: 80px 16px 48px !important;
          }
          h1 {
            font-size: 2rem !important;
            letter-spacing: -2px !important;
          }
          h1 em {
            font-size: 2rem !important;
          }
          p {
            font-size: 15px !important;
          }
          .trust-row {
            padding: 12px !important;
          }
          .trust-row > div > div {
            width: 24px !important;
            height: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─── FEATURE DEEP-DIVE ─────────────────────── */
function FeatureSection({ f, i }) {
  const Demo = f.Demo;
  const flip = i % 2 === 1;
  return (
    <div id={f.id} style={{ borderTop: `2px solid ${BD}`, padding: "88px 0", background: i % 2 === 1 ? YL : CR }}>
      <div style={{
        maxWidth: 1160, margin: "0 auto", padding: "0 48px",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 80, alignItems: "center",
        direction: flip ? "rtl" : "ltr",
      }} className="rev">
        <div style={{ direction: "ltr" }}>
          <Tag col={f.accent === Y ? BK : O}>{f.icon} {f.label}</Tag>
          <h2 style={{
            fontFamily: "'DM Sans',sans-serif", fontWeight: 900,
            fontSize: "clamp(28px,3.5vw,50px)", color: BK,
            lineHeight: 1.08, marginTop: 18, marginBottom: 18,
            letterSpacing: "-1.5px", whiteSpace: "pre-line",
          }}>{f.headline}</h2>
          <p style={{ fontSize: 16, color: MU, lineHeight: 1.7, marginBottom: 28 }}>{f.body}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {f.bullets.map(b => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 4, background: f.accent, border: `1.5px solid ${BK}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: `1.5px 1.5px 0 ${BK}`,
                }}>
                  <span style={{ fontSize: 10, color: BK, fontWeight: 900 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: BK, fontWeight: 500 }}>{b}</span>
              </div>
            ))}
          </div>
          <Btn href="#join" yellow={f.accent === Y}>Try {f.label} →</Btn>
        </div>
        <div style={{ direction: "ltr", display: "flex", justifyContent: "center" }}>
          <Demo />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          #${f.id} {
            padding: 60px 20px !important;
          }
          #${f.id} > div {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            padding: 0 20px !important;
            direction: ltr !important;
          }
          #${f.id} h2 {
            font-size: 1.8rem !important;
            letter-spacing: -1px !important;
          }
          #${f.id} p {
            font-size: 15px !important;
          }
          #${f.id} > div > div:last-child {
            order: -1;
            margin-bottom: 20px;
          }
        }
        @media (max-width: 480px) {
          #${f.id} {
            padding: 48px 16px !important;
          }
          #${f.id} > div {
            gap: 32px !important;
            padding: 0 16px !important;
          }
          #${f.id} h2 {
            font-size: 1.5rem !important;
          }
          #${f.id} p {
            font-size: 14px !important;
          }
          #${f.id} button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── TICKER / STATS ────────────────────────── */
function StatsStrip() {
  const stats = [
    { n: "2.23L+", l: "DPIIT startups" },
    { n: "15M", l: "Freelancers in IT" },
    { n: "51%", l: "New startups outside metros" },
    { n: "65%", l: "Fail from co-founder mismatch" },
    { n: "₹299", l: "Flat / year for providers" },
  ];
  return (
    <div style={{ background: BK, borderTop: `2px solid ${BK}`, borderBottom: `2px solid ${BK}`, padding: "20px 0", overflow: "hidden" }}>
      <div style={{ display: "flex", animation: "ticker 22s linear infinite", width: "max-content" }} className="ticker-content">
        {[...stats, ...stats, ...stats].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 40px", flexShrink: 0 }} className="ticker-item">
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 22, color: Y, letterSpacing: "-1px" }}>{s.n}</span>
            <span style={{ fontSize: 12, color: MU2, fontWeight: 500, whiteSpace: "nowrap" }}>{s.l}</span>
            <span style={{ color: Y, fontSize: 18 }}>—</span>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .ticker-item {
            padding: 0 24px !important;
          }
          .ticker-item span:first-child {
            font-size: 18px !important;
          }
          .ticker-item span:nth-child(2) {
            font-size: 11px !important;
          }
          .ticker-item span:last-child {
            font-size: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .ticker-item {
            padding: 0 16px !important;
            gap: 12px !important;
          }
          .ticker-item span:first-child {
            font-size: 16px !important;
          }
          .ticker-item span:nth-child(2) {
            font-size: 10px !important;
          }
          .ticker-item span:last-child {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── DISCIPLINES ───────────────────────────── */
const DISCS = [
  { icon: "⚕", name: "Medicine", col: "#C0392B" },
  { icon: "🎓", name: "Education", col: O },
  { icon: "</>", name: "Engineering", col: "#2C3E88" },
  { icon: "✦", name: "Design", col: "#7B2060" },
  { icon: "₹", name: "Finance", col: "#0A5C42" },
  { icon: "🔬", name: "Science", col: "#1A4A7A" },
  { icon: "🌱", name: "AgriTech", col: "#5C3B0A" },
  { icon: "⚖", name: "Law", col: "#3A2208" },
  { icon: "📢", name: "Media", col: "#6B1A38" },
  { icon: "❤", name: "Social", col: "#C0392B" },
  { icon: "🏭", name: "Manufacturing", col: "#1A2A40" },
  { icon: "📦", name: "Commerce", col: O },
];

function Disciplines() {
  return (
    <Sec id="disciplines" bg={YL}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <Tag>Every background welcome</Tag>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(28px,4vw,56px)", color: BK, marginTop: 18, letterSpacing: "-2px", lineHeight: 1.08 }}>
          Different worlds.<br /><em style={{ color: O, fontStyle: "normal", textDecoration: `underline 4px ${Y}` }}>One map.</em>
        </h2>
        <p style={{ fontSize: 17, color: MU, maxWidth: 480, margin: "16px auto 0", lineHeight: 1.75 }}>
          The best startups were built by people with completely different backgrounds.
        </p>
      </div>
      <div className="rev" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {DISCS.map(d => (
          <div key={d.name} style={{
            background: W, border: `2px solid ${BD}`, borderRadius: 8,
            padding: "14px 14px", display: "flex", alignItems: "center", gap: 10,
            cursor: "default", transition: "border-color .15s, transform .15s, box-shadow .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BK; e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `3px 3px 0 ${BK}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: 20 }}>{d.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif" }}>{d.name}</div>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: d.col, marginTop: 3, border: `1px solid ${BK}` }} />
            </div>
          </div>
        ))}
      </div>
      {/* combos */}
      <div className="rev" style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
        {[
          { l: "Medical Doctor", lc: "#C0392B", r: "Flutter Dev", rc: "#2C3E88", built: "Rural HealthTech · ₹12Cr seed" },
          { l: "IIT Engineer", lc: "#2C3E88", r: "Farmer", rc: "#5C3B0A", built: "AgriTech · 8,000 farmers served" },
          { l: "CA & Finance", lc: "#0A5C42", r: "Backend Dev", rc: "#1A4A7A", built: "GST Automation · ₹200Cr processed" },
          { l: "Teacher", lc: O, r: "Designer", rc: "#7B2060", built: "EdTech · 2M students · 14 languages" },
        ].map((c, i) => (
          <div key={i} style={{
            background: W, border: `2px solid ${BD}`, borderRadius: 9, padding: 16,
            transition: "border-color .15s, box-shadow .15s", cursor: "default",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BK; e.currentTarget.style.boxShadow = `3px 3px 0 ${BK}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.lc, background: c.lc + "18", padding: "3px 8px", borderRadius: 4, border: `1px solid ${c.lc}` }}>{c.l}</span>
              <span style={{ color: O, fontWeight: 900, fontSize: 15 }}>+</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: c.rc, background: c.rc + "18", padding: "3px 8px", borderRadius: 4, border: `1px solid ${c.rc}` }}>{c.r}</span>
            </div>
            <div style={{ fontSize: 13, color: MU }}>→ <strong style={{ color: BK }}>{c.built}</strong></div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          #disciplines > div:first-child {
            margin-bottom: 40px !important;
          }
          #disciplines > div:first-child h2 {
            font-size: 1.8rem !important;
          }
          #disciplines > div:first-child p {
            font-size: 15px !important;
          }
          #disciplines > div:nth-child(2) {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
            gap: 8px !important;
          }
          #disciplines > div:nth-child(2) > div {
            padding: 12px !important;
          }
          #disciplines > div:nth-child(2) > div span:first-child {
            font-size: 18px !important;
          }
          #disciplines > div:nth-child(2) > div > div > div:first-child {
            font-size: 11px !important;
          }
          #disciplines > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          #disciplines > div:last-child > div {
            padding: 14px !important;
          }
        }
        @media (max-width: 480px) {
          #disciplines > div:first-child h2 {
            font-size: 1.5rem !important;
          }
          #disciplines > div:nth-child(2) {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
          }
          #disciplines > div:nth-child(2) > div {
            padding: 10px !important;
          }
          #disciplines > div:nth-child(2) > div span:first-child {
            font-size: 16px !important;
          }
          #disciplines > div:nth-child(2) > div > div > div:first-child {
            font-size: 10px !important;
          }
          #disciplines > div:last-child > div {
            padding: 12px !important;
          }
          #disciplines > div:last-child > div > div:first-child {
            gap: 4px !important;
          }
          #disciplines > div:last-child > div > div:first-child > span {
            font-size: 10px !important;
            padding: 3px 6px !important;
          }
          #disciplines > div:last-child > div > div:last-child {
            font-size: 11px !important;
          }
        }
      `}</style>
    </Sec>
  );
}

/* ─── QUOTES ────────────────────────────────── */
const QUOTES = [
  { q: "Great things in business are never done by one person. They're done by a team of people.", name: "Steve Jobs", role: "Co-founder, Apple" },
  { q: "Finding the right co-founder is more important than the idea itself.", name: "Elon Musk", role: "Founder, Tesla · SpaceX" },
  { q: "When you innovate, it matters so much who you surround yourself with from the start.", name: "Larry Ellison", role: "Co-founder, Oracle" },
  { q: "The team you build determines the company you become.", name: "Reid Hoffman", role: "Co-founder, LinkedIn" },
];

function Quotes() {
  return (
    <Sec id="quotes" bg={CR}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Tag col={O}>They all knew this</Tag>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(26px,3.5vw,48px)", color: BK, marginTop: 18, letterSpacing: "-1.5px" }}>
          They all said the same thing.
        </h2>
      </div>
      <div className="rev" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14 }}>
        {QUOTES.map(({ q, name, role }, i) => (
          <div key={i} style={{
            background: i % 2 === 0 ? W : YL,
            border: `2px solid ${BD}`, borderRadius: 12, padding: 28,
            position: "relative", overflow: "hidden",
            transition: "border-color .15s, box-shadow .15s", cursor: "default",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BK; e.currentTarget.style.boxShadow = `4px 4px 0 ${BK}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "absolute", top: -8, left: 10, fontSize: 80, fontWeight: 900, color: Y, opacity: .35, fontFamily: "'DM Sans',sans-serif", lineHeight: 1, pointerEvents: "none" }}>"</div>
            <p style={{ fontSize: 15, color: BK, lineHeight: 1.7, fontStyle: "italic", marginBottom: 20, position: "relative" }}>"{q}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: BK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: Y, flexShrink: 0, fontFamily: "'DM Sans',sans-serif", border: `2px solid ${BK}`, boxShadow: `2px 2px 0 ${Y}` }}>
                {name.split(" ").map(w => w[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: BK, fontFamily: "'DM Sans',sans-serif" }}>{name}</div>
                <div style={{ fontSize: 11, color: MU }}>{role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          #quotes > div:first-child {
            margin-bottom: 32px !important;
          }
          #quotes > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          #quotes > div:last-child > div {
            padding: 24px !important;
          }
          #quotes > div:last-child > div p {
            font-size: 14px !important;
          }
          #quotes > div:last-child > div > div:last-child > div:first-child {
            width: 36px !important;
            height: 36px !important;
            font-size: 11px !important;
          }
          #quotes > div:last-child > div > div:last-child > div:last-child > div:first-child {
            font-size: 12px !important;
          }
          #quotes > div:last-child > div > div:last-child > div:last-child > div:last-child {
            font-size: 10px !important;
          }
        }
        @media (max-width: 480px) {
          #quotes > div:last-child > div {
            padding: 20px !important;
          }
          #quotes > div:last-child > div p {
            font-size: 13px !important;
          }
          #quotes > div:last-child > div > div:last-child {
            gap: 8px !important;
          }
          #quotes > div:last-child > div > div:last-child > div:first-child {
            width: 32px !important;
            height: 32px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </Sec>
  );
}

/* ─── CTA ───────────────────────────────────── */
function CTA() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAfterAug4 = new Date() >= new Date('2026-08-04');

  const submit = async (e) => {
    e.preventDefault();
    
    if (isAfterAug4) {
      navigate('/signup');
      return;
    }

    if (!email || !email.includes("@")) { 
      setMsg("Enter a valid email."); 
      setOk(false); 
      return; 
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/waitlist', { email, phone: phone || null });
      if (response.data.success) {
        setMsg("🎉 You're on the list!"); 
        setOk(true); 
        setEmail("");
        setPhone("");
      } else {
        setMsg(response.data.message || "Something went wrong");
        setOk(false);
      }
    } catch (error) {
      setMsg(error.response?.data?.message || "Something went wrong");
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  if (isAfterAug4) {
    return (
      <section id="join" style={{ background: Y, padding: "112px 48px", borderTop: `2px solid ${BK}`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(0,0,0,0.04) 20px, rgba(0,0,0,0.04) 40px)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 540, margin: "0 auto" }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🚀</div>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(32px,5vw,60px)", color: BK, letterSpacing: "-2.5px", lineHeight: 1.06, marginBottom: 16 }}>
            ForgeConnect is now live!
          </h2>
          <p style={{ fontSize: 17, color: BK2, lineHeight: 1.7, marginBottom: 40, opacity: 0.75 }}>
            Start building with the right people today.
          </p>
          <button onClick={() => navigate('/signup')} style={{
            background: BK, color: Y,
            fontFamily: "'DM Sans',sans-serif", fontWeight: 900,
            fontSize: 16, padding: "16px 40px", borderRadius: 7,
            border: `2px solid ${BK}`, cursor: "pointer",
            boxShadow: `3px 3px 0 ${BK2}`,
            transition: "transform .15s, box-shadow .15s",
            width: "100%",
            maxWidth: "300px",
          }}
            onMouseEnter={e => { e.target.style.transform = "translate(-1px,-1px)"; e.target.style.boxShadow = `4px 4px 0 ${BK2}`; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `3px 3px 0 ${BK2}`; }}>
            Sign up now →
          </button>
        </div>
        <style>{`
          @media (max-width: 768px) {
            section {
              padding: 80px 20px !important;
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section id="join" style={{ background: Y, padding: "112px 48px", borderTop: `2px solid ${BK}`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* diagonal stripe decoration */}
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(0,0,0,0.04) 20px, rgba(0,0,0,0.04) 40px)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 540, margin: "0 auto" }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>⚡</div>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(32px,5vw,60px)", color: BK, letterSpacing: "-2.5px", lineHeight: 1.06, marginBottom: 16 }}>
          Your builder tribe<br />is <em style={{ fontStyle: "normal", textDecoration: `underline 5px ${BK}` }}>waiting.</em>
        </h2>
        <p style={{ fontSize: 17, color: BK2, lineHeight: 1.7, marginBottom: 40, opacity: 0.75 }}>
          Join the waitlist.
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, margin: "0 auto 12px", flexWrap: "wrap" }}>
          <input type="email" placeholder="your@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%", background: W,
              border: `2px solid ${BK}`, borderRadius: 7, padding: "13px 18px",
              fontSize: 14, color: BK, outline: "none",
              boxShadow: `3px 3px 0 ${BK}`,
            }} />
          <input type="tel" placeholder="Phone number (optional)"
            value={phone} onChange={e => setPhone(e.target.value)}
            style={{
              width: "100%", background: W,
              border: `2px solid ${BK}`, borderRadius: 7, padding: "13px 18px",
              fontSize: 14, color: BK, outline: "none",
              boxShadow: `3px 3px 0 ${BK}`,
            }} />
          <button type="submit" disabled={loading} style={{
            background: BK, color: Y,
            fontFamily: "'DM Sans',sans-serif", fontWeight: 900,
            fontSize: 14, padding: "13px 24px", borderRadius: 7,
            border: `2px solid ${BK}`, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: `3px 3px 0 ${BK2}`,
            transition: "transform .15s, box-shadow .15s",
            width: "100%",
          }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = "translate(-1px,-1px)"; e.target.style.boxShadow = `4px 4px 0 ${BK2}`; } }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `3px 3px 0 ${BK2}`; }}>
            {loading ? "Joining..." : "Join →"}
          </button>
        </form>
        {msg && <p style={{ fontSize: 13, color: ok ? BK2 : "#8B2000", fontWeight: 700, marginBottom: 12 }}>{msg}</p>}
        {!msg && <p style={{ fontSize: 12, color: BK2, opacity: 0.6 }}>No spam. Early access only.</p>}
      </div>
      <style>{`
        @media (max-width: 768px) {
          section {
            padding: 80px 20px !important;
          }
          form {
            max-width: 100% !important;
          }
          form input {
            padding: 16px 20px !important;
            font-size: 16px !important;
          }
          form button {
            padding: 16px 24px !important;
            font-size: 16px !important;
          }
        }
        @media (max-width: 480px) {
          section {
            padding: 60px 16px !important;
          }
          form {
            gap: 12px !important;
          }
          form input {
            padding: 14px 16px !important;
            font-size: 15px !important;
          }
          form button {
            padding: 14px 20px !important;
            font-size: 15px !important;
          }
          section h2 {
            font-size: 1.8rem !important;
          }
          section p {
            font-size: 15px !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: BK, borderTop: `2px solid ${BK}`, padding: "36px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/forge.png" alt="ForgeConnect" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "contain" }} />
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 900, color: CR }}>ForgeConnect<span style={{ color: Y }}>.</span></span>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {["Chat", "Survey", "Discover", "Events", "Offers", "Contact"].map(l => (
          <a key={l} href="#" style={{ fontSize: 12, color: MU2, transition: "color .2s" }}
            onMouseEnter={e => e.target.style.color = Y}
            onMouseLeave={e => e.target.style.color = MU2}>{l}</a>
        ))}
      </div>
      <div style={{ fontSize: 12, color: MU }}>@2026 ForgeConnect · Kanpur, India</div>
      <style>{`
        @media (max-width: 768px) {
          footer {
            padding: 24px 20px !important;
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          footer > div:nth-child(2) {
            justify-content: center;
            gap: 16px;
          }
        }
      `}</style>
    </footer>
  );
}

/* ─── ROOT ──────────────────────────────────── */
export default function VisitorPage() {
  useGlobalCSS();
  useReveal();
  return (
    <div style={{ background: CR, minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <StatsStrip />
      <section id="features" style={{ background: CR }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "80px 48px 0", textAlign: "center" }}>
          <Tag col={O}>Everything in one place</Tag>
          <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(28px,4vw,54px)", color: BK, marginTop: 18, letterSpacing: "-2px", lineHeight: 1.08 }}>
            Five features.<br />One <em style={{ color: O, fontStyle: "normal", textDecoration: `underline 4px ${Y}` }}>builder economy.</em>
          </h2>
        </div>
        {FEATURES.map((f, i) => <FeatureSection key={f.id} f={f} i={i} />)}
      </section>
      <Disciplines />
      <Quotes />
      <CTA />
      <Footer />
    </div>
  );
}