import { AppShell } from "@/components/app-shell";
import { WelcomeOverlay } from "@/components/welcome/welcome-overlay";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WelcomeOverlay />
      <AppShell>{children}</AppShell>
    </>
  );
}
