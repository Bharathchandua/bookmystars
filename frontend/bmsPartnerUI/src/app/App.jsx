import React from "react";
import PartnerAuthProvider from "./providers/PartnerAuthProvider";
import PartnerRouter from "./router";

export default function App() {
  return (
    <PartnerAuthProvider>
      <PartnerRouter />
    </PartnerAuthProvider>
  );
}
