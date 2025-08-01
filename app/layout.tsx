import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Chatbot from "@/components/chatbot"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UiPath Partner Enablement Portal",
  description: "A portal for UiPath partners to assess their skills and get personalized training plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Chatbot /> 
      </body>
    </html>
  );
}
