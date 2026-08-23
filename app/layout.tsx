import type { Metadata } from "next";
import "./globals.css";

const description = "562 EEG dataset download units, a verified disease and health acquisition checklist, and a source-deduplicated NeuroAtlas comparison.";
const metadataBase = new URL("https://big-eeg-data.vercel.app");

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase,
    title: "BIG EEG DATA",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "BIG EEG DATA",
      description,
      type: "website",
      url: metadataBase,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "BIG EEG DATA" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BIG EEG DATA",
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
