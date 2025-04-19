import type { Metadata } from "next";
// Import Poppins font
import { Poppins } from "next/font/google";
import "./globals.css";

// Configure Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Include weights you'll use
});

export const metadata: Metadata = {
  title: "Spotify AI Avatar",
  description: "Generate an AI avatar based on your Spotify data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font class to body */}
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
