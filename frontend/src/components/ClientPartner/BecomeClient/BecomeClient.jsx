import React from "react";
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
