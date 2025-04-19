import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import SessionProviderWrapper from './SessionProviderWrapper'; // Import the wrapper
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
      <body className={poppins.className}>
        {/* Wrap children with the SessionProviderWrapper */}
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
