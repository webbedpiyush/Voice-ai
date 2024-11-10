import type { Metadata } from "next";
import "./globals.css";
import "./button.css";
import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
  title: "Voice assistant",
  description: "voice ai for the web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
