import PagesButton from "../common/PagesButton";
// "Looking for something specific?" boost card — matches client screenshot

export default function BoostProfileCard() {
  return (
    <div className="opp-boost-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
        <div className="opp-boost-text">
          <p className="opp-boost-title">Looking for something specific?</p>
          <p className="opp-boost-sub">
            Post your profile and let casting directors find you for the right roles.
          </p>
        </div>
        {/* Rocket Emoji Icon */}
        <div className="opp-boost-icon">
          <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
            {/* Simple rocket illustration */}
            <ellipse cx="48" cy="44" rx="10" ry="14" fill="#fce7f3" />
            <path d="M32 8 C32 8 18 22 18 38 C18 46 26 52 32 54 C38 52 46 46 46 38 C46 22 32 8 32 8Z" fill="#ee008f" />
            <ellipse cx="32" cy="36" rx="6" ry="8" fill="#fff" opacity="0.4" />
            <path d="M22 50 C18 56 14 58 14 58 C14 58 18 54 24 52" fill="#f97316" />
            <path d="M42 50 C46 56 50 58 50 58 C50 58 46 54 40 52" fill="#f97316" />
            <circle cx="32" cy="30" r="4" fill="#fff" opacity="0.6" />
          </svg>
        </div>
      </div>
      <PagesButton className="opp-boost-btn">Boost My Profile</PagesButton>
    </div>
  );
}
