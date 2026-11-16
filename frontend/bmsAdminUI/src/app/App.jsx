import React from "react";
import AppRouter from "./router.jsx";
import { AdminAuthProvider } from "./providers/AdminAuthProvider.jsx";

export default function App() {
  return (
    <AdminAuthProvider>
      <AppRouter />
    </AdminAuthProvider>
  );
}
