import { getAcceso } from "@/lib/auth/acceso";
import { AjustesView } from "@/components/ajustes/ajustes-view";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const { username, email } = await getAcceso();
  return <AjustesView usuario={username || email || ""} />;
}
