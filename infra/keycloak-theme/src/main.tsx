import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";
import "./theme/generated/themes.css";

if (import.meta.env.DEV && !window.kcContext) {
  const { kcContextMock } = await import("./kcContextMock");
  window.kcContext = kcContextMock;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {!window.kcContext ? <h1>No Keycloak Context</h1> : <KcPage kcContext={window.kcContext} />}
  </StrictMode>
);
