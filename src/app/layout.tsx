import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadForGen - All-in-One Lead Gen & Service Business Platform",
  description:
    "Capture leads, book appointments, send quotes, manage customers, and automate with AI. The all-in-one platform for local service businesses.",
  authors: [{ name: "LeadForGen" }],
  openGraph: {
    title: "LeadForGen - Run Your Entire Service Business From One Platform",
    description:
      "Lead generation, booking, quoting, CRM, AI assistant, and white-labeled websites in one platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
