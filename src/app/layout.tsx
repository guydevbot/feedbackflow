import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FeedbackFlow — Customer Feedback Portal",
  description:
    "Submit ideas, vote on features, and track the product roadmap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>{children}</body>
    </html>
  );
}
