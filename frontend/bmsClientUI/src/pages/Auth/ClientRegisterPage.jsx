import React from "react";
import Navbar from "../../components/Navbar.jsx";
import FooterAgency from "../../components/FooterAgency.jsx";
import ClientRegistrationForm from "../../components/ClientPartner/BecomeClient/ClientRegistrationForm.jsx";

export default function ClientRegisterPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar isClientPartnerPage={true} />
      <main style={{ flexGrow: 1, padding: "40px 0" }}>
        <ClientRegistrationForm />
      </main>
      <FooterAgency />
    </div>
  );
}
