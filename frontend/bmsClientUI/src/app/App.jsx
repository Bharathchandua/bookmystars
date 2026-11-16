import React from "react";
import ClientAuthProvider from "./providers/ClientAuthProvider";
import ClientRouter from "./router";

export default function App() {
  return (
    <ClientAuthProvider>
      <ClientRouter />
    </ClientAuthProvider>
  );
}
