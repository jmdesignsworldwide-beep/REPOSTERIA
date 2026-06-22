import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repostería",
  description: "Aplicación de repostería conectada a Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
