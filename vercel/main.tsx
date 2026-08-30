import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const isFmriRoute = window.location.pathname === "/fmri" || window.location.pathname.startsWith("/fmri/");
const Page = lazy(isFmriRoute ? () => import("../app/fmri/page") : () => import("../app/page"));
document.title = isFmriRoute ? "Big Data of fMRI" : "Big Data of EEG";

createRoot(root).render(
  <StrictMode>
    <Suspense fallback={<main className="route-loading" aria-live="polite">Loading Big Data…</main>}>
      <Page />
    </Suspense>
  </StrictMode>,
);
