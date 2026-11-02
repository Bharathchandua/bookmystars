import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ctaChair from "../assets/cta-chair.jpg";
import Button from "./common/Button";

export default function CTA() {
  return (
    <section className="container cta">
      <div className="cta-left-image">
        <img src={ctaChair} alt="Director's Chair" className="cta-chair-img" />
      </div>
      <div className="cta-text">
        <h2>Ready to Take the Next Step?</h2>
        <p>
          Create your profile or post your project in just a few clicks.
          <br />
          Your next big opportunity is waiting!
        </p>
      </div>
      <div className="cta-buttons">
        <Link to="/join" style={{ textDecoration: "none" }}>
          <Button
            variant="create-profile"
            icon={<ArrowRight size={16} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }} />}
            iconPosition="right"
          >
            Create Your Profile
          </Button>
        </Link>
        <Link to="/become-client" style={{ textDecoration: "none" }}>
          <Button variant="post-casting">Post a Casting Call</Button>
        </Link>
      </div>
    </section>
  );
}