import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaConvert — Convert Anything. Anywhere. Instantly.",
  description: "AI-powered file conversion platform. PDF, image, audio, video and document tools in one place.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void text-ink font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
