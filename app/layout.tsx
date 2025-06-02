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
  title: "SoundCard - Your Musical DNA Visualized",
  description: "Transform your Spotify listening history into stunning AI-generated trading cards. Discover your musical DNA and share your unique sound profile.",
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
