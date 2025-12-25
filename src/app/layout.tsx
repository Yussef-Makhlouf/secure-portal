import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure Portal - TechNova",
  description: "Enterprise token-based access control system",
  icons: {
    icon: "/logo-13.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
