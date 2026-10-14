import React from "react";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import AgencyHero from "./AgencyHero.jsx";
import AgencyStrip from "./AgencyStrip.jsx";
import WhyChooseUs from "./WhyChooseUs.jsx";
import AgencyOpportunities from "./AgencyOpportunities.jsx";
import AgencyTestimonials from "./AgencyTestimonials.jsx";
import "./become-partner.css";

export default function BecomePartner() {
  return (
    <div className="agency-page-container">
      <Navbar isClientPartnerPage={true} />
      <main>
        <AgencyHero />
        <AgencyStrip />
        <WhyChooseUs />
        <AgencyOpportunities />
        <AgencyTestimonials />
      </main>

      <FooterAgency />
    </div>
  );
}
