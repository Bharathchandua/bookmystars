import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { makeovers } from "../data/siteData.js";
import Button from "./common/Button.jsx";

import Card from "./common/Card.jsx";

// Custom premium SVG Icons designed to perfectly match the UI design in the client's screenshot
// Increased sizes to width="54" and height="54" for a more prominent, premium display
const WingedPersonIcon = () => (
  <svg viewBox="0 0 100 100" width="54" height="54" fill="none" stroke="url(#makeover-grad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Head */}
    <circle cx="50" cy="24" r="6" />
    <circle cx="50" cy="12" r="2.5" fill="url(#makeover-grad)" /> {/* The tiny dot above the head */}
    {/* Body / Torso */}
    <path d="M50 30 C 46 36, 46 54, 50 60 C 54 54, 54 36, 50 30 Z" fill="none" />
    {/* Arms raised in V shape */}
    <path d="M50 36 L30 18 M50 36 L70 18" />
    {/* Hands (tiny circles at the end of the arms) */}
    <circle cx="30" cy="18" r="2" fill="url(#makeover-grad)" />
    <circle cx="70" cy="18" r="2" fill="url(#makeover-grad)" />
    {/* Symmetrical wings curving up and out */}
    <path d="M46 42 C 22 25, 10 28, 14 50 C 18 70, 42 76, 50 76" />
    <path d="M54 42 C 78 25, 90 28, 86 50 C 82 70, 58 76, 50 76" />
  </svg>
);

const AdShootIcon = () => (
  <svg viewBox="0 0 100 100" width="54" height="54" fill="none" stroke="url(#makeover-grad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Camera Body */}
    <rect x="26" y="36" width="48" height="30" rx="4" />
    {/* Lens */}
    <circle cx="50" cy="51" r="9" />
    <circle cx="47" cy="48" r="2.5" fill="url(#makeover-grad)" /> {/* Lens highlight */}
    {/* Top flash */}
    <path d="M40 36 L43 29 h14 L60 36" />
    {/* Brackets on the sides */}
    <path d="M18 42 C 12 46, 12 56, 18 60" />
    <path d="M82 42 C 88 46, 88 56, 82 60" />
  </svg>
);

const InfluencerIcon = () => (
  <svg viewBox="0 0 100 100" width="54" height="54" fill="none" stroke="url(#makeover-grad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Center Lens/Pupil */}
    <circle cx="50" cy="50" r="7" />
    {/* Outer Eye Outline */}
    <path d="M22 50 C 35 34, 65 34, 78 50 C 65 66, 35 66, 22 50 Z" />
    {/* Radiating Rays/Lashes */}
    <path d="M50 24v-8 M50 76v8 M20 50h-8 M80 50h8" />
    <path d="M29 29l-6-6 M71 71l6 6 M71 29l6-6 M29 71l-6 6" />
  </svg>
);

const makeoverIcons = [
  WingedPersonIcon, // Film & TV Makeover
  WingedPersonIcon, // Event Makeover
  WingedPersonIcon, // Dance Makeover
  AdShootIcon,      // Ad Shoot Makeover
  WingedPersonIcon, // Music Video Makeover
  InfluencerIcon,   // Influencer Makeover
];

export default function MakeoverSection() {
  const navigate = useNavigate();
  return (
    <>
      {/* SVG Gradient definition matching the original brand colors exactly (#DB0095 to #8100C3) */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <linearGradient id="makeover-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DB0095" />
          <stop offset="100%" stopColor="#8100C3" />
        </linearGradient>
      </svg>

      <section id="makeover" className="container makeover">
        <h5>
          MAKEOVER SERVICES{" "}
          <small>Look your best frame, stage and spotlight.</small>
          <Button 
            onClick={() => navigate("/services/makeover")} 
            style={{
              border: "0",
              color: "#fff",
              background: "linear-gradient(90deg, #DB0095, #8100C3)",
              fontSize: "11px",
              fontWeight: "700",
              borderRadius: "5px",
              padding: "5px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              marginLeft: "12px",
              textTransform: "none"
            }}
          >
            Explore Services <ArrowRight size={12} />
          </Button>
        </h5>
        <div className="make-grid">
          {makeovers.map((m, i) => {
            const IconComponent = makeoverIcons[i];
            return (
              <div className="make-col" key={m}>
                <Card className="make">
                  <IconComponent />
                  <h4>{m}</h4>
                  <p>
                    {
                      [
                        "On-screen look for movies, web series, ads & more.",
                        "Glamorous looks for events, red carpet, award nights.",
                        "Stage-ready looks for performances, reality shows & competitions.",
                        "Camera-ready looks for commercials, print & brand shoots.",
                        "Trendy & creative looks for music videos & artist promotions.",
                        "Stylish & impactful looks for digital creators & brand collaborations.",
                      ][i]
                    }
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}