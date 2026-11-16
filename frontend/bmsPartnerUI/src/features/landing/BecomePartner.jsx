import React from "react";
import PartnerNavbar from "../../components/layout/PartnerNavbar.jsx";
import PartnerFooter from "../../components/layout/PartnerFooter.jsx";
import AgencyHero from "./AgencyHero.jsx";
import AgencyStrip from "./AgencyStrip.jsx";
import WhyChooseUs from "./WhyChooseUs.jsx";
import AgencyOpportunities from "./AgencyOpportunities.jsx";
import AgencyTestimonials from "./AgencyTestimonials.jsx";
import PartnerRegistrationForm from "./PartnerRegistrationForm.jsx";
import "./become-partner.css";

export default function BecomePartner() {
  return (
    <div className="agency-page-container">
      <PartnerNavbar />
      <main>
        <AgencyHero />
        <AgencyStrip />
        <PartnerRegistrationForm />
        <WhyChooseUs />
        <AgencyOpportunities />
        <AgencyTestimonials />
      </main>

      <PartnerFooter />
    </div>
  );
}
