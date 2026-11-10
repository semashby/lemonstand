import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lemonstand · juice workshops and tastings",
  description: "Book a juice workshop, a private tasting or a kids lemonade class.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-amber-50 text-stone-900">
        <header className="border-b-2 border-stone-900 bg-yellow-300">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="text-xl font-black tracking-tight">🍋 Lemonstand</Link>
            <Nav />
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-stone-300 py-6 text-center text-sm text-stone-500">
          Lemonstand, Nijmegen · a practice app for Ship It Safe by Zexy Studios
          {" · "}<a href="/privacy" className="underline">Privacy</a>
        </footer>
      </body>
    </html>
  );
}
