import React from "react";
import UserAuthProvider from "./providers/UserAuthProvider";
import UserRouter from "./router";

export default function App() {
  return (
    <UserAuthProvider>
      <UserRouter />
    </UserAuthProvider>
  );
}
