import React, { useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaLinkedin, FaGlobe } from "react-icons/fa"; 

// Company brand
const BRAND_YELLOW = "#FFDB58"; // company color
const BRAND_BLACK = "#0a0a0a";

// Helper: compute the next occurrence of the 27th from "now"
function getNextMoveDate(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const targetThisMonth = new Date(year, month, 27, 10, 45, 0); // 10:00 local
  if (now <= targetThisMonth) return targetThisMonth;
  return new Date(year, month + 1, 27, 10, 45, 0);
}

function useCountdown(targetDate) {
  const [diff, setDiff] = useState(() => Math.max(0, targetDate.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, targetDate.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const parts = useMemo(() => {
    let delta = Math.floor(diff / 1000);
    const days = Math.floor(delta / (3600 * 24));
    delta -= days * 3600 * 24;
    const hours = Math.floor(delta / 3600);
    delta -= hours * 3600;
    const minutes = Math.floor(delta / 60);
    const seconds = delta - minutes * 60;
    return { days, hours, minutes, seconds };
  }, [diff]);

  return parts;
}

function downloadICS({ title, description, location, start, end }) {
  function pad(n) { return String(n).padStart(2, "0"); }
  function toICSDate(dt) {
    // Convert to UTC Z format
    return (
      dt.getUTCFullYear().toString() +
      pad(dt.getUTCMonth() + 1) +
      pad(dt.getUTCDate()) +
      "T" +
      pad(dt.getUTCHours()) +
      pad(dt.getUTCMinutes()) +
      pad(dt.getUTCSeconds()) +
      "Z"
    );
  }
  const uid = `${Date.now()}@company-move`;
  const dtstamp = toICSDate(new Date());
  const dtstart = toICSDate(start);
  const dtend = toICSDate(end);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Company//Office Move//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "office-move.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Simple confetti particles
function launchConfetti(durationMs = 2500) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = 0;
  container.style.top = 0;
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  const colors = [BRAND_YELLOW, "#ffffff", BRAND_BLACK];
  const count = 120;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = Math.random() * 8 + 6 + "px";
    p.style.height = Math.random() * 18 + 8 + "px";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = -20 + "px";
    p.style.opacity = String(0.8);
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.borderRadius = "2px";
    const fall = 70 + Math.random() * 30; // vh
    const drift = (Math.random() * 40 - 20) + "vw";
    const rot = 180 + Math.random() * 360;
    const time = 1.5 + Math.random() * 1.8;
    p.animate(
      [
        { transform: `translate(0, 0) rotate(0deg)` },
        { transform: `translate(${drift}, ${fall}vh) rotate(${rot}deg)` },
      ],
      { duration: time * 1000, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
    );
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), durationMs);
}

export default function OfficeMoveLanding() {
  const moveDate = useMemo(() => getNextMoveDate(), []);
  const endDate = useMemo(() => new Date(moveDate.getTime() + 60 * 60 * 1000), [moveDate]);
  const c = useCountdown(moveDate);
  const heroRef = useRef(null);

  useEffect(() => {
    launchConfetti(2000);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("reveal-show")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const moveDateLabel = moveDate.toLocaleString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const locationName = "Kosmo One - 6th Floor (Opulence spaces, One Indiabulls Park Tower,Tower-B)";
  const capacity = 30;

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", color: BRAND_BLACK, backgroundColor: "#fff" }}>
      {/* Inline brand styles */}
      <style>{`
        :root { --brand-yellow: ${BRAND_YELLOW}; --brand-black: ${BRAND_BLACK}; }
        html, body, #root { height: 100%; }
        .navbar-brand b { letter-spacing: 0.5px; }
        .hero {
          background: radial-gradient(1200px 600px at 10% 10%, rgba(255,219,88,0.45), transparent 60%),
                      radial-gradient(1000px 600px at 90% -10%, rgba(0,0,0,0.08), transparent 50%),
                      linear-gradient(180deg, #fff, #fff);
          position: relative;
          overflow: hidden;
        }
        .hero::after {
          content: "";
          position: absolute; inset: -20% -10% auto -10%; height: 120%;
          background: conic-gradient(from 180deg, var(--brand-yellow), #fff 30%, var(--brand-yellow) 60%, #fff 85%, var(--brand-yellow));
          opacity: 0.08; filter: blur(40px); transform: rotate(6deg);
        }
        .badge-brand { background: var(--brand-yellow); color: var(--brand-black); font-weight: 700; }
        .btn-brand { background: var(--brand-black); color: var(--brand-yellow); border: none; }
        .btn-brand:hover { background: #111; color: var(--brand-yellow); transform: translateY(-1px); }
        .btn-outline-brand { border: 2px solid var(--brand-black); color: var(--brand-black); background: transparent; }
        .btn-outline-brand:hover { background: var(--brand-black); color: var(--brand-yellow); }
        .card { border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .hover-lift { transition: transform .25s ease, box-shadow .25s ease; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.08); }
        .reveal { opacity: 0; transform: translateY(12px); transition: opacity .6s ease, transform .6s ease; }
        .reveal-show { opacity: 1; transform: translateY(0); }
        .countdown .time { font-size: clamp(1.5rem, 2.8vw, 2.6rem); font-weight: 800; }
        .countdown .label { font-size: .85rem; letter-spacing: .08em; text-transform: uppercase; color: #333 }
        .section-title { font-weight: 800; letter-spacing: -0.02em; }
        .divider { height: 3px; width: 72px; background: var(--brand-yellow); border-radius: 999px; }
        .timeline::before { content:""; position:absolute; left: 18px; top:0; bottom:0; width: 4px; background: linear-gradient(var(--brand-yellow), transparent); border-radius: 999px; }
        .timeline .dot { width: 14px; height: 14px; background: var(--brand-black); border: 3px solid var(--brand-yellow); border-radius: 999px; position: absolute; left: 12px; }
        .footer a { color: inherit; text-decoration: underline; text-decoration-color: var(--brand-yellow); }
      `}</style>

      {/* Navbar */}
      
          <nav
  className="navbar navbar-expand-lg sticky-top"
  style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
>
  <div className="container py-2">
    <a className="navbar-brand d-flex align-items-center gap-2" href="#top">
      <img
        src={require("./assets/Blogo.png")}
        alt="Bee Logo"
        style={{ height: "170px", width: "170px", objectFit: "contain" }}
      />
      <b>New Office Shift</b>
    </a>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navItems"
      aria-controls="navItems"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navItems">
      <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
        <li className="nav-item"><a className="nav-link" href="#details">Details</a></li>
        <li className="nav-item"><a className="nav-link" href="#when">When</a></li>
        <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
      </ul>
    </div>
  </div>
</nav>


      {/* Hero */}
      <header ref={heroRef} className="hero" id="top">
        <div className="container py-5">
          <div className="row align-items-center g-4 py-4">
            <div className="col-lg-7">
              <span className="badge badge-brand rounded-pill px-3 py-2 mb-3">Announcement</span>
              <h1 className="display-4 fw-bold lh-sm mb-3" style={{ color: BRAND_BLACK }}>
                We're moving to <span style={{ color: BRAND_BLACK, background: BRAND_YELLOW, boxShadow: `0 0 0 10px ${BRAND_YELLOW}` }}>Kosmo One</span>
              </h1>
              <p className="lead text-muted mb-4">
                A fresh chapter begins! Our {capacity}-seater workspace opens its doors at <b>{locationName}</b> on <b>{moveDateLabel}</b>.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-brand btn-lg px-4" onClick={() => downloadICS({
                  title: "Office Move Day – Kosmo One",
                  description: `We are moving to Kosmo One. ${capacity}-seater office. See you there!`,
                  location: locationName,
                  start: moveDate,
                  end: endDate,
                })}>
                  Save to Calendar
                </button>
              
                <a className="btn btn-outline-brand btn btn-lg px-4" href="#when">
                  Get Directions
                </a>
              </div>

              {/* Countdown */}
              <div className="countdown d-flex gap-4 mt-4">
                {[{k:"days", v:c.days},{k:"hours", v:c.hours},{k:"minutes", v:c.minutes},{k:"seconds", v:c.seconds}].map(({k,v}) => (
                  <div key={k} className="text-center">
                    <div className="time">{String(v).padStart(2,"0")}</div>
                    <div className="label">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card p-0 overflow-hidden border-0 hover-lift reveal">
                <div style={{ background: BRAND_BLACK, color: BRAND_YELLOW }} className="p-4">
                  <h5 className="mb-1">New Address</h5>
                  <p className="mb-0 small">{locationName}</p>
                </div>
                <div className="p-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-4 h-100">
                        <div className="small text-muted">Seating</div>
                        <div className="h4 m-0 fw-bold">{capacity} seats</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-4 h-100">
                        <div className="small text-muted">Move Date</div>
                        <div className="h5 m-0 fw-bold">27<sup>th</sup></div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3 rounded-4 h-100" style={{ background: BRAND_YELLOW }}>
                        <div className="small" style={{ color: BRAND_BLACK }}>Tip</div>
                        <div className="m-0" style={{ color: BRAND_BLACK }}>Update your calendars.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Details */}
      <section id="details" className="py-5">
        <div className="container">
          <div className="d-flex align-items-center gap-3 mb-3 reveal">
            <div className="divider"></div>
            <h2 className="section-title m-0">What to Expect</h2>
          </div>
          <p className="text-muted mb-4 reveal" style={{maxWidth:"62ch"}}>
            Our new {capacity}-seater office at <b>{locationName}</b> is designed for comfort and collaboration with improved meeting rooms, focus zones, and better connectivity.
          </p>

          <div className="row g-4">
            {[{
              title: "Bigger, Brighter Desks",
              text: "",
            }, {
              title: "Seamless Collaboration",
              text: "",
            }, {
              title: "Better Connectivity",
              text: "",
            }].map((card, i) => (
              <div key={i} className="col-md-4 reveal">
                <div className="card rounded-4 p-4 h-100 hover-lift">
                  <div className="mb-2" style={{ width: 48, height: 6, background: BRAND_YELLOW, borderRadius: 999 }} />
                  <h5 className="fw-bold">{card.title}</h5>
                  <p className="text-muted mb-0">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When & Where */}
      <section id="when" className="py-5 bg-light">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-6 reveal">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="divider"></div>
                <h2 className="section-title m-0">When & Where</h2>
              </div>
              <ul className="list-unstyled m-0">
                <li className="mb-3"><b>Date:</b> 27th Aug 2025</li>
                <li className="mb-3"><b>Time:</b> 10:45 A.M onwards</li>
                <li className="mb-3"><b>Location:</b> {locationName}</li>
              </ul>
              <div className="mt-3 d-flex gap-3">
                <button className="btn btn-brand" onClick={() => downloadICS({
                  title: "Office Move Day – Kosmo One",
                  description: `We are moving to Kosmo One. ${capacity}-seater office. See you there!`,
                  location: locationName,
                  start: moveDate,
                  end: endDate,
                })}>Add to Calendar</button>
                <a className="btn btn-outline-brand" href="https://maps.app.goo.gl/BZPCvE8MNUBkUesLA">See Map</a>
              </div>
            </div>
            <div className="col-lg-6 reveal" id="map">
              <div className="ratio ratio-4x3 rounded-4 overflow-hidden border" style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <iframe title="Kosmo One Map" src="https://www.google.com/maps?q=Kosmo+One&output=embed" allowFullScreen loading="lazy" style={{ border: 0 }} />
              </div>
              <div className="small text-muted mt-2">Map search: "Kosmo One"</div>
            </div>
          </div>
        </div>
      </section>

      {/* Move Timeline */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex align-items-center gap-3 mb-3 reveal">
            <div className="divider"></div>
            <h2 className="section-title m-0">27<sup>th</sup> Agenda</h2>
          </div>
          <div className="position-relative timeline ps-5">
            {[
              
              { t: "27th Morning", d: "Welcome Address By Founder & floor walkthrough." },
              { t: "27th Afternoon", d: "Setup verification, connectivity checks, badge access." },
              { t: "27th Evening", d: "Coffee Connect and Networking" },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ position: "relative", marginLeft: 0, paddingLeft: 32, marginBottom: 18 }}>
                <div className="dot" style={{ top: 4 }} />
                <h6 className="fw-bold m-0">{item.t}</h6>
                <p className="text-muted mb-2">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Contact */}
      <section id="contact" className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6 reveal">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="divider"></div>
                <h2 className="section-title m-0">Need Assistance?</h2>
              </div>
              <p className="text-muted" style={{maxWidth:"60ch"}}>For any queries, we're here to help.</p>
              <div className="d-flex flex-wrap gap-3">
                <a className="btn btn-brand" href="mailto:hr@bauratec.com?subject=Office%20Move%20Support">Email US</a>
                
              </div>
            </div>
           
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
  className="footer py-4"
  style={{ background: BRAND_BLACK, color: BRAND_YELLOW }}
>
  <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
    <div>
      Copyright © 2025 Bee Aura Tech Corporation, All Rights Reserved.
    </div>
    <div className="d-flex gap-3 align-items-center">
      <a href="#top" className="text-decoration-none" style={{ color: BRAND_YELLOW }}>
        Back to top
      </a>
      <a href="#when" className="text-decoration-none" style={{ color: BRAND_YELLOW }}>
        Event details
      </a>
      <a
        href="https://www.linkedin.com/company/bee-aura-tech-corp"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: BRAND_YELLOW, fontSize: "1.2rem" }}
      >
        <FaLinkedin />
      </a>
      <a
        href="https://bauratec.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: BRAND_YELLOW, fontSize: "1.2rem" }}
      >
        <FaGlobe />
      </a>
    </div>
  </div>
</footer>
    </div>
  );
}
