import { notFound } from "next/navigation";
import { getAcceso } from "@/lib/auth/acceso";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminView } from "@/components/admin/admin-view";
import type { Cuenta } from "@/lib/cuentas/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { rol } = await getAcceso();
  if (rol !== "admin") notFound(); // doble protección (además del middleware)

  const admin = createAdminClient();
  const { data } = await admin
    .from("cuentas")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminView initial={(data ?? []) as Cuenta[]} />;
}
