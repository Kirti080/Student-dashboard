import { useState } from "react";
import { useSelector } from "react-redux";
import { Bell, Check, Mail, Monitor, Moon, Sun, UserRound } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/ThemeContext";
import type { RootState } from "@/redux/reducers";

type PreferenceKey = "emailAlerts" | "studentUpdates" | "weeklySummary";

const preferenceDetails: Array<[PreferenceKey, string, string]> = [
  ["emailAlerts", "Email alerts", "Receive important portal and security notices."],
  ["studentUpdates", "Student updates", "Get notified when student records change."],
  ["weeklySummary", "Weekly summary", "Receive a weekly overview of portal activity."],
];

export default function AdminSettings() {
  const user = useSelector((root: RootState) => root.auth.user);
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>(() => {
    const stored = localStorage.getItem("adminPreferences");
    if (stored) {
      try { return JSON.parse(stored); } catch { /* use defaults */ }
    }
    return { emailAlerts: true, studentUpdates: true, weeklySummary: false };
  });

  const savePreferences = () => {
    localStorage.setItem("adminPreferences", JSON.stringify(preferences));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <AdminLayout title="Admin Settings" subtitle="Manage your account and portal preferences">
      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-12">
          <Card className="rounded-3xl border-0 bg-white/90 shadow-xl dark:bg-slate-900/90 lg:col-span-7">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-300"><UserRound className="h-5 w-5" /></div>
              <div><CardTitle>Administrator account</CardTitle><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your signed-in account details</p></div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Full name<Input value={user?.name || "Administrator"} readOnly className="rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-800" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Role<Input value="Portal Administrator" readOnly className="rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-800" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200 sm:col-span-2">Email address<div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={user?.email || "Not available"} readOnly className="rounded-xl border border-slate-200 bg-slate-50 pl-11 dark:border-slate-700 dark:bg-slate-800" /></div></label>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 sm:col-span-2">Account identity is managed by the secure authentication system.</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-white/90 shadow-xl dark:bg-slate-900/90 lg:col-span-5">
            <CardHeader className="pb-4"><CardTitle className="flex items-center gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-950"><Sun className="h-5 w-5" /></span>Appearance</CardTitle><p className="text-sm text-slate-500 dark:text-slate-400">Choose how the admin portal looks</p></CardHeader>
            <CardContent><div className="grid grid-cols-3 gap-3">
              {([['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'System']] as const).map(([value, Icon, label]) => (
                <button key={value} type="button" onClick={() => setTheme(value)} className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 text-sm font-bold transition ${theme === value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/60 dark:text-blue-200" : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}><Icon className="h-5 w-5" />{label}</button>
              ))}
            </div></CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-white/90 shadow-xl dark:bg-slate-900/90 lg:col-span-12">
            <CardHeader className="pb-4"><CardTitle className="flex items-center gap-3"><span className="rounded-xl bg-purple-100 p-2 text-purple-600 dark:bg-purple-950 dark:text-purple-300"><Bell className="h-5 w-5" /></span>Notifications</CardTitle><p className="text-sm text-slate-500 dark:text-slate-400">Control which administrative updates you receive</p></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
              {preferenceDetails.map(([key, label, detail]) => (
                <div key={key} className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-800">
                  <div><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p></div>
                  <button type="button" role="switch" aria-checked={preferences[key]} aria-label={label} onClick={() => setPreferences((current) => ({ ...current, [key]: !current[key] }))} className={`relative h-7 w-12 shrink-0 rounded-full transition ${preferences[key] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${preferences[key] ? "left-6" : "left-1"}`} /></button>
                </div>
              ))}
              </div>
              <div className="mt-5 flex justify-end"><Button onClick={savePreferences} className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700">{saved ? <><Check className="h-4 w-4" />Preferences saved</> : "Save notification preferences"}</Button></div>
            </CardContent>
          </Card>

          {/* <Card className="rounded-3xl border-0 bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-emerald-400" />Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-white/10 p-4"><KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" /><div><p className="text-sm font-bold">Protected administrator access</p><p className="mt-1 text-xs leading-5 text-blue-100/80">Your session is protected by authenticated admin-only routes. Sign out when using a shared device.</p></div></div>
              <div className="flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Account session is active</div>
            </CardContent>
          </Card> */}
      </div>
    </AdminLayout>
  );
}
