import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NEXL",
  description: "Learning platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="flex gap-9">
          <Link href={"/"}>Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/signin">Sign In</Link>
          <Link href="/signup">Sign Up</Link>
        </nav>
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
