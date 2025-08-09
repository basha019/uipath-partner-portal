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
        {/* Global compact header present on every screen */}
        <header className="bg-primary-blue shadow-md">
          <div className="max-w-7xl mx-auto py-1 px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between flex-nowrap">
              <a href="/dashboard" className="text-white font-semibold text-lg hover:opacity-90">Dashboard</a>
              <div className="flex items-center gap-2">
                <a
                  href="/assessment"
                  className="px-3 py-1 text-sm font-medium text-white bg-primary-orange rounded-md hover:opacity-90"
                >
                  Retake Assessment
                </a>
                <a
                  href="/planner"
                  className="px-3 py-1 text-sm font-medium text-white bg-secondary-blue rounded-md hover:opacity-90"
                >
                  Regenerate Plan
                </a>
                <a
                  href="/login?logout=1"
                  className="px-3 py-1 text-sm font-medium text-white bg-gray-700 rounded-md hover:opacity-90"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
        </header>
        {children}
        <Chatbot /> 
      </body>
    </html>
  );
}
