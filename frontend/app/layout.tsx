import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dstFont = localFont({
  src: "../public/fonts/belisa_plumilla.ttf",
  variable: "--font-dst",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DST Crock Pot Recipe Browser",
  description:
    "Browse Don't Starve Together Crock Pot recipes, filter by ingredients, and find the perfect dish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dstFont.variable} dark`}>
      <body className="min-h-screen">
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('dst-theme');
            if (t === 'light') document.documentElement.classList.remove('dark');
            else document.documentElement.classList.add('dark');
          } catch(e) {}
        ` }} />
        {children}
      </body>
    </html>
  );
}
