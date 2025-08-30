import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Relinkr - Fast Self-Hosted Link Shortener",
  description: "A blazingly fast, self-hosted link shortener with click tracking & QR codes. Deploy anywhere with Docker!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-auto">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Project Links
            </h3>
            <div className="flex justify-center space-x-8">
              <a
                href="https://github.com/knightsri/Relinkr/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                README
              </a>
              <a
                href="https://github.com/knightsri/Relinkr/blob/main/DESIGN.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Design Docs
              </a>
              <a
                href="https://github.com/knightsri/Relinkr/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                License
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
