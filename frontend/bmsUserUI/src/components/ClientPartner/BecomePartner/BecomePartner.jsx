import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../../features/bms/api/auth/authApi";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import AgencyHero from "./AgencyHero.jsx";
import AgencyStrip from "./AgencyStrip.jsx";
import WhyChooseUs from "./WhyChooseUs.jsx";
import AgencyOpportunities from "./AgencyOpportunities.jsx";
import AgencyTestimonials from "./AgencyTestimonials.jsx";
import PartnerRegistrationForm from "./PartnerRegistrationForm.jsx";
import "./become-partner.css";

export default function BecomePartner() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.accountType === "PARTNER") {
      navigate("/partner/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="agency-page-container">
      <Navbar isClientPartnerPage={true} />
      <main>
        <AgencyHero />
        <AgencyStrip />
        <PartnerRegistrationForm />
        <WhyChooseUs />
        <AgencyOpportunities />
        <AgencyTestimonials />
      </main>

      <FooterAgency />
    </div>
  );
}
