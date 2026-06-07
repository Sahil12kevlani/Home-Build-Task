import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinpoint — Personal Bookmarks Dashboard",
  description: "A premium, beautiful personal bookmarks manager. Organize your web links, claim your custom public profile, and share your favorite bookmarks.",
  metadataBase: new URL("http://localhost:3000"), // Will be overridden by Vercel deployment URL
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
