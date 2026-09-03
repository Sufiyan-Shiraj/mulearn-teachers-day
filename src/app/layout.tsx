import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Teacher's Day Cards | mulearn ASI",
  description: "Create, personalize, and share handcrafted Teacher's Day cards for your mentors with mulearn ASI club.",
  keywords: ["Teacher's Day", "mulearn", "ASI", "personalized cards", "greeting cards", "student club"],
  openGraph: {
    title: "Teacher's Day Cards — mulearn ASI",
    description: "Make a Teacher's Day Card they'll always remember. Share heartfelt messages, photos, and handcrafted memories.",
    siteName: "Teacher's Day Cards",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col selection:bg-[#7A1F1F]/20 selection:text-[#7A1F1F]"
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-8">
            {children}
          </main>
          <AuthModal />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
