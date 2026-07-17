import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToasterProvider from "@/app/components/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tsecond Announcements",
  description: "Acknowledge company announcements in a tap.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
