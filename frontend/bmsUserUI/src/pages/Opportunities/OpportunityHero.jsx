import chairImg from "../../assets/opp-hero-chair.png";

export default function OpportunityHero() {
  return (
    <div className="opp-hero">

      {/* LEFT: Title + Paragraph */}
      <div className="opp-hero-left">
        <h1 className="opp-hero-title">
          Find. Audition. <span className="pink">Get Cast.</span>
        </h1>
        <p className="opp-hero-sub">
          Explore the latest casting calls and opportunities that match your
          profile and skills.
        </p>
      </div>

      {/* RIGHT: Client chair image — not touching the border */}
      <div className="opp-hero-image">
        <img src={chairImg} alt="Book My Stars Director's Chair" />
      </div>

    </div>
  );
}
