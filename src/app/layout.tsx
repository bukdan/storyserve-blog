import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "TheMag - Digital Magazine & Blog Platform",
  description: "Platform blog & majalah digital dengan konten berkualitas tinggi dari penulis-penulis terbaik.",
  keywords: ["blog", "magazine", "digital", "articles", "news"],
  authors: [{ name: "TheMag Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
