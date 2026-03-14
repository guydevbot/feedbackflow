import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
