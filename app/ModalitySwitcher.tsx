/* eslint-disable @next/next/no-html-link-for-pages -- the production Vercel build is a two-route Vite SPA */

type Modality = "eeg" | "fmri";

export function ModalitySwitcher({ active }: { active: Modality }) {
  return (
    <nav className="modality-switcher" aria-label="选择脑成像模态">
      <a className={active === "eeg" ? "active" : ""} href="/" aria-current={active === "eeg" ? "page" : undefined}>EEG</a>
      <span aria-hidden="true">|</span>
      <a className={active === "fmri" ? "active" : ""} href="/fmri" aria-current={active === "fmri" ? "page" : undefined}>fMRI</a>
    </nav>
  );
}
