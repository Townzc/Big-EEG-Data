import type { Metadata } from "next";
import "./globals.css";

const description = "A unified, provenance-aware catalog of public EEG and fMRI datasets for large-scale brain research.";
const metadataBase = new URL("https://big-eeg-data.vercel.app");

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase,
    title: "BIG DATA",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "BIG DATA",
      description,
      type: "website",
      url: metadataBase,
    },
    twitter: {
      card: "summary",
      title: "BIG DATA",
      description,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
