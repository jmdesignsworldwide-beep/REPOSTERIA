import { AppShell } from "@/components/app-shell";
import { WelcomeOverlay } from "@/components/welcome/welcome-overlay";
import { esAdmin } from "@/lib/auth/acceso";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await esAdmin();
  return (
    <>
      <WelcomeOverlay />
      <AppShell isAdmin={admin}>{children}</AppShell>
    </>
  );
}
