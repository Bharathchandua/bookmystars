import React from "react";
import Navbar from "../../components/Navbar.jsx";
import FooterAgency from "../../components/FooterAgency.jsx";
import PartnerRegistrationForm from "../../components/ClientPartner/BecomePartner/PartnerRegistrationForm.jsx";

export default function PartnerRegisterPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar isClientPartnerPage={true} />
      <main style={{ flexGrow: 1, padding: "40px 0" }}>
        <PartnerRegistrationForm />
      </main>
      <FooterAgency />
    </div>
  );
}
