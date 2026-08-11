import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const description = "556 EEG dataset download units and a 17-sheet evidence workbook.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "BIG EEG DATA",
    description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "BIG EEG DATA",
      description,
      type: "website",
      url: origin,
    },
    twitter: {
      card: "summary_large_image",
      title: "BIG EEG DATA",
      description,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
