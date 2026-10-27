import React from "react";
import { ClipboardList, ArrowRight } from "lucide-react";
import Button from "../../common/Button.jsx";

export default function ClientCTABanner() {
  return (
    <section className="bc-cta">
      <div className="bc-cta-inner">
        <div className="bc-cta-icon">
          <ClipboardList size={72} />
        </div>
        <div className="bc-cta-text">
          <h3>Post Your Requirements. Get the Right Connections.</h3>
          <p>
            Share your project requirements and connect with verified talents,
            agencies, brands, and industry professionals to bring your vision to
            life.
          </p>
        </div>
        <Button 
          className="bc-cta-btn"
          onClick={() => {
            const el = document.getElementById("client-registration-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Post Requirements <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  );
}
