import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../../../features/bms/api/auth/authApi";
import Navbar from "../../Navbar.jsx";
import FooterAgency from "../../FooterAgency.jsx";
import ClientHero from "./ClientHero.jsx";
import ClientServicesRow from "./ClientServicesRow.jsx";
import ClientProvidesSection from "./ClientProvidesSection.jsx";
import ClientRegistrationForm from "./ClientRegistrationForm.jsx";
import ClientCTABanner from "./ClientCTABanner.jsx";
import ClientStatsBanner from "./ClientStatsBanner.jsx";
import "./become-client.css";

export default function BecomeClient() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.accountType === "CLIENT") {
      navigate("/client/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="bc-page">
      <Navbar isClientPartnerPage={true} />
      <main>
        <ClientHero />
        <ClientServicesRow />
        <ClientProvidesSection />
        <ClientRegistrationForm />
        <ClientCTABanner />
        <ClientStatsBanner />
      </main>
      <FooterAgency />
    </div>
  );
}
