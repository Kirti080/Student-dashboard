import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettings() {
  return <AdminLayout title="Admin Settings" subtitle="Portal preferences and account information"><Card className="max-w-2xl rounded-3xl border-0 shadow-xl"><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Use the theme button in the page header to switch between light and dark mode. Administrative credentials are managed securely through the backend admin seed command.</p></CardContent></Card></AdminLayout>;
}
