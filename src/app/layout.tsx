import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard de Usuários",
  description: "Aplicação para gerenciamento de usuários",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen w-full flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[1440px] py-8">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
