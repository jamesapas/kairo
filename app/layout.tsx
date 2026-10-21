import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kairo | AI Job Tracker & Career Copilot",
  description: "AI-powered job application tracker and career copilot. Track applications, analyze match scores, bridge skill gaps, and manage your career profile.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('kairo-theme');
                const isDark = theme === 'dark' || (!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.15}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb, 0 0 5px #3b82f6"
          zIndex={99999}
        />
        <ThemeProvider>
          <AuthModalProvider>
            {children}
          </AuthModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
