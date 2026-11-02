import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const castingTips = [
  {
    title: "Perfect Your Monologue",
    desc: "Practice your monologues in front of a mirror. Focus on expressions and emotions. Ensure clear articulation.",
  },
  {
    title: "Dress for the Character",
    desc: "Choose simple clothing that hints at the character's style without wearing an outright costume. Keep backgrounds plain.",
  },
  {
    title: "Slate with Confidence",
    desc: "Always start your self-tape by stating your name, height, location, and representation clearly with a pleasant smile.",
  },
  {
    title: "Analyze the Script Subtext",
    desc: "Look beyond the literal lines. Identify your character's objective, relationship, and what is at stake in the scene.",
  }
];

export default function CastingTips() {
  const [tipIndex, setTipIndex] = useState(0);

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % castingTips.length);
  };

  const handlePrevTip = () => {
    setTipIndex((prev) => (prev - 1 + castingTips.length) % castingTips.length);
  };

  return (
    <div className="ac-sidebar-card ac-tips-card">
      <div className="ac-sidebar-header">
        <h3>Casting Tips</h3>
        <PagesButton className="ac-view-all-link" style={{ padding: 0 }}>View All</PagesButton>
      </div>

      <div className="ac-tip-container animate-fadeIn">
        <div className="ac-tip-icon-wrapper">
          <Sparkles size={18} />
        </div>
        <h4 className="ac-tip-title">{castingTips[tipIndex].title}</h4>
        <p className="ac-tip-desc">{castingTips[tipIndex].desc}</p>
      </div>

      <div className="ac-tip-nav">
        <div className="ac-tip-dots">
          {castingTips.map((_, idx) => (
            <PagesButton
              key={idx}
              onClick={() => setTipIndex(idx)}
              className={`ac-tip-dot ${tipIndex === idx ? "active" : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="ac-tip-arrows">
          <PagesButton
            onClick={handlePrevTip}
            className="ac-tip-arrow-btn"
            aria-label="Previous Tip"
          >
            <ChevronLeft size={16} />
          </PagesButton>
          <PagesButton
            onClick={handleNextTip}
            className="ac-tip-arrow-btn"
            aria-label="Next Tip"
          >
            <ChevronRight size={16} />
          </PagesButton>
        </div>
      </div>
    </div>
  );
}
